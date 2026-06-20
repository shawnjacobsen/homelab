# Shawn's Home Lab
*My personal setup for on-premise, local services and experimentation*

## Overview

My homelab runs essential home services while serving as a platform for exploring enterprise technologies. Built on an Intel Xeon E5-2640 v3 system with ZFS storage and Proxmox virtualization, it provides file hosting, media streaming, AI services, and secure remote access through containerized applications.

## Information Architecture — Where Everything Lives

Each fact has a single home. Before writing something down, put it in the right place and don't duplicate it elsewhere — overlapping copies drift out of sync and cause inaccuracies.

| Store | Visibility | Holds | Does NOT hold |
|-------|-----------|-------|---------------|
| **`README.md`** (this file) | repo / GitHub | Current-state specific configs, how-tos, file & path locations, access methods, troubleshooting — and this matrix | Secrets; the dated changelog; planning/scratch notes |
| **`CLAUDE.md`** | repo | AI-agent operating guidelines, guardrails, routing rules | Architecture/config detail (links here instead); secrets |
| **`docs/`** | repo | Planning, design decisions, in-progress runbooks, working notes/memory | Secrets; stable current-state facts (those graduate into this README); the dated changelog |
| **`.docs.local/`** | gitignored | Sensitive / external API specs (e.g. `tailscale-api.json`) | Anything meant to be version-controlled |
| **`.env`, `*.env*`** | gitignored | Secrets, tokens, credentials | Ever committed |
| **Notion — [Homelab Architecture v3.0](https://app.notion.com/p/2076f656231080298a6ff44565f476c5)** | public | High-level/general architecture, hardware reference, conceptual topology & rationale (non-sensitive) | Specific configs, file paths, secrets, how-tos, dated changes |
| **Notion — 📑 Homelab Log** | public | Kinetic dated changelog: what was done & why, high-level | Detailed configs, secrets, planning, current-state spec |
| **Live state** (Proxmox + Docker on LXC 101) | — | The truth for what's *actually running* (check via SSH / `docker`) | — |

> When the repo / live state and Notion disagree, **the repo and live state win.** Treat Notion as general background and chronological history.

## Hardware

### **Proxmox Host (pve)**
- **CPU**: Intel Xeon E5-2640 v3 (8-core, 2.6GHz)
- **RAM**: 16GB DDR4-3000 CL15
- **Motherboard**: ASUS X99 WS/IPMI
- **GPU**: NVIDIA GTX 1070 — shared into LXC 101 via device-node passthrough (host driver `550.163.01`); used by Ollama for CUDA inference and Plex for NVENC/NVDEC transcoding
- **Boot Drive**: 256GB SSD
- **Network**: Dual NIC bridge

## ZFS Storage

### **Tank Pool (Mirror - 7.3TB usable)**
Primary storage using two mirrored 8TB drives for data requiring redundancy:
- User files and documents
- Docker engine data
- Service configurations and databases

### **Mouse Pool (931GB)**
Single 1TB drive for experimental workloads and media content:
- Media files optimized with 1M recordsize for large video files
- Temporary storage and testing datasets

### **Dataset Organization**
- `tank/userdata` (926GB) — NextCloud user storage
- `tank/docker` (141GB) — Docker engine data and volumes
- `mouse/media` — Plex media library (movies, tv, music), LZ4 compression

## Virtualization Layer

### **Ubuntu Docker LXC (VMID: 101)**
- **Hostname**: docker
- **IP**: 10.0.0.30
- **OS**: Ubuntu 24.04.2 LTS
- **Resources**: 16GB RAM, 16 CPU cores
- **ZFS bind mounts**:
  - `/tank/docker` → `/var/lib/docker`
  - `/tank/userdata` → `/mnt/datashare/myfiles`
  - `/mouse/media` → `/mnt/datashare/media`

## Host Access (SSH)

SSH aliases are configured on the workstation (`~/.ssh/config`) — no password needed:

| Alias | Target |
|-------|--------|
| `ssh homelab` | Proxmox host → `root@10.0.0.20:22` |
| `ssh docker` | Docker LXC → `shawn@10.0.0.30:2053` |

Explicit form if aliases aren't available:

```bash
ssh root@10.0.0.20            # Proxmox host
ssh shawn@10.0.0.30 -p 2053   # Docker LXC
```

> The Proxmox web UI is at `https://10.0.0.20:8006` (direct, bare-metal — not behind NPM/Tailscale). Use the raw IP if LAN DNS (Pi-hole on `10.0.0.30`) is down.

## Networking Architecture

### Access Tiers

Services are exposed across up to three access tiers depending on sensitivity:

| Tier | How it works |
|------|-------------|
| **LAN** | Direct port binding on `10.0.0.30`; available only on the `10.0.0.0/24` network |
| **Tailscale** (`*.tail.shawnjacobsen.com`) | Wildcard DNS → `100.102.124.71` (the `cloud` device on the tailnet). Traffic hits NPM, which reverse-proxies to the target container. Requires Tailscale auth. |
| **Public** (`*.shawnjacobsen.com`) | Cloudflare tunnel (`cloudflared-homelab-1`) terminates at the `cloudflared` container and forwards to the target service. No port forwarding or static IP needed. |

### Tailscale Mesh (tailnet: `heron-fiordland.ts.net`)

Four devices on the tailnet:
- `cloud` (`100.102.124.71`) — Docker LXC 101; the hub for all homelab services
- `shawn-desktop` — primary workstation
- `shawn-x1c` — ThinkPad X1 Carbon laptop
- `iphone-15-pro` — mobile

`*.tail.shawnjacobsen.com` is a wildcard DNS A record pointing to `100.102.124.71`. NPM (running inside the Tailscale container's network namespace) handles routing for all `*.tail.shawnjacobsen.com` requests.

### Docker Networks

| Network | Owner | Purpose |
|---------|-------|---------|
| `homelab_shared_net` | `nginx` stack (declares it; all others use `external: true`) | Shared bridge; allows NPM and `cloudflared` to reach all services by container name |
| `ai-net` | `llm` stack | Isolated network for Ollama, SearXNG, Redis, and Tika. `open-webui` bridges into `homelab_shared_net` as well. |
| `nextcloud-aio` | `nextcloud` stack | Internal AIO network; MTU 9001 (jumbo frames), IPv4-only, loopback-bound for hardening |
| `piwigo-network` | `piwigo` stack | Internal network between Piwigo app and MariaDB |

> **Bring-up order matters**: `nginx` must start first — it creates `homelab_shared_net`. All other stacks that attach to it as `external: true` will fail to start if it doesn't exist.

### Reverse Proxy (NPM + Tailscale)

NPM runs with `network_mode: service:tailscale`, meaning it shares the Tailscale container's network namespace. This gives NPM a Tailscale IP without needing its own network interface, and sidesteps ISP static-IP limitations. The `cloudflared` container reaches NPM via `nginx-tailscale-1:80` over `homelab_shared_net`.

### Cloudflare Tunnel

Tunnel `cloudflared-homelab-1` (status: healthy) routes public traffic without exposing any ports to the internet:

| Public hostname | Routes to |
|----------------|-----------|
| `n8n.shawnjacobsen.com` | NPM → `n8n:5678` |
| `photos.shawnjacobsen.com` | `piwigo-piwigo-main-1:80` (direct, bypasses NPM) |

## Services

### Reverse Proxy & Access — `nginx` stack

Three containers:

- **Tailscale** — Mesh VPN; NPM shares its network namespace. Exposes port 81 on the LAN for NPM admin.
- **Nginx Proxy Manager (NPM)** — Reverse proxy for all `*.tail.shawnjacobsen.com` and some `*.shawnjacobsen.com` routes.
- **GoAccess** — Real-time log analytics for NPM access logs.

| Access | URL |
|--------|-----|
| NPM admin (LAN) | `10.0.0.30:81` |
| NPM admin (Tailscale) | `npm.tail.shawnjacobsen.com` |
| GoAccess dashboard (LAN) | `10.0.0.30:7880` |

---

### File Hosting — `nextcloud` stack

NextCloud All-in-One mastercontainer manages the full NextCloud suite (Apache, Collabora, Talk, etc.) internally.

| Access | URL |
|--------|-----|
| AIO setup UI (LAN) | `10.0.0.30:8080` |
| AIO setup UI (Tailscale) | `nc-admin.tail.shawnjacobsen.com` |
| Files / web UI (Tailscale) | `drive.tail.shawnjacobsen.com` |

- **Data**: ZFS `tank/userdata` → `/mnt/datashare/myfiles` (no backups currently configured)
- **Network**: `nextcloud-aio` (internal, jumbo frames) + `homelab_shared_net`

---

### Media Streaming — `plex` stack

| Access | URL |
|--------|-----|
| LAN | `10.0.0.30:32400/web` |
| Tailscale | `plex.tail.shawnjacobsen.com` |

- **Network**: `host` mode (direct port binding on LXC)
- **Media**: ZFS `mouse/media` mounted read-only at `/data` (movies, tv, music)
- **GPU**: Hardware transcoding **active** via the GTX 1070. `plex/compose.yaml` sets `runtime: nvidia`, `NVIDIA_VISIBLE_DEVICES=all`, `NVIDIA_DRIVER_CAPABILITIES=compute,video,utility`, plus explicit `devices:` for `/dev/nvidia0`, `/dev/nvidiactl`, `/dev/nvidia-uvm` (see GPU note below for why the device list is required).

---

### Automation — `n8n` stack

| Access | URL |
|--------|-----|
| LAN | `10.0.0.30:5678` |
| Tailscale | `n8n.tail.shawnjacobsen.com` |
| Public | `n8n.shawnjacobsen.com` |

- **Database**: SQLite
- **Public routing**: Cloudflare tunnel → NPM → `n8n:5678`

---

### Local AI — `llm` stack

All services run on the isolated `ai-net` network. Only Open WebUI also bridges to `homelab_shared_net` for NPM access.

| Service | LAN | Tailscale |
|---------|-----|-----------|
| Open WebUI | `10.0.0.30:7000` | `open-webui.tail.shawnjacobsen.com` |
| Ollama (API) | `10.0.0.30:11434` | — |
| SearXNG | `10.0.0.30:7777` | — |
| Apache Tika | `10.0.0.30:9998` | — |

- **RAG**: Open WebUI queries SearXNG; Tika handles document parsing
- **GPU**: Ollama runs on the GTX 1070 (CUDA). `llm/compose.yaml` sets `runtime: nvidia`, `NVIDIA_VISIBLE_DEVICES=all`, `NVIDIA_DRIVER_CAPABILITIES=compute,utility`, plus explicit `devices:` for `/dev/nvidia0`, `/dev/nvidiactl`, `/dev/nvidia-uvm`.

> **GPU passthrough — how it works (and the two gotchas that bite on reboot).** The host runs the NVIDIA driver (`550.163.01`) and claims the GTX 1070. Getting it into the containers reliably has three layers:
>
> 1. **Host creates `/dev/nvidia-uvm` at boot.** The `nvidia-uvm` node is created *lazily on first CUDA use*, so after a cold boot it does **not** exist until something triggers it — which means a bind-mount of it would be skipped and containers fail. A host systemd oneshot **`nvidia-uvm-init.service`** (`ExecStart=/usr/bin/nvidia-modprobe -c 0 -u`, ordered `Before=pve-guests.service`) forces the node to exist before LXC 101 starts. *(Host-only, not version-controlled.)*
> 2. **`101.conf` bind-mounts the nodes into the LXC.** The `lxc.mount.entry` lines for `/dev/nvidia0`, `nvidiactl`, `nvidia-modeset`, `nvidia-uvm`, `nvidia-uvm-tools`, `nvidia-caps/*` pipe the host nodes into the privileged LXC every start (majors are dynamic, so they're left unpinned — cgroup perms come from `lxc.cgroup2.devices.allow: a`). The repo copy is `proxmox/docker/101.conf`; the live copy is `/etc/pve/lxc/101.conf`.
> 3. **`no-cgroups = true` + per-stack `devices:`.** `nvidia-container-toolkit` can't manage cgroups inside an LXC, so `/etc/nvidia-container-runtime/config.toml` has **`no-cgroups = true`** (host-only). With that set the runtime injects the NVIDIA userland libs but no longer grants the container cgroup device perms — so each GPU stack **must** also list the device nodes under `devices:` in its compose, or `nvidia-smi` in the container fails with `Failed to initialize NVML: Unknown Error`.
>
> **Troubleshooting a reboot regression:** if containers exit 128 with `error gathering device information ... /dev/nvidia-uvm: no such file or directory`, the host's `uvm` node is missing — check `nvidia-uvm-init.service` ran (`systemctl status nvidia-uvm-init`) and that `/dev/nvidia-uvm` exists on the host, then restart LXC 101 (or live-patch with `nvidia-modprobe -c 0 -u` on the host + recreate the node in the LXC). The old VFIO config (`vfio.conf`, `nomodeset`/`intel_iommu` cmdline, vfio in `/etc/modules`) was **removed** on 2026-06-20 — backups in `/root/vfio-teardown-bak/`.

---

### Photo Gallery — `piwigo` stack

| Access | URL |
|--------|-----|
| LAN | `10.0.0.30:${piwigo_port}` |
| Tailscale | `photos.tail.shawnjacobsen.com` |
| Public | `photos.shawnjacobsen.com` |

- **Photos**: sourced from `/mnt/datashare/myfiles/Photography/Photo Exports`
- **Database**: MariaDB LTS on internal `piwigo-network`
- **Public routing**: Cloudflare tunnel → `piwigo-piwigo-main-1:80` (bypasses NPM)

---

### DNS & Ad-blocking — `pi-hole` stack

| Access | URL |
|--------|-----|
| Web UI (LAN) | `10.0.0.30:80` |
| DNS (LAN) | `10.0.0.30:53` |

- **Network**: Docker default `bridge` (not on `homelab_shared_net`)
- DNS server for all configured LAN devices. Breaking Pi-hole breaks LAN DNS — handle with care.

---

### Cloudflare Tunnel — `cloudflare` stack

The `cloudflared` container maintains the outbound tunnel to Cloudflare. No ports exposed. Attached to `homelab_shared_net` so it can reach `piwigo` and `nginx-tailscale-1` by container name.

---

### Stack Manager — `dockge` stack

| Access | URL |
|--------|-----|
| LAN | `10.0.0.30:5001` |
| Tailscale | `dockge.tail.shawnjacobsen.com` |

Manages all compose stacks; its stacks directory points at this repo (`/home/shawn/homelab/proxmox/docker`).

## Local API Documentation

API reference specs are stored in `.docs.local/` (gitignored) for use when making direct API calls:

| File | API |
|------|-----|
| `tailscale-api.json` | Tailscale REST API — query devices, ACLs, tailnet settings |

## Related Automation Projects

### **Canvas Integration**
Python automation synchronizing Canvas LMS with Notion databases — handles course data, assignment tracking, and API abstraction for reuse in other projects.

### **Task Management Automation**
Scheduled system managing recurring Notion tasks via JSON configuration with automated deployment and SMS error notifications.

---

*Feel free to reach out if you have any questions about my setup! (<a href="mailto:shawn.jacobsen0@gmail.com">shawn.jacobsen0@gmail.com</a>)*
