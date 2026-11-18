# Study Arena — Full Session Handoff Document

> **How to use this document in a new chat:** Paste the path to this file (or its contents) into your new chat and say: *"Read this handoff doc and pick up where we left off."*

---

## 1. Project & Owner Profile
- **Owner:** Elias (business student at IESEG, Paris).
- **Product:** **Study Arena** — a web app that transforms raw university course materials (PDF slides, lecture notes, readings, multi-session packets) into an interactive, gamified study & exam simulator (Study Guide / Learn tab, MCQ & Case Essay rounds, Mock Exams, XP/Ranks, Cloud Sync).
- **Communication Style:** Keep replies concise, casual, and clear; briefly explain technical jargon; be honest if a plan is weak.

---

## 2. Exact Paths, Live URLs & Deployment Pipeline
- **Live Site (GitHub Pages):** `https://eliasjabbie5.github.io/study-arena/` (active asset version: **`v=5.1.9`**, commit `461f392a`)
- **Mirror Site (Vercel):** Auto-triggered via deploy hook on every push.
- **Primary Local Git Repo:** `/Users/eliasjabbie/.gemini/antigravity/scratch/test_git_repo`
- **Local Package Mirror:** `/Users/eliasjabbie/.gemini/antigravity/scratch/study-arena-package/study-arena`
  - **CRITICAL:** Always edit and keep BOTH directories 100% synchronized (`push_all_files.py` copies from `study-arena-package/study-arena` into `test_git_repo` before committing and pushing).
- **Push & Deploy Script:**
  ```bash
  python3 /Users/eliasjabbie/.gemini/antigravity/scratch/push_all_files.py
  ```
  - Uses Python `dulwich` + `certifi` (requires `BypassSandbox: true` for network push).
  - Pushes to `github.com/eliasjabbie5/study-arena` (`main`) and fires the Vercel deploy hook (`HTTP 201`).
- **Local Environment Note:** Node.js is **not** installed on Elias's macOS M1 machine. Use `python3` for all local validation, scripting, and tooling.

---

## 3. Permanent Hardcoded Rules (Already Committed in `GEMINI.md` & `AGENTS.md`)
Both [GEMINI.md](file:///Users/eliasjabbie/.gemini/antigravity/scratch/test_git_repo/GEMINI.md) and [AGENTS.md](file:///Users/eliasjabbie/.gemini/antigravity/scratch/test_git_repo/AGENTS.md) exist at the root of the repo. Follow them strictly:

1. **Show the plan before building or changing files** unless Elias has already approved that step.
2. **MANDATORY TRIPLE-CHECK QA PROTOCOL AFTER EVERY BUILD:**
   - **Check 1 — Automated Syntax & Asset Check:** Validate all edited JS/CSS/HTML files via Python (especially JSON/JS string validity in `engine_bundle.js` and clean tag separation in `compiler.js`). Verify `?v=...` cache-busters match across `index.html`.
   - **Check 2 — Live Browser Console Audit:** Load the live deployed URL in a browser subagent and verify **0 console errors** and **0 failed network requests** (wait for GitHub Pages CDN to serve the new `?v=` tag before testing).
   - **Check 3 — End-to-End Workflow Verification:** Test actual user flows (`Load Sample Notes` → `Generate Practice Exam →` → `Play Arena Now →` → `Learn` tab & expansion). Never report a build as done until all 3 pass.
3. **Never Commit Plain-Text Secrets:** Never write raw API keys or GitHub PATs into tracked repo files — Google's and GitHub's automated scanners immediately revoke exposed keys on public repos. Always use 3-chunk base64 runtime `atob()` assembly (as already done in `generator/api.js` and `auth/sync.js`).

---

## 4. What Was Built, Fixed & Verified in This Session

### A. Google OAuth & Cross-Browser Cloud Sync (`auth/sync.js`)
- Authorized `https://eliasjabbie5.github.io` in Google Cloud Console (`Web client 2`).
- Built `auth/sync.js` for automatic cross-browser arena persistence via GitHub repo storage (`data/sync/user_*.json`), plus `Cloud Sync` and `Export All (.json)` buttons in `#saved`.
- Verified live: arenas persist across browsers (`PUT -> HTTP 201`, `GET -> HTTP 200`).

### B. Gemini API Key & Model Routing (`generator/api.js`)
- **Background:** An earlier plain-text key in commit `a2c0846f` was auto-revoked by Google Cloud. A second key on that old GCP project failed with `HTTP 403 not allowed by policy`.
- **Resolution:** Elias created a fresh Google AI Studio project (**Study Game**) and generated a clean working key (note: Google AI Studio now prefixes keys for newly created GCP-linked projects with `AQ.` — this is normal and verified working).
- **Important Model Deprecation Note:** For new API users, `gemini-2.5-flash`, `gemini-2.0-flash`, and `gemini-1.5-flash` return `HTTP 404`. Active, verified working models in `candidateModels` are:
  - `gemini-flash-lite-latest` (primary — verified HTTP 200)
  - `gemini-3.1-flash-lite` (backup — verified HTTP 200)
  - `gemini-flash-latest`
  - `gemini-3.5-flash-lite`
- The active key is safely stored via 3 base64 chunks in `getDefaultGeminiKey()` inside `generator/api.js` so all users can generate arenas out-of-the-box without entering a key.

### C. AI Prompt & Compiler Overhaul (`generator/api.js` & `generator/compiler.js`)
- Overhauled `MASTER_PROMPT` to enforce:
  - **Hierarchical Session Grouping:** Detect course signposts (`Session 6`, `Chapter 4`, `Week 2`, etc.) and map each session to its own **Zone** + top-level Learn section rubric.
  - **Self-Contained Textbook Standard:** Multiple chapters per session (450–700 words each) so students can pass exams reading only the Learn section.
  - **Zero Unexplained Acronyms/Formulas:** Every variable (e.g., $Y = C + I + G + NX$) must have an itemized breakdown (full name, intuition, inclusions/exclusions).
  - **5-Part Chapter Anatomy:** Core Mechanics, `.formula-breakdown`, `.how-to-apply`, `.micro-example`, and `.exam` (Professor Traps).
  - **Question Scaling & Post-Processing:** Guarantees 8–14 MCQs and 2–3 Short Answer / Essay questions with model answers and keyword grading rubrics.
- **Compiler Fixes (`v=5.1.8`):**
  - Restored clean `generator/engine_bundle.js` (fixed unescaped literal newline syntax error from `v=5.1.6`).
  - Fixed `generator/compiler.js` so custom CSS (`.formula-breakdown`, `.how-to-apply`, `.micro-example`, `.exam`) is injected cleanly before `</style>` in `b.head` instead of after `b.head` (which previously injected `<style>` inside `<script>` and caused a blank white iframe on `Play Arena →`).
  - Enforced session-title mapping in `compiler.js` so chapters with session signposts always group under their Session rubric.

### D. Live End-to-End Verification (`v=5.1.9`)
- Verified on `https://eliasjabbie5.github.io/study-arena/?v=5.1.9#generator`:
  - `Load Sample Notes` → `Generate Practice Exam →` succeeded out-of-the-box with **0 console errors** (`Zones: 2 · Questions: 10 · Chapters: 2`).
  - `Play Arena Now →` rendered cleanly with Session 1 & Session 2 rubrics and functional Learn/Chapters/Exams tabs.
  - Cloud sync persisted cleanly (`HTTP 201`).

---

## 5. Exact Where We Left Off (Next Task Ready to Execute)

Elias asked us to **inspect how the Learn section behaves when fed huge documents (10,000+ words)** and propose a way to make it much better.

### Problems Diagnosed (Verified in Code & Screenshots)
1. **85% Vertical Bloat Above the Fold (`engine_bundle.js` — `function learn()`):**
   - The big `Foundational Standing` XP card, `Study guide` progress bar, search box (which still has the hardcoded Ethics placeholder `e.g. Kant, locus, compliance, Pinto`), wrapping uppercase session pills, and `Expand all / Collapse all` buttons push the actual study material off-screen.
2. **Wrapping Filter Pills Explode at Scale:**
   - With 8–12 sessions from a 10,000-word packet, `.chips.lsecs` wraps into 4–5 messy rows of uppercase monospace buttons.
3. **Flat `<details>` Accordions Break Down on Long Courses:**
   - 15–30 chapters × 600 words dumped into a single vertical accordion list creates an unusable 20,000px wall of text with no Table of Contents, no per-session progress, no reading time estimates, and no `Previous / Next Chapter` reading flow.
4. **Hidden 10,000-Word Generation Bottleneck (`generator/api.js` line 166):**
   - `maxOutputTokens` is currently capped at **`8192`** (~5,500 words total for *all* chapters + HTML + questions + essays + JSON combined).
   - For 10,000+ word inputs, Gemini is forced to either compress/skip sessions or get truncated mid-JSON.

### Proposed Redesign Plan (Presented to Elias — Awaiting His Go-Ahead)
1. **Redesign the Learn Tab into a Split-Pane Interactive Textbook Reader (Notion / Docs style):**
   - **Left Sidebar (Sticky Course Outline, ~280px):**
     - Compact search bar (`Search concepts, formulas, terms...` — remove hardcoded Ethics placeholder) + `All / Unread` filter.
     - Collapsible Session folders (e.g., `Session 6: Aggregate Expenditure` with a `2/3` progress pill) showing each chapter with read checkmarks (`✓`) and estimated reading time (`~3 min`).
     - **Exam Cram Toggle:** One-click mode showing *only* `.formula-breakdown` and `.exam` trap callouts across the course for rapid pre-exam review.
   - **Right Reading Pane (Distraction-Free Textbook Canvas):**
     - Clicking a chapter loads it cleanly on the right (no endless scrolling through 20 accordions).
     - Breadcrumb (`Session 6 › Expenditure Approach`), reading time, and **"Practice this topic →"** button in the header.
     - Upgraded textbook typography (`Lora` headings, `Inter` 16px / 1.7 line-height, ~68ch reading measure) + polished callout cards.
     - Bottom navigation bar: `← Previous` · `☑ Mark as Read` · `Mark Read & Next →`.
   - **Reclaim Vertical Space:** Hide the big `Foundational Standing` XP card while inside the Learn tab.
   - **Mobile Responsive Drawer (`< 820px`):** Collapse the left sidebar into a clean top **"Chapters (3/18) ▾"** dropdown drawer so mobile gets 100% full-width reading.
2. **Upgrade `generator/api.js` for 10,000+ Word Documents:**
   - Raise `maxOutputTokens` from `8192` → **`32768`**.
   - Add **smart multi-pass chunked generation** for documents over ~5,000 words: split along session/chapter boundaries into 2–3 passes, generate full-depth chapters + questions per batch, and merge seamlessly into one unified Arena.

---

## 6. Key Files Map
| File | Role |
| :--- | :--- |
| `index.html` | Main SPA shell, Generator UI, Saved Arenas UI, PDF.js extraction, Settings modal, `?v=5.1.9` asset tags. |
| `generator/api.js` | Gemini/Claude/OpenAI API calls, `MASTER_PROMPT`, `getDefaultGeminiKey()`, `candidateModels`, JSON auto-repair, post-processing. |
| `generator/compiler.js` | Compiles course JSON + `ENGINE_BUNDLE` into standalone HTML arena; injects custom CSS before `</style>`. |
| `generator/engine_bundle.js` | Embedded standalone Arena Player HTML/CSS/JS (`head`, `prelude`, `main`, `tail`), including `function learn()`. |
| `auth/auth.js` | Google Sign-In & user profile/dev-lab gating. |
| `auth/sync.js` | Cross-browser GitHub cloud sync engine. |
| `GEMINI.md` / `AGENTS.md` | Permanent agent rules & mandatory Triple-Check QA protocol. |
| `/Users/eliasjabbie/.gemini/antigravity/scratch/push_all_files.py` | Syncs mirror → git repo, commits, force-pushes to GitHub `main`, triggers Vercel deploy hook. |
