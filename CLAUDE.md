# Shawn's Homelab — Development Guidelines

Version-controlled configuration for a Proxmox-based homelab: ZFS storage, an Ubuntu
Docker LXC running ~10 Docker Compose stacks (NextCloud, Plex, Ollama/LLM, n8n, Pi-hole,
Piwigo, reverse proxy), plus standalone Python automation. This repo is the source of
truth for every stack's compose file and the scheduled jobs that maintain them.

## Glossary

- **Stack**: A directory under `proxmox/docker/<name>/` containing a `compose.yaml` (and optional `.env`, scripts, data) for one service group. Deployed via Dockge or `docker compose`.
- **Dockge**: Web UI (port 5001) that manages all compose stacks; its stacks dir points at this repo.
- **LXC 101**: The Ubuntu 24.04 container (hostname `docker`) where every Docker stack runs.
- **Tailnet**: The Tailscale mesh `heron-fiordland.ts.net`; primary remote-access path.
- **`homelab_shared_net`**: The shared external Docker bridge network most stacks attach to so the reverse proxy can reach them by container name.
- **.env**: Per-stack or root credential file (gitignored, NEVER commit).
- **.env.template**: Tracked template for the root automation credentials (NO secrets).

## Source of Truth & References

- **This repo** (`/home/shawn/homelab`) is the source of truth for all compose files, scripts, and cron definitions. GitHub: `shawnjacobsen/homelab`.
- **Live Docker state** on LXC 101 is the source of truth for what's *actually running* — use the `docker-mcp` MCP tools (`list-containers`, `get-logs`, etc.) or `docker` CLI to check.
- **Architecture reference**: Notion "Homelab Architecture v3.0" — fetch via the Notion MCP (`notion-fetch` on `https://app.notion.com/p/2076f656231080298a6ff44565f476c5`) for hardware serials, GPU plans, storage rationale, and historical/deprecated decisions.

> ⚠️ **The Notion doc lags the repo.** It lists Nginx Proxy Manager and Cloudflare Tunnel as *deprecated*, but both are present and **running** in this repo (added in the latest commits) — NPM now runs inside Tailscale's network namespace, which sidesteps the old Xfinity static-IP problem. When repo/live state and Notion disagree, **repo + live state win**; treat Notion as background/history.

## Before Every Non-Trivial Response

Before acting on anything beyond a trivial change, ask yourself and answer briefly:
1. What am I not thinking about?
2. Is this actually the best approach, or just the first one?
3. What would an expert in this domain do here?

## Sensitive Systems & Guardrails

This is live home infrastructure (file storage, DNS, remote access). Default to least privilege and read-only inspection.

- Never read, write, or echo secrets, tokens, or credential files (`.env`, `*.env`, Tailscale auth keys, tunnel tokens, DB passwords).
- **Pi-hole is the LAN DNS server (10.0.0.30).** Breaking it breaks DNS for every configured device — confirm before touching the `pi-hole` stack.
- **`homelab_shared_net` is owned by the `nginx` stack** (the only stack that declares it without `external: true`). Don't `docker network rm` it or bring the nginx stack down carelessly — dependent stacks will fail to start.
- NextCloud holds the only copy of user data on `tank/userdata` (**no backups are currently configured** per the architecture doc). Never run destructive `occ` commands, prune volumes, or delete `/mnt/datashare` contents without explicit approval.
- Stop and ask before changes affecting networking, DNS, the reverse proxy, Tailscale, or persistent data.
- Prefer dry runs and the `test`/`*-test` stacks for experiments.
- Destructive Docker/ZFS operations (`down -v`, `volume rm`, `prune`, `zfs destroy`, force-push) require explicit confirmation.

## Infrastructure Topology

### Physical / Virtual
- **Proxmox host `pve`** — `10.0.0.20/24` static, SSH `root@10.0.0.20:22`. Xeon E5-2640 v3 (8c), 16GB RAM, NVIDIA GTX 1070, ZFS.
- **Docker LXC (VMID 101, hostname `docker`)** — `10.0.0.30/24`, SSH `shawn@10.0.0.30:2053`. Ubuntu 24.04, 16GB/16-core, privileged, `nesting=1`. **This is where you run all `docker` commands.**
- **LAN**: `10.0.0.0/24`, gateway `10.0.0.1`, DNS `10.0.0.30` (Pi-hole) for configured devices.
- **Tailnet**: `heron-fiordland.ts.net`; the reverse-proxy/NextCloud machine is `cloud` (`100.111.175.18`).

### ZFS → LXC → Docker storage chain
LXC 101 bind mounts (from `proxmox/docker/101.conf`):
```
mp0: /tank/docker    → /var/lib/docker            (Docker engine data, 141GB)
mp1: /tank/userdata  → /mnt/datashare/myfiles     (NextCloud user files, 926GB)
mp2: /mouse/media    → /mnt/datashare/media        (Plex media: /movies /tv /music, 1M recordsize, LZ4)
```
Stacks mount subpaths of `/mnt/datashare/...` — e.g. NextCloud uses `/mnt/datashare`, Plex `/data` (ro), Piwigo `/mnt/datashare/myfiles/Photography/Photo Exports`.

### GPU caveat
The Notion doc describes a shared multi-GPU plan, but **`101.conf` in this repo has all NVIDIA passthrough lines commented out** ("disabling to dedicate gpu to Windows 11 VM"). So as committed, the GTX 1070 is **not** available to LXC 101 — Plex hardware transcoding and Ollama GPU inference will not work until those `lxc.mount.entry` / `lxc.cgroup2.devices.allow` lines are re-enabled and the LXC restarted. Verify the live state before assuming GPU is present.

## Docker Stacks

All under `proxmox/docker/<name>/compose.yaml`. Ports are on `10.0.0.30` unless networked otherwise.

| Stack | Service(s) | Port(s) | Network | Notes |
|-------|-----------|---------|---------|-------|
| `nginx` | NPM + Tailscale + goaccess | NPM via tailnet, goaccess 7880 | **owns** `homelab_shared_net` | NPM uses `network_mode: service:tailscale` → reachable on tailnet w/ TS certs. Bring up first. |
| `nextcloud` | NextCloud AIO mastercontainer | 8080 (setup), apache 11000 | `nextcloud-aio` + `homelab_shared_net` | `https://cloud.heron-fiordland.ts.net/`. `NEXTCLOUD_MOUNT=/mnt/datashare`. |
| `plex` | Plex Media Server | 32400 (host net) | host | `docker.heron-fiordland.ts.net:32400/web`. Media ro from `/mnt/datashare/media`. GPU — see caveat. |
| `llm` | Ollama, Open WebUI, SearXNG, Redis/Valkey, Tika | 11434, 7000, 7777, 9998 | `ai-net` (isolated) | Open WebUI RAG via SearXNG. GPU — see caveat. |
| `n8n` | n8n | 5678 | `homelab_shared_net` | SQLite, env-driven host/protocol. |
| `pi-hole` | Pi-hole | 53/tcp+udp, 80, 443 | bridge | LAN DNS + ad-block. Handle with care. |
| `piwigo` | Piwigo + MariaDB | `${piwigo_port}` | `piwigo-network` + `homelab_shared_net` | Photo gallery; galleries from Photo Exports. |
| `cloudflare` | cloudflared tunnel | — | `homelab_shared_net` | Public tunnel via `TUNNEL_TOKEN`. |
| `dockge` | Dockge | 5001 | host | Compose manager; stacks dir = `/home/shawn/homelab/proxmox/docker`. |
| `test` | hello-world-http | 4444 | `homelab_shared_net` | Throwaway connectivity test. |
| `node-test`, `flask-test`, `sorting-algos` | scratch build experiments | — | — | Dockerfiles for experimentation; not long-running services. |

### Deploying / managing stacks
Run on LXC 101 (`shawn@10.0.0.30:2053`), or use the `docker-mcp` MCP tools from here:
```bash
cd /home/shawn/homelab/proxmox/docker/<stack>
docker compose up -d          # deploy / update
docker compose pull && docker compose up -d   # update images
docker compose logs -f <svc>  # tail logs
docker compose down           # stop (NEVER add -v without confirmation)
```
Or manage visually through **Dockge** (port 5001). MCP equivalents available this session: `mcp__docker-mcp__list-containers`, `get-logs`, `deploy-compose`, `create-container`.

## Credentials

- **Per-stack `.env`** files live beside each `compose.yaml` (e.g. `nginx/.env`, `n8n/.env`, `cloudflare/.env`, `piwigo/.env`, `plex/.env`). All gitignored via `*.env*`.
- **Root `.env`** (gitignored) holds the Python automation secrets; `.env.template` is the tracked template (Notion, Canvas, email keys).
- Known per-stack variable names (values gitignored): `nginx` → `TS_HOSTNAME`, `TS_AUTH_KEY`, `TS_EXTRA_ARGS`; `n8n` → `N8N_PROTOCOL`, `N8N_HOST`, `N8N_SECURE_COOKIE`; `cloudflare` → `TUNNEL_TOKEN`; `piwigo` → `piwigo_port`, `db_user_password`; `plex` → `PLEX_CLAIM_TOKEN`.
- ⚠️ Some compose files contain hardcoded default credentials (`pi-hole` web password, NPM `INITIAL_ADMIN_PASSWORD: changeme`). These are committed — flag them if asked to harden, but don't assume they're the live values.

Requirements:
- ✅ `.env` files gitignored (NEVER commit); `chmod 600` recommended.
- ❌ No new secrets hardcoded in compose/scripts — use `.env` + `${VAR}` or `env_file:`.

## Scheduled Jobs (cron)

Centralized, version-controlled cron for the LXC, deployed to `/etc/cron.d/docker-apps`.

- Source: `proxmox/docker/docker-apps-cron` — currently: NextCloud `files:scan` every 15 min; NextCloud health check daily 3 AM.
- Scripts live in `proxmox/docker/<stack>/*.sh`, logging to `<stack>/logs/*.log` (gitignored; rotated weekly via `docker-apps-logrotate` → `/etc/logrotate.d/docker-apps`).
- **Deploy after editing**: `sudo proxmox/docker/update-cron.sh` (copies to `/etc/cron.d/`, sets root:root 644).
- Full SOP for adding/removing jobs: `proxmox/docker/crontab.md`.

## Python Automation (`automation/`)

Standalone Notion/Canvas integration (separate concern from the Docker homelab).
- `createDailyNotionTasks.py` — adds recurring tasks (from `Notion/recurringTasks.json`) to a Notion DB; SMS on error via `notifications.py`.
- `Notion/` — API query helpers; `canvas/` — Canvas LMS sync (+ deprecated Instagram scripts).
- Secrets from root `.env` (`NOTION_SECRET`, `CARMEN_*`, `EMAIL_*`, etc.); deps in `automation/requirements.txt`.
- ⚠️ `automation/dailyScripts.sh` references `/home/shawn/linux-automation/...`, **not** this repo path — that cron entry runs from a different checkout. Verify the actual path before relying on it.

## Git Workflow

- **Branch**: `main`. Use feature branches + PRs for non-trivial changes; commit/push only when asked. End commit messages with the Co-Authored-By trailer.
- **Commit style** (recommend going forward — history is currently casual): `<type>(<scope>): <desc>`, e.g. `feat(n8n): add webhook env`, `fix(nginx): correct shared net`. Types: `feat`, `fix`, `docs`, `refactor`, `chore`.
- **Never commit**: `.env`/`*.env*`, Tailscale/tunnel tokens, DB passwords, `**/data/**`, Plex config/transcoding, Piwigo data, large binaries (all already in `.gitignore`).

## Code Standards

- **Bash**: `set -euo pipefail`, quote variables (`"$var"`), `#!/bin/bash` shebang, `chmod +x`, timestamped log lines (`[ $(date '+%F %T') ]`) matching existing scripts.
- **Python**: type hints, docstrings, f-strings, PEP 8, load secrets via `python-dotenv`.
- **Compose**: pin or intentionally `:latest`, attach shared services to `homelab_shared_net`, keep secrets in `.env`/`env_file`, use named volumes for persistence.

## Build a skill for anything you do more than once

Any repeatable operation (health checks, stack updates, backup routines, log triage) should become a reusable skill or script rather than an ad-hoc prompt. Strong candidates here: a homelab health check (containers + NextCloud `occ status` + DNS), a "update all stacks" routine, and a backup routine (none exists yet — see the no-backups warning above). If you keep correcting the same mistake, add a guardrail (e.g. a pre-commit hook blocking `.env`) instead of re-explaining.

## Troubleshooting

- **Stack won't start, "network homelab_shared_net not found"** → bring up the `nginx` stack first (it creates that network).
- **Service unreachable via tailnet** → check the `tailscale` container in the `nginx` stack is up; NPM rides its network namespace.
- **Plex transcoding / Ollama not using GPU** → GPU passthrough is commented out in `101.conf` (see GPU caveat); re-enable and restart LXC 101.
- **DNS down on the LAN** → check the `pi-hole` container (10.0.0.30).
- **Cron job not running** → `systemctl status cron`, `sudo grep CRON /var/log/syslog`, confirm `update-cron.sh` was run after edits.
</content>
</invoke>
