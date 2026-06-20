# docs/ — Planning & Working Notes

Version-controlled planning, design decisions, in-progress runbooks, and working
memory for the homelab. This is the scratch/think space — distinct from the
current-state reference in the repo top-level `README.md`.

## What belongs here
- Planning docs and design decisions (e.g. how to safely re-enable GPU passthrough)
- Runbooks while they're being developed/validated
- Working memory and notes that aren't yet stable enough to be reference

## What does NOT belong here
- **Secrets** → `.env` / `*.env*` (gitignored)
- **Stable current-state configs, how-tos, file locations** → top-level `README.md`
  (once a plan here is executed and stable, graduate the facts into `README.md`)
- **The dated changelog of what was done** → Notion "📑 Homelab Log"
- **High-level / general architecture** → Notion "Homelab Architecture v3.0"
- **Sensitive / external API specs** → `.docs.local/` (gitignored)

See the full information-architecture matrix in the top-level `README.md`.
