# scripts/ — daily data refresh

## What this does

Keeps `today.json` at the repo root in sync with the **real work** done today across your projects. The game (`game.js`) loads `today.json` at boot and drives all 7 agents' tasks, moods, locations, and conversations from it.

## Morning routine

```
┌─ you (human) ──────────────────────────┐
│  ./scripts/update-today.sh             │
└──┬─────────────────────────────────────┘
   │ collects git log --since=midnight
   ▼
┌─ Claude ───────────────────────────────┐
│  reads: claude-mem today's obs         │
│         .today.git.txt                 │
│  writes: today.json (Arabic convos)    │
└──┬─────────────────────────────────────┘
   │ optional cross-check
   ▼
┌─ Gemini (omc ask gemini) ──────────────┐
│  sanity-check voice consistency        │
└──┬─────────────────────────────────────┘
   │
   ▼
┌─ script (resumes) ─────────────────────┐
│  validate JSON → commit → push         │
└────────────────────────────────────────┘
```

## Fallback

If `today.json` is missing or malformed, `game.js` falls back to its hardcoded `ACTIVITIES`, `CONVOS`, and `EVENTS`. The world never breaks — worst case you see yesterday's vibe.

## Rolling back a bad day

```bash
git log --oneline today.json        # find the bad commit
git revert <sha>                    # or: git checkout <prev-sha> -- today.json
git commit -m "data: revert today.json"
git push
```

## Schema

See `docs/plans/2026-04-15-savvy-world-realism-design.md` for the full schema and role-routing table.

## Files

- `update-today.sh` — orchestrator (run this each morning)
- `.today.git.txt` — tmp file with the day's git commits (auto-cleaned on success)
