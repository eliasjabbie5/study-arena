# Study agent: handoff

Source: chat with Claude on 2026-11-17. Status labels per item below.

## Goal (verified: user's own words)
Studying agent for business students, to be given to other users (not just personal use). Capabilities wanted: data analysis, academic writing, knows what business teachers look for, knows key student skills, knows how to learn best, generates study games from existing artifacts, holds lots of info.

## Decisions made
- Build on the Claude API, in Python (user's choice). Reason: subscription weekly limit ran out.
- Prototype first, no web UI yet.
- Artifacts (the ones that led to best learning) were made with Claude. Location and format: NOT yet known.

## Architecture plan (proposed, not built)
- Backend holds the API key; students never see it.
- System prompt = tutor persona, academic writing rules, learning-science rules.
- Curated knowledge files (rubrics, frameworks, artifacts), cached. Retrieval only if it grows past ~100-200K tokens.
- Code execution tool for CSV/Excel analysis. Web search tool for current info.
- Game generator: feed 3-5 best artifacts as examples, extract the pattern, generate new games from a student's notes.
- Build order: 1) Python script prototype, 2) add data analysis + game generator, 3) web app with login, per-user limits, 4) beta with 5-10 classmates and measure real cost, 5) payments.

## Models and prices (unverified: from the Claude API skill reference, cached 2026-11-03; check live pricing)
- Haiku 5.5: $0.10 in / $0.50 out per 1M tokens (test with this)
- Sonnet 5.5: $2 / $10 (default tutor)
- Opus 5.5: $4 / $20 (hard tasks)
- Cost per chat message ~$0.01-0.02 and ~$5-15/month per heavy student are my estimates, not measured.

## Budget
- User has 20 EUR on the API key. Already spent ~5 in one evening, mostly INPUT tokens, using Haiku and Sonnet, no deliberate agent loops. Cause not confirmed. Suspects: Claude Code or similar tool on the API key, long chats resending history, big files re-sent each turn, no caching.
- Plan: set a hard spend limit in the Console, build with the subscription not the API key, test on Haiku, cap max_tokens, start new chats often.

## Risks flagged
- Heavy users can lose money without per-user caps. No unlimited free tier.
- "Knows what teachers want" needs real rubrics and feedback as sources (check sharing rights).
- User's claim that the artifacts give the best learning is untested (unverified).
- Open-weight models are a poor fit for this project's writing and analysis quality.

## Skills (optional, later)
- Claude Code skills available: xlsx, docx, pdf, pptx, dataviz, claude-api. Custom skills go in a SKILL.md under ~/.claude/skills/<name>/ (unverified, confirm in docs).
- API Agent Skills can let the app generate docx/xlsx/pptx files for students. Skip at first.

## Open items / next step
1. Check Console > Usage (requests vs input tokens) to find what burned the 5 EUR.
2. Set a hard spend limit in the Console.
3. Tell Claude where the artifacts are (folder + format).
4. Then Claude writes the step-1 plan (Python prototype script) for approval. Don't build before the user says go.
