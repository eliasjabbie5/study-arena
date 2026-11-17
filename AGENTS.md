# Handoff: Study Arena (read this first)

Written 2026-11-17 by Claude (Claude Code session) for another coding agent to continue the work. Everything below is labeled **verified** (checked by running/reading code) or **unverified**.

## Who and what
- Owner: Elias, student at IESEG (Paris), building a **study agent for business students** that will be given to other students (not just personal use). He is still learning the technical side: explain jargon briefly, keep replies short and casual, be honest if a plan is weak.
- Product idea: a tool that turns a student's course material (slides, readings, past exams) into a game like `reference/ethics-arena-original.html`: learn chapters first, then play question rounds, mock exams, XP/ranks, progress tracking. Elias says this game format got him an A+ on the Ethics test (**unverified**: his own report, not measured).
- Longer-term plan (see `context/study-agent-handoff.md`): a Python generator on the Claude API that reads course material and writes a new course folder. Logins/accounts are **deferred** on purpose: do not build them yet.

## Rules from Elias (follow these)
1. **Show the plan before building or changing files** unless he already said go for that step.
2. **Don't invent facts.** Mark claims verified/unverified and say where they came from. Course content must trace to the student's material.
3. Don't touch the originals in `reference/`. Work in `study-arena/`.
4. Prefer open-weight models for his n8n automation work, but for this project the handoff note says open-weight is a poor fit for the writing/analysis quality (that is Claude's own judgment, **unverified**).
5. API budget is tight (20 EUR on his Anthropic key, ~5 already spent, cause unconfirmed). Do not run anything that calls a paid API without asking. Never put keys in files.

## What exists (verified: built and clicked through in a browser, 2026-11-17)
`study-arena/` = a game **engine** plus per-course **content**, joined by `build.py` into one single-file HTML.
- `engine/` game logic, CSS, grading, XP/ranks, progress (browser localStorage). No course text.
- `courses/ethics/` the original Ethics course (109 questions, 6 zones, 32 chapters, 2 mock papers, 14 diagrams), split out of the original file. Rebuilt output matches the original apart from deliberate parameterization (checked by line diff).
- `courses/_template/` a minimal sample course; copy it for a new course.
- `CONTENT-SPEC.md` exact format + quality rules for writing a course. **Read it before touching content.**
- `README.md` layout and checks done.
- `tools/split_ethics.py` one-off migration script (kept for provenance only).
- `reference/` the three original artifacts: Ethics Arena (best, the model to copy), Econ Practice Pad (MCQ/numeric/essay, drawn graphs), Math for Business Arcade (zip: generated numeric questions, no progress saving).

Build and test:
```bash
cd study-arena
python3 -I build.py ethics        # -> dist/ethics.html
python3 -I build.py _template     # -> dist/_template.html
python3 -m http.server 8765 --directory dist   # then open http://localhost:8765/ethics.html
```
Node is NOT installed on Elias's machine (macOS, M1). Use Python for tooling. Use `python3 -I` for scripts that read untrusted files.

## Known limits and bugs (verified unless marked)
- AI marking of short answers/essays uses `window.claude` (only exists inside Claude's app). Outside it, the game falls back to a keyword check. Elsewhere (a normal website, Antigravity preview) AI grading will NOT work. The cloud-save feature has the same dependency. Replacing this with a backend call is a future decision for Elias.
- Mock exams and Diagrams tabs show empty instead of hiding when a course has none.
- Ethics-specific wording still hardcoded in `engine/main.js`: Quick mock blurb ("14 multiple choice (3 of them traps), 3 short answers and 1 essay"), exam view text "used in questions 6a and 6b", study-guide search placeholder, footer line.
- Exam engine assumes a paper with a case study, kinds `text|match|factors`, point total = `CONFIG.examTotal`.
- Course files are JS fragments pasted into the engine's scope, not clean data (e.g. JSON). A cleaner format is possible but not decided.
- Not tested: playing a full round to the results screen, essay grading UI, cloud save, mobile layout.

## Next steps (in order; each needs Elias's go unless already approved)
1. **Checker** (`study-arena/tools/check.py`, Python, no deps): validate a course folder against `CONTENT-SPEC.md` section 9 (zone ids exist, 4 options per MCQ with feedback, correct answer index 0, every question has `topic` and `src`, each chapter `tp` has 3+ questions, unique ids and `CONFIG.key`, trick/MCQ/short/essay minimums, ranks start at 0). Must pass on `ethics` apart from `src` (the Ethics course predates that rule: decide whether to backfill or exempt it) and pass on `_template`.
2. **Fix engine gaps** above (hide empty tabs, move hardcoded Ethics text into CONFIG).
3. **Convert Econ Practice Pad** into `courses/econ/` as the first real test of the format. Only use content already in that file; flag anything unclear.
4. **Generator** (Python on the Claude API): course material in, validated course folder out, checker as the gate. Prototype first, no web UI. Use the cheapest model for tests. Model names and prices in `context/study-agent-handoff.md` are **unverified** (from a cached skill reference): check live pricing before relying on them.
5. Later, not now: web app with logins, per-user limits, payments, beta with 5-10 classmates.

## Open questions for Elias
- Is `src` on every question/chapter acceptable? (It was Claude's proposal.)
- Should Ethics be backfilled with `src` or exempted from that rule?
- How will students use AI grading outside Claude's app (backend, or skip it)?
- Where does the tool live for students (static site, app, inside Claude)?

## Not in this package
- His Tessou/n8n work, other ventures and personal notes. Not relevant here.
- Claude's memory files. Their relevant content is summarized above.
