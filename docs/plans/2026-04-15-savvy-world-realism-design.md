# Savvy World — Realism Redesign

**Date:** 2026-04-15
**Status:** Design approved, ready for implementation

## Goal

Make the Savvy World office sim (`~/Dev/savvy-world-static`) reflect **real same-day work**: agents' activities, conversations, moods, and movements are driven by what actually happened today (claude-mem observations + git logs), not hardcoded loops.

## Architecture

```
┌─ morning routine ─┐
│ Claude + Gemini   │  → write → today.json (committed to repo)
│ read: claude-mem  │
│       git log     │
│       Obsidian    │
└───────────────────┘
           │
           ▼
┌─ savvy-world-static ─┐
│ game.js loads        │  fetch('today.json') on boot
│ today.json @ boot    │  → seeds ACTIVITIES, CONVOS, EVENTS
│ drives agents        │  → drives movement targets + moods
└──────────────────────┘
```

Game stays static (GitHub Pages, no backend). Fallback to hardcoded data if `today.json` 404.

## today.json schema

```json
{
  "date": "2026-04-15",
  "generated_by": "claude+gemini",
  "agents": {
    "ROBOT-E": {
      "mood": "focused|stressed|celebrating|idle",
      "location": "sim-lab|desk|servers|meeting|charging|whiteboard",
      "tasks": [
        { "state": "WORKING", "text": "...", "time": "02:55", "duration_min": 20 }
      ],
      "convos": ["...", "..."]
    },
    "SAVVY": { }, "CLAUDE": { }, "GOOGLE": { },
    "DEV-1": { }, "DEV-2": { }, "OPS-1": { }
  },
  "headlines": ["ريتارجت رقصة السعودية خلص", "LAFAN1 اتحمل"]
}
```

## Agent role routing

| Agent | Primary | Crossover |
|---|---|---|
| SAVVY | code, docs, refactors, PRs, READMEs | pair with DEV-1/2 |
| CLAUDE | orchestration, planning, brain-map, Obsidian, arch | meta work |
| GOOGLE | cloud, APIs, deploys, infra, quotas | pair with OPS-1 |
| DEV-1 | bugfixes, stack traces, patches (🔴) | pair with SAVVY |
| DEV-2 | new features, pipelines, tools (🟣) | pair with SAVVY |
| OPS-1 | installs, downloads, env, CLI tools | pair with GOOGLE |
| ROBOT-E | G1, MuJoCo, motion, retarget, sim | solo |

### Today (Apr 15) auto-mapping from mem obs 296–340

- **ROBOT-E** → 310, 312, 313, 316, 318, 323, 326, 330, 331
- **DEV-1** → 329 (🔴 model path fix)
- **DEV-2** → 301–304, 307–309, 319, 340
- **OPS-1** → 323 (LAFAN1 dl), 333 (yt-dlp), 327 (missing mediapy)
- **SAVVY** → 319, 336–339 (docs/READMEs written)
- **CLAUDE** → 305–306, 296–297, 334–335, 340 (planning/arch/brain map)
- **GOOGLE** → quiet today → idle/monitoring convos only

**Moods today:** ROBOT-E=celebrating, DEV-2=focused, GOOGLE=idle, SAVVY=focused, CLAUDE=focused.

## Visual realism

Replace colored rectangles with 16×24 procedurally drawn pixel humanoids:

| Agent | Look |
|---|---|
| SAVVY | blue hoodie, headphones, monitor glow |
| CLAUDE | orange/rust sweater, tablet in hand |
| GOOGLE | white shirt + rainbow badge, clipboard |
| DEV-1 | dark hoodie, mug, red debugger glow |
| DEV-2 | green tee, dual monitors reflection |
| OPS-1 | yellow hi-vis vest, terminal glow |
| ROBOT-E | G1-style: silver torso, jointed limbs, blue eye LED |

4-frame walk cycle (idle-breath, step-L, idle, step-R) drawn in Phaser graphics — zero external assets.

**Mood tints/effects:**
- `celebrating` → bounce + yellow sparkle
- `stressed` → red tint + faster walk
- `focused` → steady
- `idle` → slower breath

## Behavioral realism — zone-based world

```
┌─────────────────────────────────────────┐
│  [sim-lab]          [meeting-room]      │
│   ROBOT-E            group on MEETING   │
│                                         │
│  [desks]            [server-rack]       │
│   DEV-1,DEV-2,       OPS-1, GOOGLE      │
│   CLAUDE,SAVVY       blinking LEDs      │
│                                         │
│  [charging dock]    [whiteboard]        │
│   ROBOT-E idle       CLAUDE planning    │
└─────────────────────────────────────────┘
```

- Agents pathfind (grid A*) to their `location` when state changes
- On `MEETING`, listed participants converge at meeting-room
- ROBOT-E returns to charging dock when IDLE

## Daily update pipeline

```
1. Claude: mem-search "today" → extract obs from current date
2. Claude: git log --since=midnight across ~/savvy ~/g1-imitation ~/Dev/*
3. Gemini (omc ask gemini) → cross-check + Arabic convos (عامية مصرية)
   matching each agent's voice
4. Merge → /Users/sm/Dev/savvy-world-static/today.json
5. git commit + push → GitHub Pages serves updated world
```

## Build plan — parallel OMC executors

| Agent | Task |
|---|---|
| executor #1 | Refactor game.js: replace hardcoded ACTIVITIES/CONVOS/EVENTS with today.json loader + fallback |
| executor #2 | Procedural sprite system (7 humanoids, 4-frame walk, mood tints) |
| executor #3 | Zone-based world map + A* pathfinding + MEETING convergence |
| executor #4 | Write today.json for Apr 15 using locked mapping (mem obs 296–340) |
| writer | update-today.sh script + README for daily routine |

Run #1–#3 in parallel (touch different files); #4 + writer after #1 lands the loader contract.

## Deliverables

- `game.js` refactored (data-driven)
- `today.json` (Apr 15 populated)
- `update-today.sh` + daily-routine README
- This design doc
