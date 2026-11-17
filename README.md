# Study Arena

Source: split of `Ethics Arena.html` (user's original, untouched in ~/Documents), done 2026-11-17. Status: step 1 of the study-agent plan, verified (see "Checks done").

One game engine + one folder of course content per course. `build.py` joins them into a single-file HTML game.

```
engine/            game logic, styling, grading, XP/ranks, progress. No course text.
  head.html  prelude.js  main.js  tail.html
courses/ethics/    everything specific to one course
  config.js        title, ranks, exam points, grader wording, localStorage key
  zones.js         zones + the topic list for each zone's questions
  questions.js     MCQ / short / essay questions (M(), T(), R() helpers)
  figures.js       SVG diagrams + which questions show which diagram
  learn.js         study-guide chapters (L() helper)
  exams.js         mock exam papers
dist/ethics.html   built output (open in a browser)
tools/split_ethics.py   one-off script that did the split (kept for provenance)
```

Also: `CONTENT-SPEC.md` (step 2: exact format + quality rules for writing a course) and `courses/_template/` (minimal sample course that builds and runs; copy it to start a new course).

Rebuild: `python3 -I build.py ethics`  (or `_template`)

Changes since step 1: `T()` takes an extras argument and `var FIGS={}` moved from the Ethics figures file into the engine (both found while testing the template; Ethics re-verified: 109 questions, 14 diagrams, practice mode works).

## Checks done (verified 2026-11-17)
- Line-by-line diff of rebuilt file vs original: only the intended parameterization changes differ; all questions, chapters, diagrams identical.
- Opened in browser: 109 questions in 6 zones, Mock exams tab and an exam paper render, no console errors.
- NOT checked: playing a full question round, AI grading (needs Claude's app, falls back to keyword check elsewhere), cloud save.

## Known limits
- Content files are JS fragments that get pasted into the engine's scope, not clean data. Fine for step 1; step 2 (content spec) should define the exact format the agent must write.
- Exam code assumes "paper" style exams with a case study (`cs`), match questions and rubrics.
- Zone ids (csr, theo...) must match `CONFIG.zshort`; a new course needs its own zones, zshort and ranks.
- `/CLAUDE_BRAIN/.claude/launch.json` is a preview-server config I added for testing; safe to delete.
