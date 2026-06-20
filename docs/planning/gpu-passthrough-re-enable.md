# Plan: GPU Passthrough to Docker LXC (single consumer, no VM)

**Status:** ✅ DONE (2026-06-20) — GTX 1070 live in LXC 101; Ollama on CUDA, Plex NVENC/NVDEC.

> ## Resolution — how it actually went (read this first)
> The phased plan below was mostly **already satisfied** by the time we executed: a host
> reboot brought the card back, the host NVIDIA driver (`550.163.01`) was already installed,
> and the LXC userland already matched. So Phase 0/2/4 needed **no work**.
>
> The real gap was the **Docker → container layer**, in two parts:
> 1. **`/etc/nvidia-container-runtime/config.toml` on the LXC → `no-cgroups = true`.** The
>    toolkit can't manage cgroups inside an LXC. (Host-only file; not version-controlled.)
> 2. **Compose files were deliberately CPU-only.** Ollama was pinned to
>    `NVIDIA_VISIBLE_DEVICES=void` with `runtime: nvidia` commented; Plex had its NVIDIA env
>    commented out. Re-enabled both **and** added explicit `devices:` for
>    `/dev/nvidia0`,`/dev/nvidiactl`,`/dev/nvidia-uvm` — required because with `no-cgroups=true`
>    the runtime injects libraries but no longer grants cgroup device perms, so without the
>    explicit device list the container hits `Failed to initialize NVML: Unknown Error`.
>    (commit `151f9c7`).
>
> **Phase 1 (VFIO teardown) — DONE 2026-06-20.** Stripped the kernel cmdline to `quiet`,
> removed `vfio.conf` + `iommu_unsafe_interrupts.conf`, removed the `vfio*` lines from
> `/etc/modules`, ran `update-grub` + `update-initramfs -u -k all`, and rebooted. Host now boots
> clean with `Kernel driver in use: nvidia` and **vfio not loaded**. VT-d stays **off**. Backups
> in `/root/vfio-teardown-bak/`.
>
> **Phase 3 (`101.conf` bind-mounts) — DONE, and it WAS necessary** (initial hunch that the
> nodes reach the LXC without it was wrong). Root cause found on the post-reboot regression:
> `/dev/nvidia-uvm` is created **lazily on first CUDA use**, so on a cold boot it exists on
> neither host nor LXC, and the containers' `devices:` mapping fails with
> `error gathering device information ... /dev/nvidia-uvm: no such file or directory` (exit 128).
> Fixed with two complementary pieces:
> - **Host `nvidia-uvm-init.service`** (oneshot, `ExecStart=/usr/bin/nvidia-modprobe -c 0 -u`,
>   ordered `Before=pve-guests.service`) → creates `/dev/nvidia-uvm` before the LXC autostarts.
> - **`101.conf` `lxc.mount.entry`** bind-mounts (repo + live) → pipe the host `/dev/nvidia*`
>   (incl. `uvm`) into the LXC deterministically. Majors are dynamic so left unpinned.

---

## Original plan (kept for reference)

**Status:** PLANNED — blocked on Phase 0 (GPU not currently enumerated on the host)

**Goal:** Expose the NVIDIA **GTX 1070** to **LXC 101** and its Docker containers so
**Plex** can hardware-transcode (NVENC/NVDEC) and **Ollama** can run models on the GPU
(CUDA). The Docker LXC is the **sole** GPU consumer — **no Windows VM, no VFIO**.

---

## Architecture decision: device-node passthrough, NOT VFIO

VFIO/`vfio-pci` is only needed to hand a whole GPU to a **virtual machine**. An **LXC
shares the host kernel**, so the correct (and simpler) approach is:

```
Proxmox host loads the NVIDIA driver  →  creates /dev/nvidia* device nodes
        │
        └── 101.conf bind-mounts those nodes into the privileged LXC
                │
                └── LXC has matching NVIDIA userland + nvidia-container-toolkit
                        │
                        └── Docker (nvidia runtime) exposes the GPU to Plex & Ollama
```

Consequences:
- **IOMMU / VT-d are NOT required.** They can stay **disabled** in BIOS. This removes the
  exact failure mode that bricked boot earlier (host hanging at `VFIO ... 0.3` while
  binding a GPU). VT-x is optional (not used by LXC).
- We must **tear down the leftover VFIO config** so the host's NVIDIA driver — not
  `vfio-pci` — claims the card.

---

## Current state (discovered via live SSH inspection)

### Proxmox host (`ssh homelab`, 10.0.0.20)
- Proxmox **8.4.1**, kernel **6.8.12-11-pve**.
- **GTX 1070 is NOT enumerated** — `lspci` shows **no** display/3D device. ⚠️ blocker.
- Configured for VFIO of the 1070 (vestigial — there is no VM):
  - `/etc/modprobe.d/vfio.conf` → `options vfio-pci ids=10de:1b81,10de:10f0 disable_vga=1`
    - `10de:1b81` = GTX 1070 (GP104); `10de:10f0` = its HDMI audio function.
  - `/etc/modprobe.d/iommu_unsafe_interrupts.conf` present.
  - Kernel cmdline: `intel_iommu=on iommu=pt pcie_acs_override=downstream,multifunction nofb nomodeset video=vesafb:off,efifb:off`
  - `vfio`, `vfio_pci`, `vfio_iommu_type1` modules loaded.
- **No NVIDIA driver** on host: `nvidia-smi` fails, no `/dev/nvidia*`, no nvidia major in `/proc/devices`.
- **`qm list` is empty** — no VMs defined. Nothing depends on the VFIO setup.

### Docker LXC 101 (`ssh docker`, 10.0.0.30)
- **`nvidia-container-toolkit` 1.17.8 installed**; Docker **Default Runtime = nvidia** (already done).
- **No NVIDIA driver userland** (only the container toolkit) — `nvidia-smi` fails.
- All stacks running (plex, ollama, open-webui, etc.).
- LXC is **privileged** with `lxc.cgroup2.devices.allow: a` (all devices already permitted)
  and `nesting=1` — good, no privilege changes needed.

### Compose (repo)
- `proxmox/docker/plex/compose.yaml`: `NVIDIA_VISIBLE_DEVICES=all`,
  `NVIDIA_DRIVER_CAPABILITIES=compute,video,utility`, but **no explicit `runtime: nvidia`**
  (it currently inherits the nvidia default runtime).
- `proxmox/docker/llm/compose.yaml` (ollama): `runtime: nvidia`, `NVIDIA_VISIBLE_DEVICES=0` — fine for a single GPU.

---

## Context still to gather (and how)

| Needed | How to get it | When |
|--------|---------------|------|
| **Is the 1070 physically enumerated?** | `ssh homelab 'lspci -nn \| grep -i 10de'` → must show `10de:1b81` | Phase 0 (gate) |
| nouveau loaded / blacklisted? | `lsmod \| grep nouveau`; `ls /etc/modprobe.d/` | Phase 1 |
| vfio listed in `/etc/modules`? | `cat /etc/modules` | Phase 1 |
| Chosen host driver version | decide a Pascal-supported branch (e.g. 535.x / 550.x); **record it** — LXC must match | Phase 2 |
| Device-node majors (dynamic!) | after driver install: `grep nvidia /proc/devices`; `ls -l /dev/nvidia*` | Phase 3 |

---

## Implementation phases

### Phase 0 — GPU enumeration gate (BLOCKER)
1. `ssh homelab 'lspci -nn | grep -i 10de'` — expect `10de:1b81` (1070) + `10de:10f0` (audio).
2. If empty: power down, **reseat the 1070**, verify the PCIe slot is **enabled** in BIOS
   and not configured as VM-only/disabled; confirm the card has power. Re-check `lspci`.
3. **Do not proceed** until `lspci` lists the 1070.

### Phase 1 — Tear down the leftover VFIO config (host)
> Back up first: `cp /etc/pve/lxc/101.conf /root/101.conf.bak` and note current grub line.
1. Remove the vfio binding so the NVIDIA driver can claim the card:
   - `rm /etc/modprobe.d/vfio.conf` (or comment out the `options vfio-pci ids=...` line).
   - Optionally `rm /etc/modprobe.d/iommu_unsafe_interrupts.conf`.
   - Check `/etc/modules` and remove any `vfio*` lines.
2. Clean the kernel cmdline in `/etc/default/grub` — set
   `GRUB_CMDLINE_LINUX_DEFAULT="quiet"`. **Must** drop `nomodeset`,
   `video=vesafb:off,efifb:off`, `nofb` (these stop the host using the GPU) and the
   no-longer-needed `pcie_acs_override` / `intel_iommu=on iommu=pt`.
3. `update-grub && update-initramfs -u -k all`.

### Phase 2 — Install the NVIDIA driver on the Proxmox host
1. Ensure nouveau is blacklisted (the NVIDIA installer does this).
2. Install a Pascal-supported driver (NVIDIA `.run` installer recommended so the version
   can be matched exactly in the LXC). **Record the exact version.**
3. **Reboot.** Verify:
   - `nvidia-smi` lists the GTX 1070.
   - `ls -l /dev/nvidia*` shows `nvidia0`, `nvidiactl`, `nvidia-uvm`, `nvidia-modeset`, `nvidia-caps/*`.
   - `grep nvidia /proc/devices` — **note the major numbers** for the next phase.

### Phase 3 — Pass device nodes into LXC 101
Edit **both** the repo `proxmox/docker/101.conf` **and** the live `/etc/pve/lxc/101.conf`
(the repo is not auto-applied). Uncomment the GPU block (the lines already present,
commented). The essential lines are the bind mounts:
```
lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-modeset dev/nvidia-modeset none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm-tools dev/nvidia-uvm-tools none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-caps/nvidia-cap1 dev/nvidia-caps/nvidia-cap1 none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-caps/nvidia-cap2 dev/nvidia-caps/nvidia-cap2 none bind,optional,create=file
```
- The `lxc.cgroup2.devices.allow: c <major>:* rwm` lines are **redundant** here because the
  live config already has `lxc.cgroup2.devices.allow: a` (all devices). Keep them only as
  documentation; verify majors from Phase 2 if you do.
- Apply: `pct stop 101 && pct start 101`.

### Phase 4 — NVIDIA userland inside the LXC (must match host version)
1. Install the **same** driver version as the host, **without** the kernel module:
   `./NVIDIA-Linux-x86_64-<version>.run --no-kernel-module`.
2. Verify inside the LXC: `nvidia-smi` lists the GTX 1070.
3. Confirm Docker sees it: `docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi`
   (runtime is already the nvidia default).

### Phase 5 — Compose changes + redeploy
- `plex/compose.yaml`: add `runtime: nvidia` explicitly (defensive/portable; keep the
  existing `NVIDIA_VISIBLE_DEVICES=all` + capabilities).
- `llm/compose.yaml` (ollama): already correct (`runtime: nvidia`, device 0).
- Redeploy: `cd .../plex && docker compose up -d` and `cd .../llm && docker compose up -d`.

---

## Files this plan touches

| File | Change | In repo? |
|------|--------|----------|
| `proxmox/docker/101.conf` | uncomment GPU `lxc.mount.entry` lines | ✅ (also copy to live `/etc/pve/lxc/101.conf`) |
| `proxmox/docker/plex/compose.yaml` | add `runtime: nvidia` | ✅ |
| `proxmox/docker/llm/compose.yaml` | none (verify only) | ✅ |
| `/etc/modprobe.d/vfio.conf` | remove | ❌ host-only (document here) |
| `/etc/modprobe.d/iommu_unsafe_interrupts.conf` | remove | ❌ host-only |
| `/etc/default/grub` | strip vfio/nomodeset params | ❌ host-only |
| `/etc/modules` | remove vfio lines if present | ❌ host-only |

> Host-only files aren't version-controlled. Record the before/after of each in the
> Homelab Log when executed so the change is traceable.

---

## Acceptance criteria

- [ ] **Host enumerates GPU:** `lspci -nn | grep 10de` shows `10de:1b81`.
- [ ] **Host driver works:** `nvidia-smi` on the host lists the GTX 1070; `/dev/nvidia*` exist; `vfio-pci` no longer bound to it.
- [ ] **LXC sees GPU:** `ssh docker 'nvidia-smi'` lists the GTX 1070.
- [ ] **Docker sees GPU:** `docker run --rm --gpus all nvidia/cuda:*-base nvidia-smi` succeeds in the LXC.
- [ ] **Plex HW transcode:** Plex *Settings → Transcoder* shows hardware transcoding; a forced
      transcode shows `(hw)` in the Plex dashboard and a `Plex Transcoder` process in
      `nvidia-smi`.
- [ ] **Ollama on GPU:** `docker exec ollama nvidia-smi` lists the GPU; running a model shows
      `ollama ps` at ~100% GPU (or logs offloading layers) and VRAM use in `nvidia-smi`.
- [ ] **Stability:** host boots cleanly and LAN/Tailscale networking is healthy across two
      reboots; no other stack regresses.
- [ ] **BIOS:** VT-d may remain disabled (confirmed not required for this design).

---

## Risks & rollback
- **Lower risk than VFIO** — nothing binds a GPU at boot, so a misconfig won't hang boot the
  way it did before. Worst case the host simply has no GPU until fixed.
- **Driver version mismatch** (host vs LXC) is the most common failure → `nvidia-smi` works on
  the host but fails in containers. Fix by installing identical versions.
- **Rollback:** restore `101.conf` from `/root/101.conf.bak`; the GPU block stays commented;
  re-add nothing VFIO-related (no VM needs it). Keep an LXC config backup before editing.
