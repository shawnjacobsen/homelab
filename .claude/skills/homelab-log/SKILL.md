---
name: homelab-log
description: Append a new dated entry to the Notion "📑 Homelab Log" changelog after completing homelab work. Use when the user asks to log/record/note what was done, add a homelab log entry, or update the homelab log. Keeps entries short — what was wrong, how it was fixed, and the final outcome/current state.
---

# Add a Homelab Log entry

The **Homelab Log** is the running, dated changelog of homelab work — chronological history, distinct from the "Homelab Architecture v3.0" current-state spec.

- Notion page: **"📑 Homelab Log"**, page ID `1e16f656231081b7be1bd7e09569c41a`
- Tooling: Notion MCP (`notion-fetch` to read, `notion-update-page` to append).

## Goal

A **short, concise summary** of a work session. Each entry answers: **what was wrong → what was fixed → the final outcome / current state**, plus the day. This is a summary, not a play-by-play.

## Steps

1. **Get today's date** (absolute, e.g. from the environment context) and format it as the existing headings do: `### Month Day, Year` (e.g. `### June 18, 2026`).
2. **Fetch the page** with `notion-fetch` on `1e16f656231081b7be1bd7e09569c41a` to confirm the latest entries and match the exact template/tone (don't skip — the format has evolved over time).
3. **Append** the new entry at the end with `notion-update-page` using `command: insert_content` and `position: {"type":"end"}`.

## Template (follow the existing entries)

```markdown
### <Month Day, Year>
Completed
- <bullet>
- <bullet>
- <bullet>
```

- Use a `Completed` section for finished work. Add a `Todo` section (same bullet style) only if there are genuine open follow-ups.
- **Max ~3 bullets.** If it doesn't fit in 3, it's too detailed — compress.
- Each bullet should carry the arc: the problem, the fix, and the resulting state. Prefer outcome over process.
- Reference concrete identifiers where it adds value (container/stack names, hostnames like `*.tail.shawnjacobsen.com`, ports, file paths) — match how prior entries cite things.
- Keep the casual first-person tone of the existing log.

## Good vs. bad bullet

- ✅ "Fixed broken photos (repointed CF tunnel + `photos.tail` from the dead PhotoPrism to Piwigo on `homelab_shared_net`); photos now serve on local, tailnet, and public."
- ❌ "Ran docker compose, then edited the NPM database, then reloaded nginx, then tested with curl, then..." (process narration, no outcome, too long)

## Don't

- Don't paste full command transcripts, logs, or long diffs — link a commit/PR if detail is needed.
- Don't duplicate the Architecture doc's current-state spec; this is a dated history of *changes*.
- Don't edit or restate prior entries unless explicitly asked.
