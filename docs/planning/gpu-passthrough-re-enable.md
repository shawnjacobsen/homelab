# Plan: Safely Re-enable GPU Passthrough (without bricking boot)

**Status:** PLANNED (not yet executed)

**Context:** After an apartment move + GPU reshuffle, the Proxmox host hung at boot on
`VFIO - User Level meta-driver version: 0.3`. Root cause: GPUs were swapped between
PCI slots, so VFIO bound the wrong card / the host's console GPU got claimed by
`vfio-pci`. Recovered by disabling VT-d (and VT-x) in BIOS. GPU is currently disabled
everywhere (intended to be dedicated to a planned Win11 VM); Plex + Ollama run CPU-only.

## Current state (as of this plan)
- **BIOS:** VT-x DISABLED, VT-d DISABLED (both turned off during recovery)
- **`proxmox/docker/101.conf`:** all `lxc.mount.entry` / `cgroup2` NVIDIA lines commented out
- **`plex/compose.yaml`:** `NVIDIA_VISIBLE_DEVICES=all` (won't work without passthrough)
- **`llm/compose.yaml` (ollama):** `NVIDIA_VISIBLE_DEVICES=0`, `runtime: nvidia` (CPU-only until restored)

## The hazard
Re-enabling VT-d *before* the Win11 VM's `hostpci` line points at the GPU's CURRENT
(post-swap) PCI address is exactly what bricked the boot. If that VM is set to
auto-start, it grabs the GPU before we can intervene.

## Safe re-enable sequence
1. Re-enable **VT-x only** (CPU virtualization; no passthrough risk). Confirm host boots + networking is up.
2. SSH to Proxmox (`ssh homelab`) and gather facts BEFORE enabling VT-d:
   - `lspci -nn | grep -i nvidia`        # current PCI addresses + vendor:device IDs
   - `qm list`                           # find the Win11 VM id
   - `qm config <vmid> | grep -iE 'hostpci|onboot'`
   - `cat /etc/default/grub`             # vfio-pci ids= and iommu= args
   - `lsmod | grep -E 'vfio|nvidia'`
3. `qm set <vmid> --onboot 0`            # stop the passthrough VM auto-starting
4. Update the VM's `hostpciN:` to the GPU's CURRENT PCI address from step 2.
5. (If the LXC should get a GPU instead) uncomment the NVIDIA lines in `101.conf` and restart LXC 101.
6. Re-enable **VT-d** in BIOS, reboot, confirm host comes up + networking healthy BEFORE starting any VM.
7. Test in LXC before starting the VM: `ssh docker`, `ls /dev/nvidia*`,
   `docker restart ollama && docker exec ollama nvidia-smi`.

## Decision still open
- Does the GTX 1070 go to the LXC (Plex/Ollama) or the Win11 VM? The Notion architecture
  doc says 1070 → LXC, 1060 → VM. Confirm which cards are physically installed now after the swap.
