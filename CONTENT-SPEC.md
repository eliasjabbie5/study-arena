# Content spec: how to write a course for Study Arena

Source: read from `courses/ethics/*.js` and `engine/*.js` on 2026-11-17. Format rules = **verified** against the code. Quality rules marked **(recommendation)** are my judgment, not tested on students.

A course is one folder `courses/<name>/` with 6 files. `python3 -I build.py <name>` joins them with the engine into `dist/<name>.html`. Copy `courses/_template/` to start; it builds and runs.

The files are plain JavaScript pasted into the engine, in this order: `config.js, zones.js, questions.js, figures.js, learn.js, exams.js`. Strings use `'...'` or `"..."`; escape the same quote inside (`\'`).

---

## 1. config.js (required)

```js
var CONFIG={
  key:"micro-arena-v1",            // unique per course: browser save slot. Never reuse another course's key.
  title:"Micro Arena",             // header + browser tab
  subtitle:"Microeconomics  ISEG Paris  exam prep",
  course:"Microeconomics course at IESEG School of Management",  // sentence fragment used in the AI examiner prompt
  examName:"Microeconomics",       // heading on mock paper (unused if no exams)
  examFormat:"the 2025 annals",    // "written in the format of ..." (unused if no exams)
  examTotal:20,                    // points per mock paper (unused if no exams)
  ranks:[[0,"Rank 1"],[100,"Rank 2"],[300,"Rank 3"],[600,"Rank 4"],[900,"Rank 5"],[1250,"Top rank"]],  // [xp needed, name], ascending, first must be 0
  zshort:{zoneid:"Short name"}     // one entry per zone id, used on the radar chart
};
```

## 2. zones.js (required)

```js
var ZONES=[
 {id:"mkt",name:"Markets & Elasticity",sess:"Sessions 1  2",blurb:"One or two sentences naming the key ideas and authors."}
];
var TOPICS={};   // leave empty. Give every question its own topic instead (see 3).
```
- 4 to 8 zones, usually one per block of the course. `id`: short lowercase letters, no spaces.
- `sess` is a label shown on the zone card (sessions, weeks or chapters).

## 3. questions.js (required)

Three kinds. Zone id = first argument and must exist in ZONES.

### Multiple choice: `M(zone, question, options, correctIndex, deepExplanation, extras)`
```js
M("mkt","If demand is inelastic and price rises, total revenue will...",[
["Rise, because quantity falls by a smaller percentage than price rises","Right. Inelastic means quantity responds less than price."],   // correct option FIRST
["Fall, because buyers always cut back when prices rise","Only true if demand is elastic."],
["Stay the same","That is the unit-elastic case."],
["Cannot be determined without knowing supply","Supply is not needed: the demand elasticity decides this."]],
0,                                   // index of the correct option: always 0 (engine shuffles the display order)
"In depth: revenue = price x quantity. ...",   // 1-3 sentences; shown after a correct answer
{topic:"Elasticity",src:"Slides 4, p.12"});     // extras
```
- Exactly **4 options**. Each option has its own feedback string. Correct option goes first (`a`=0); the engine shuffles when displaying.
- Question text is shown as plain text (no HTML, it gets escaped). Use `x` for multiplication, not tags.
- Extras (the last argument, all optional except topic and src):
  - `topic`: string. **Required.** Must match the topic text in learn chapters exactly (see 5). Same topic string for related questions.
  - `src`: where in the course material the answer comes from (slide/page/reading). **Required by this spec** (not shown to students; lets the checker and the user verify facts).
  - `trick:true`: marks a "trap" question (negation, near-synonym, "which statements are correct: I, II, III" combos). Shows a Trap chip and feeds Trap round.
  - `fig:"name"`, `figPos:"before"`, `figOpt:{...}`: attach a diagram from figures.js (see 4).

### Short answer / essay: `T(zone, "short"|"essay", question, rubric, modelAnswer, extras)`
```js
T("mkt","short","Explain why a price ceiling below equilibrium creates a shortage.",[
 R("States that quantity demanded exceeds quantity supplied at the capped price","demanded|shortage|excess demand"),
 R("Explains why: low price raises demand and cuts supply","raises demand|reduces supply|incentive"),
 R("Gives a consequence or example (queues, black market, rent control)","queue|black market|rent control|example")],
 "Model answer in 3-6 sentences...",
 {topic:"Price controls",src:"Slides 3, p.8"});
```
- `R(rubricPoint, "keyword1|keyword2|...")`. The rubric point is plain English describing one idea the answer must contain (Claude marks against these). The keywords are lowercase fragments for the offline fallback (any one present = point earned); use stems (`maximi`) and several spellings. Score = points hit / total points x 10.
- Short: 4 to 6 rubric points, answer 40-120 words. Essay: 5 to 8 points, 250-400 words. Model answer is shown after marking.
- Questions are written as exam-style prompts a real instructor would set: "Explain", "Compare", "Critically assess", "Apply to this case".

### Per-zone targets (recommendation, from the Ethics build: 18/2/1 per zone)
At least ~10 MCQ, 2 short, 1 essay per zone. At least 3 trick MCQs in the whole course and 11 non-trick MCQs (Quick mock needs 3 trick + 11 normal + 3 short + 1 essay in total).

## 4. figures.js (optional)

Leave the file as a comment for a text-only course. To add a diagram: `FIGS.name={title:"...",cap:"one-line takeaway",svg:function(o){ ... return svgW(width,height,"alt text",innerSvg)}}` using helpers `svgW, tx, lines, box, ln, person` (see `courses/ethics/figures.js` for 5 working examples). `o.hl` highlights an element and `o.mask` hides labels so a question can ask the student to read the diagram. Attach to a question with `{fig:"name"}`. Do not use the old `FA` id map from the Ethics course (fragile: it depends on question order).

## 5. learn.js (required)

One chapter per topic:
```js
L("Section name","unique-id","Chapter title",{z:"mkt",tp:"Elasticity",body:
'<p>Plain explanation...</p>'+
'<ul><li><b>Term</b>: definition.</li></ul>'+
'<div class="exam"><b>Exam angle.</b> What the instructor asks about this and how to answer.</div>'+
'<p class="src">Source: Slides 4, pp.10-14 (verified from course material)</p>'});
```
- `Section name`: groups chapters in the Study guide (e.g. "Foundations"). `id`: unique, lowercase, no spaces.
- `z`: zone id. `tp`: **the topic string questions use**. "Practice this topic" runs questions whose `topic` equals `tp`; with fewer than 3 matches it falls back to the whole zone. So every chapter's `tp` needs at least 3 questions with the same topic string.
- `body` is HTML. Allowed and styled: `<p> <ul> <ol> <li> <b> <i>`, `<table class="cmp">` (comparison), `<div class="exam">` (exam tips), `<div class="flag">` (common mistakes / warnings), `<p class="src">` (source line). Optional `fig:"name"` shows a diagram at the top.
- Order within the book: start with a "Course map and how the exam works" chapter, then foundations before details.
- (recommendation) Short chapters of 150-350 words, one idea each, ending with the formal terms to memorize and an exam angle. Learn first, then play: every zone's chapters should cover everything its questions test.

## 6. exams.js (optional; skip unless you have a real past paper)

For a course without exam papers write only `var EXAMS=[];`. The Mock exams tab then shows an empty list (**engine gap, see section 8**).
If used, copy the shape in `courses/ethics/exams.js`: each paper has `id,title,sub,blurb,meta` (rows on the cover table), `cs` (a case study with `title`, `html`, `fict`), and `qs` (questions with `n,pts,kind,q,rub,model`, where `kind` is `"text"`, `"match"` or `"factors"`). Questions about the case set `case:true`. Points must sum to `CONFIG.examTotal`. The engine assumes a paper with a case study and the numbers `6a`/`6b` (hardcoded text, section 8).

---

## 7. Quality rules for generated content

Verified (from the Ethics files) :
1. Every wrong MCQ option has an explanation that names *why it is wrong* and, where possible, which concept it actually describes. This is the main teaching mechanism.
2. Rubric points are one idea each, so partial credit and feedback can be specific.
3. Question wording mirrors how the instructor writes real exam questions.

Rules this spec adds (recommendation, nothing here is tested):
4. **No invented facts.** Every question and chapter must come from the student's material. Each question has `src`; each chapter ends with a `<p class="src">` line. If the material is silent or unclear, leave it out and list it for the user as a gap. Never fill from memory without labelling it "unverified: not in the course material".
5. Distractors are plausible: real concepts from the same course that students confuse, not silly options.
6. Mix of recall (definitions), distinctions (A vs B) and application (apply to a mini case). Roughly 40/30/30.
7. Trap questions use only wording a real exam could use (negations, "NOT", combinations).
8. Do not copy long passages from readings or slides. Paraphrase.
9. Keep each rubric keyword list short and specific so the offline fallback does not give false hits.

## 8. Known engine gaps (to fix before generating non-Ethics courses at scale)
Verified by building `courses/_template/` (no figures, no exams) and clicking through every tab in the browser on 2026-11-17: Zones, Learn, Practice this topic, answering a question, My progress, Mock exams and Diagrams all work with no console errors. Two engine fixes came out of that test: `T()` now accepts the extras argument (so short/essay can carry `topic` and `src`), and `FIGS` is declared by the engine, not the course.
Still open (verified in `engine/main.js` or by the template test):
- Mock exams tab and Diagrams tab show up empty when a course has no exams or figures (should be hidden).
- Home text "14 multiple choice (3 of them traps), 3 short answers and 1 essay" is hardcoded.
- Exam view text "used in questions 6a and 6b" is hardcoded, and exams require a case study.
- Zone `sess` label and the study-guide search placeholder (`e.g. Kant, locus...`) are Ethics wording; the placeholder is hardcoded.
- Footer line says answers are "built from your notes and readings": fine for generated courses, wrong for others.

## 9. Output checklist (this is what the step-3 checker should enforce)
- Every zone id used in questions/chapters exists in ZONES and in `CONFIG.zshort`.
- Every MCQ has 4 options, each with feedback, `a` = 0, and `topic` + `src`.
- Every `T` has `topic` + `src`, 4+ rubric points, each with keywords.
- Every chapter `tp` has 3+ questions with that exact topic string.
- Chapter ids unique; `CONFIG.key` unique; ranks start at 0 and ascend.
- At least 3 trick MCQs, 11 other MCQs, 3 short, 1 essay overall.
- No `src` pointing outside the supplied material.
