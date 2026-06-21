# Plan: Move Ollama model storage to the `mouse` ZFS pool

**Status:** 📝 PLANNED (2026-06-20) — not yet executed. Requires an LXC 101 restart
(maintenance window) to add the new mount point.

## Why

The `llm_ollama` Docker named volume was wiped (most likely a `docker compose down -v`
during the GPU passthrough work — volume recreated `2026-06-18T04:23:39Z`, blobs empty,
no orphaned copies anywhere on the LXC). No models are currently present and there are no
backups. Rather than re-pull into the same throwaway named volume, relocate model storage
to a **dedicated ZFS dataset on the `mouse` pool** so it is:

- **Off the named volume** → a stray `down -v` can no longer silently delete models.
- **Snapshot-able / on the big pool** → `mouse` has ~801 GB free vs. the 64 GB LXC rootfs.

## How Ollama stores models (background)

Everything lives under `/root/.ollama` in the container (`$HOME/.ollama`; overridable via
`OLLAMA_MODELS`, default `$HOME/.ollama/models`):

- `models/blobs/` — content-addressed `sha256-<hash>` weight files (the big data).
- `models/manifests/` — small JSON tag→blob maps (e.g. `llama3.1:8b`).

We bind-mount the **whole `/root/.ollama`** (simplest; keeps blobs + manifests + keys
together) rather than only `OLLAMA_MODELS`. Models are read sequentially into RAM/VRAM, so
sequential throughput matters, not IOPS → an HDD dataset with `recordsize=1M` + `lz4` is a
good fit. (Refs: Ollama FAQ; glukhov.org Ollama-in-Compose; community migration guides.)

## The storage chain (why this is 3 layers, not 1)

Ollama runs in Docker **inside LXC 101** on **ZFS**, so the path must be plumbed through
all three layers:

```
mouse/ollama (ZFS dataset on pve)
  → /mnt/ollama in LXC 101            (101.conf mp3 bind mount)
    → /root/.ollama in container      (compose bind mount)
```

Current state: `mp0 /tank/docker`, `mp1 /tank/userdata`, `mp2 /mouse/media`. We add `mp3`.

---

## Execution steps

### Layer 1 — Host (`pve`, `root@10.0.0.20`): create the dataset

```bash
zfs create mouse/ollama
zfs set recordsize=1M compression=lz4 mouse/ollama
# Match ownership to what the container writes as (ollama runs as root → uid/gid 0 in a
# privileged LXC maps to host root, so default ownership is fine; verify after first pull).
zfs list mouse/ollama   # confirm mounted at /mouse/ollama
```

### Layer 2 — LXC config (`/etc/pve/lxc/101.conf` on pve): add the mount point

Add alongside the existing `mp*` lines:

```
mp3: /mouse/ollama,mp=/mnt/ollama
```

Also mirror this into the repo copy `proxmox/docker/101.conf` (source of truth).

⚠️ **This requires restarting LXC 101**, which brings down ALL Docker stacks
(Pi-hole/LAN DNS, NextCloud, Plex, nginx/reverse-proxy, etc.). Do it in a maintenance
window. Adding an `mp` line does not hot-plug reliably — plan on a full container restart:

```bash
# on pve, after editing 101.conf:
pct stop 101 && pct start 101
# verify the mount landed inside the LXC:
pct exec 101 -- df -h /mnt/ollama
```

> Bring the `nginx` stack up first after restart (it owns `homelab_shared_net`); confirm
> Pi-hole/DNS is healthy before declaring done.

### Layer 3 — Compose (`proxmox/docker/llm/compose.yaml`): point ollama at the bind mount

Change the `ollama` service volume:

```yaml
    volumes:
      - /mnt/ollama:/root/.ollama   # was: ollama:/root/.ollama
```

And remove the now-unused top-level named volume declaration:

```yaml
volumes:
  ollama:          # <-- delete this line (open-webui + valkey-data2 stay)
  open-webui:
  valkey-data2:
```

Deploy on LXC 101:

```bash
cd /home/shawn/homelab/proxmox/docker/llm
docker compose up -d ollama
# optional cleanup of the empty old named volume once confirmed working:
docker volume rm llm_ollama   # only after verifying the new mount works
```

### Verify

```bash
# GPU still visible (should already be — driver 550.163.01, GTX 1070 8GB):
docker exec ollama nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
# pull a model and confirm it lands on the mouse pool:
docker exec ollama ollama pull llama3.1:8b
docker exec ollama ollama list
ls /mnt/ollama/models/blobs           # blobs present here
zfs list mouse/ollama                 # USED grows on the host dataset
```

## Notes / caveats

- **VRAM ceiling:** GTX 1070 = 8 GB. 7B–8B models at ~Q4 (~4–5 GB) fit on-GPU; larger models
  spill to CPU. Storage location doesn't change this — it's purely where blobs sit at rest.
- **Recordsize on existing data:** `recordsize` only applies to newly written files, so set it
  on the empty dataset *before* pulling (done in Layer 1).
- **No data migration needed** — there are currently zero models to move.

## After execution (info-architecture follow-ups)

- Graduate the stable facts (new `mp3`, ollama bind mount) into the top-level `README.md`
  storage-chain section; update the `llm` stack row if needed.
- Append a short entry to the Notion "📑 Homelab Log" (use the `homelab-log` skill).
- Re-pull whatever models are wanted (see suggestions in chat) once the mount is live.
