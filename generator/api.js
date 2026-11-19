/**
 * Study Arena Multi-Provider AI Generator
 * Supports Claude (Anthropic), ChatGPT (OpenAI), and Google Gemini via client-side BYOK.
 */


var SAMPLE_MOCK_ESSAY_REVIEW = {
  "document_analysis": {
    "detected_type": "Argumentative Research Essay",
    "discipline": "Economics & Tech Policy",
    "primary_objective": "Examining whether big tech companies' control over AI computing power unfairly limits competition from smaller startups.",
    "academic_tone_rating": "College Undergraduate"
  },
  "grades": {
    "letter_grade": "A-",
    "score_out_of_20": 16.5,
    "grade_summary": "This is a thoughtful, well-researched paper that clearly explains how big tech companies control key AI infrastructure. Your thesis is strong and your arguments are logical. To earn a top A grade, add a bit more real-world pricing data and address counterarguments from competitors.",
    "rubric_breakdown": {
      "thesis_and_argumentation": {
        "score": 4.2,
        "max": 5.0,
        "feedback": "Your main argument is clear, specific, and takes a bold stance rather than just summarizing the news."
      },
      "evidence_and_counterarguments": {
        "score": 3.8,
        "max": 5.0,
        "feedback": "You support your points well, but you should mention free open-source models (like Meta's LLaMA) and explain why big companies still hold an advantage."
      },
      "structure_and_cohesion": {
        "score": 4.3,
        "max": 5.0,
        "feedback": "The flow between paragraphs is smooth and easy to follow from beginning to end."
      },
      "academic_style_and_mechanics": {
        "score": 4.2,
        "max": 5.0,
        "feedback": "Professional tone throughout, with just a couple of informal phrases and minor grammar points to polish."
      }
    }
  },
  "professor_critique": {
    "executive_summary": "This draft presents a clear thesis and logically structured arguments addressing the intersection of technology infrastructure and market dynamics. The primary areas for improvement are tightening colloquial language to maintain an academic register and directly engaging with key counterarguments before reaching policy conclusions.",
    "core_strengths": [
      "Clear, focused thesis that takes a definitive stand right from the start.",
      "Good distinction between the cost to train an AI model versus running it day-to-day.",
      "Strong organization that walks the reader logically through each main point."
    ],
    "critical_shortcomings": [
      "A few sentences slip into casual, conversational language that lowers the professional tone.",
      "You make a few claims about high customer costs without citing specific price comparisons or data."
    ],
    "counterarguments_to_add": [
      {
        "opposing_viewpoint": "Open-source AI models are free for anyone to download, meaning big tech cannot easily lock customers in.",
        "where_to_integrate": "In paragraph 3, right after explaining API subscription costs.",
        "how_it_strengthens_paper": "Addressing this demonstrates that you anticipate the common counterargument and can explain why big cloud platforms still maintain market power."
      },
      {
        "opposing_viewpoint": "Rapid innovation might naturally break tech monopolies as smaller startups invent faster, cheaper algorithms.",
        "where_to_integrate": "Near the end of paragraph 4, right before your conclusion.",
        "how_it_strengthens_paper": "Evaluating algorithmic efficiency gains demonstrates that technological alternatives were weighed before proposing regulatory intervention."
      }
    ]
  },
  "inline_annotations": [
    {
      "id": "ann-1",
      "category": "ACADEMIC_REGISTER",
      "original_text": "Tech giants are basically locking down all the best GPUs so smaller startups don't stand a chance.",
      "issue_diagnosis": "Phrases like 'basically locking down' and 'don\'t stand a chance' are too conversational for a college paper.",
      "professor_tip": "Use more precise, academic wording to describe market barriers.",
      "suggested_rewrite": "Major technology firms currently control the majority of high-end specialized AI computer chips, creating substantial barriers for newer competitors."
    },
    {
      "id": "ann-2",
      "category": "ARGUMENT_EXPANSION",
      "original_text": "Because switching models is hard, customers have to accept whatever prices the big platforms charge.",
      "issue_diagnosis": "This makes a bold claim without explaining *why* switching is difficult for customers.",
      "professor_tip": "Briefly mention specific reasons, such as software redesigns or team retraining costs.",
      "suggested_rewrite": "Because migrating software pipelines and retraining staff between AI platforms is costly and time-consuming, businesses face high switching friction and limited pricing flexibility."
    },
    {
      "id": "ann-3",
      "category": "GRAMMAR_SYNTAX",
      "original_text": "Examining the market definition, several empirical indicators suggests anticompetitive tying.",
      "issue_diagnosis": "Subject-verb agreement error: 'several empirical indicators' is plural, so it needs the plural verb 'suggest' instead of 'suggests'.",
      "professor_tip": "Double-check that plural subjects match plural verbs across long sentences.",
      "suggested_rewrite": "Examining the market definition, several empirical indicators suggest anticompetitive tying."
    },
    {
      "id": "ann-4",
      "category": "RHETORICAL_STRENGTH",
      "original_text": "It seems that maybe antitrust regulators might perhaps want to look into these cloud partnerships.",
      "issue_diagnosis": "Too many hesitation words ('seems that maybe', 'might perhaps') make your recommendation sound uncertain.",
      "professor_tip": "State your conclusion with confidence and clear reasoning.",
      "suggested_rewrite": "Consequently, antitrust authorities should closely examine these cloud-computing partnerships to protect competitive markets."
    }
  ]
};

window.StudyArenaAPI = {
  gradeShortAnswer: async function(questionText, rubricPoints, studentAnswer) {
    var provider = localStorage.getItem("sa_ai_provider") || "gemini";
    var apiKey = localStorage.getItem("sa_api_key_" + provider) || this.DEFAULT_GEMINI_KEY;
    if (!apiKey) apiKey = this.DEFAULT_GEMINI_KEY;

    var rubricDesc = (rubricPoints || []).map(function(r, i) {
      return (i + 1) + ". " + (r.p || r.point || "");
    }).join("\n");

    var prompt = "You are an academic examiner grading a student short answer against an exam rubric.\n" +
      "Evaluate whether each rubric point is satisfied. Accept valid conceptual paraphrases.\n" +
      "Provide hits (array of booleans), score (0-10), feedback (2-3 sentences), and socraticHint (1-2 sentences guiding the student if any points were missed, or congratulating if full marks).\n" +
      "Return strictly pure JSON with keys: hits, score, feedback, socraticHint.";

    var userContent = "QUESTION: " + questionText + "\n\nRUBRIC:\n" + rubricDesc + "\n\nSTUDENT ANSWER:\n" + studentAnswer;

    try {
      var raw = await this.callGeminiWithFallback(apiKey, prompt, userContent, null);
      var parsed = this.cleanJsonResponse(raw);
      return parsed;
    } catch (e) {
      console.warn("AI short answer grading failed, using heuristic:", e);
      var hits = (rubricPoints || []).map(function(r) {
        var kw = (r.k || r.keywords || "").split("|");
        var lower = (studentAnswer || "").toLowerCase();
        return kw.some(function(k) { return k.trim() && lower.includes(k.trim().toLowerCase()); });
      });
      var hitCount = hits.filter(Boolean).length;
      var total = (rubricPoints && rubricPoints.length) ? rubricPoints.length : 1;
      return {
        hits: hits,
        score: Math.round((hitCount / total) * 10 * 10) / 10,
        feedback: hitCount === total ? "Excellent answer addressing all core rubric criteria." : "Review the specific constraints required in the rubric.",
        socraticHint: hitCount < total ? "Consider how the underlying constraints directly impact the outcome." : "Mastery confirmed."
      };
    }
  },

  // Calls Gemini and parses JSON; on parse failure retries with the next model (rotated) up to 3 times.
  callGeminiParsed: async function(apiKey, systemPrompt, userContent, signal, onProgress) {
    var lastErr = null;
    for (var attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0 && typeof onProgress === "function") {
          onProgress("Response was malformed, retrying (attempt " + (attempt + 1) + " of 3)...", 50);
        }
        var raw = await this.callGeminiWithFallback(apiKey, systemPrompt, userContent, signal, onProgress, attempt);
        return this.cleanJsonResponse(raw);
      } catch (err) {
        if (err && (err.name === "AbortError" || (err.message && err.message.indexOf("API key is invalid") > -1))) throw err;
        lastErr = err;
      }
    }
    throw lastErr || new Error("Gemini returned unparseable output.");
  },

  callGeminiWithFallback: async function(apiKey, systemPrompt, userContent, signal, onProgress, rotate) {
    var candidateModels = [
      "gemini-flash-lite-latest",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
    ];
    if (rotate) {
      var rot = rotate % candidateModels.length;
      candidateModels = candidateModels.slice(rot).concat(candidateModels.slice(0, rot));
    }
    var lastErr = null;

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      try {
        if (i > 0 && typeof onProgress === "function") {
          onProgress("Switching to backup AI engine (" + model + ")...", 50);
        }
        var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
        var res = await fetch(url, {
          signal: signal,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userContent }] }],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.1,
              maxOutputTokens: 32768
            }
          })
        });

        if (!res.ok) {
          var errBody = await res.text();
          if (res.status === 400 && errBody.includes("API key not valid")) {
            throw new Error("Google Gemini API key is invalid (HTTP 400). Please click Settings (gear icon) and paste a valid key from Google AI Studio.");
          }
          console.warn("[Gemini API] " + model + " returned HTTP " + res.status + ", trying backup model...", errBody.slice(0, 150));
          lastErr = new Error("Gemini (" + model + " HTTP " + res.status + "): " + errBody);
          continue;
        }

        var jsonRes = await res.json();
        if (jsonRes.candidates && jsonRes.candidates[0] && jsonRes.candidates[0].content && jsonRes.candidates[0].content.parts) {
          return jsonRes.candidates[0].content.parts[0].text;
        }
        throw new Error("Empty candidate received from " + model);
      } catch (err) {
        if (err.name === "AbortError") throw err;
        if (err.message && err.message.includes("API key is invalid")) throw err;
        lastErr = err;
        console.warn("[Gemini API] Failed on " + model + ":", err.message);
      }
    }

    throw (lastErr || new Error("All Google Gemini candidate models were busy or unavailable. Please retry in a few moments."));
  },

  getDefaultGeminiKey: function() {
    try {
      var p1 = "QVEuQWI4Uk42S3VZVlkwZmdJ";
      var p2 = "MV9ibWI1cDd6QzVnTncxLXli";
      var p3 = "YTRRWHN0bDF2a01vakVTcnc=";
      if (typeof atob === "function") {
        return atob(p1 + p2 + p3);
      }
    } catch (e) {}
    return "";
  },

  get DEFAULT_GEMINI_KEY() {
    return this.getDefaultGeminiKey();
  },
  DEFAULT_GEMINI_MODEL: "gemini-3.1-flash-lite",
  MASTER_PROMPT: `You are an exacting university course instructor, curriculum architect, and exam writer across academic disciplines (Economics, Finance, Business, STEM, Medicine, Law, Computer Science, and Humanities).

Your mission is to transform raw student course materials (slides, readings, transcripts, syllabus notes, multiple lecture sessions) into a master study arena with an exhaustive, self-contained study guide and high-rigor exam simulations.

---

### CORE PEDAGOGICAL BLUEPRINT & COMPASS

1. MANDATORY STRUCTURAL DECOMPOSITION & HIERARCHICAL GROUPING (SESSIONS / MODULES / TOPICS):
   Uploaded student documents frequently span multiple course sessions or weeks (e.g., "Session 6", "Session 7", "Session 8", "Chapter 4", "Lecture 5", "Week 3", "Module 2"). You MUST actively inspect the material for these structural signposts:
   - ZONE ARCHITECTURE (One Zone per Session / Module):
     Every distinct Session, Chapter, Lecture, or Week identified in the source text MUST be mapped to its own dedicated Zone in the "zones" array!
     * Example: If the student provides material from Sessions 6, 7, and 8, you MUST output at least 3 distinct Zones:
       - Zone 1: id: "session-6", name: "Session 6: Aggregate Expenditure & GDP Measurement", sess: "Session 6", blurb: "National output accounting, expenditure components, and circular flow."
       - Zone 2: id: "session-7", name: "Session 7: Money Creation, Banking & The Money Multiplier", sess: "Session 7", blurb: "Fractional reserve banking, balance sheet mechanics, and money supply."
       - Zone 3: id: "session-8", name: "Session 8: Central Banking & Monetary Policy Transmission", sess: "Session 8", blurb: "Policy rates, open market operations, and macroeconomic stabilization."
     * NEVER collapse multiple distinct sessions into a single generic bucket.
   - CHAPTER ARCHITECTURE (Multiple In-Depth Concepts per Session):
     Inside EACH Session Zone, do NOT output just 1 high-level summary card! Identify all the outstanding concepts, models, and analytical tools taught in that session, and generate MULTIPLE distinct, comprehensive Chapters under that Zone (typically 2 to 3 distinct Chapters per Session).
     * Set each chapter's "section" to match the full Session Name (e.g. "Session 6: Aggregate Expenditure & GDP Measurement") so the student study guide groups them into clean, logical collapsible rubrics.
     * Set "zone" to match the corresponding zone id (e.g. "session-6").
     * Set "title" to the specific concept (e.g. "The Expenditure Method & GDP Components (C, I, G, NX)").
     * TOTAL CHAPTERS: If the material spans 3 sessions, produce 6 to 8 comprehensive chapters covering every single concept in the uploaded material.

2. THE "NO NEED TO READ SOURCE MATERIAL" MASTER TEXTBOOK STANDARD FOR LEARN CHAPTERS:
   The ultimate pedagogical goal of this application is that a student should be able to read ONLY the "Learn" chapters, master every concept completely, and achieve a 100% score on the exam without ever having to re-read the original slides or source text.
   - Target Depth: 450 to 700 words per Chapter of clean, rich, authoritative academic HTML.
   - ZERO UNEXPLAINED ACRONYMS, ABBREVIATIONS, OR FORMULAS (MANDATORY RULE):
     Whenever an equation, formula, model, or acronym appears (e.g., C + I + G + NX, WACC, MV = PY, IS-LM, CAPM, ROE), you MUST include an explicit, itemized breakdown explaining EVERY single letter, variable, and parameter:
     * What the variable stands for in full English words.
     * What it measures, its units, and its underlying economic / scientific intuition.
     * Crucial inclusions and exclusions.
       For example, for the expenditure approach to GDP (Y = C + I + G + NX):
       - Y = Gross Domestic Product (total output / aggregate income).
       - C = Household Consumption Expenditure: Spending by private households on durable goods, non-durable goods, and services (comprises ~65-70% of GDP).
       - I = Gross Private Domestic Investment: Spending on fixed business capital (machinery, software, commercial facilities), residential construction, and inventory changes. (Crucial rule: financial transactions like buying stocks or bonds are NOT economic investment).
       - G = Government Purchases: Spending by federal, state, and local governments on current goods and services (roads, defense, public sector salaries). Strictly EXCLUDES transfer payments (pensions, social welfare, unemployment insurance) because no new production occurs.
       - NX = Net Exports: Total exports (X) minus total imports (M).
   - MANDATORY FIVE-PART STRUCTURE IN EVERY CHAPTER:
     1. <b>Core Theoretical Mechanics:</b> Deep conceptual explanation of the principle, system dynamics, and why it matters in real-world practice.
     2. <div class='formula-breakdown'><b>Formula & Variable Breakdown:</b><ul><li><b>[Letter/Term] ([Full Name]):</b> Detailed definition, measurement, and boundary rules...</li></ul></div>
     3. <div class='how-to-apply'><b>How to Apply & Solve:</b><ol><li><b>Step 1: Parameter Identification</b> — What variables to extract from exam prompts.</li><li><b>Step 2: Formula & Framework Selection</b> — Stating the exact decision rule or equation.</li><li><b>Step 3: Calculation & Trade-Off Execution</b> — Step-by-step resolution of edge cases and trade-offs.</li></ol></div>
     4. <div class='micro-example'><b>Worked Micro-Scenario:</b> A concrete numerical demonstration or case scenario showing the methodology in action with real numbers and step-by-step calculations.</div>
     5. <div class='exam'><b>Professor Exam Traps & Pitfalls:</b> Explicitly highlight common student misconceptions, distractor traps, sign errors, and trick questions tested on university exams.

3. COMPREHENSIVE QUESTION VOLUME & RIGOR (MCQS AND ESSAYS / SHORT ANSWER):
   Students need realistic practice across all covered sessions.
   - For multi-session inputs (like Sessions 6, 7, 8):
     * Exactly 10 to 14 Multiple Choice Questions (MCQs) distributed evenly across all sessions and chapters.
     * Exactly 2 to 3 Short Answer / Case Study Questions testing synthesis and qualitative trade-off analysis.
     * TOTAL QUESTIONS: At least 12 to 17 questions!
   - Every single question must be 100% solvable using ONLY the material taught in the Learn chapters.

4. MULTI-LOGICAL DISTRACTORS & DEEP EXPLANATIONS:
   - No obvious joke answers. Distractors must represent real student pitfalls (the Half-Truth, the Misapplied Framework, the Sign Error, or the Short-Term Trap).
   - Provide an in-depth explanation for EVERY option (why the correct choice succeeds, and exactly which misconception traps each wrong choice).

5. EXAM RUBRIC CRITERIA (SHORT ANSWER & ESSAYS):
   Open-ended questions must be graded against specific rubric points evaluating:
   - Root-cause framing (identifying underlying structural issues, not surface symptoms).
   - Evidence & framework application (citing course models over casual opinion).
   - Trade-off analysis (short- vs. long-term impacts, stakeholder risks).
   - Provide a 3-5 sentence modelAnswer that demonstrates full mastery.

6. STRICT ANTI-SLOP STYLE & TONE DIRECTIVES:
   - Terse, concrete instructor tone.
   - Avoid flowery AI filler words ("delve", "tapestry", "beacon", "pivotal", "plethora", "crucial role", "in conclusion").

---

### OUTPUT SCHEMA REQUIREMENT

You must output PURE, VALID JSON with no markdown wrapping and no code fences, matching this exact schema.
CRITICAL JSON SYNTAX RULE: Every single object property name MUST be wrapped in double quotes (e.g. "options": [...], "question": "...", "type": "mcq", "zone": "..."). NEVER output unquoted keys. NEVER leave trailing commas before } or ].

{
  "config": {
    "key": "course-slug-v1",
    "title": "Course Name Arena",
    "subtitle": "Course Name · Exam Prep Simulator",
    "course": "Full course name and university context",
    "ranks": [
      [0, "Foundational Standing"],
      [150, "Proficiency Standing"],
      [350, "Advanced Practice"],
      [650, "Executive Mastery"],
      [1000, "Distinction Honors"]
    ],
    "zshort": {
      "session-6": "Session 6",
      "session-7": "Session 7"
    }
  },
  "zones": [
    {
      "id": "session-6",
      "name": "Session 6: Aggregate Expenditure & GDP Measurement",
      "sess": "Session 6",
      "blurb": "1-2 sentences summarizing core concepts."
    }
  ],
  "chapters": [
    {
      "id": "ch-gdp-expenditure",
      "title": "The Expenditure Method & GDP Components (C, I, G, NX)",
      "zone": "session-6",
      "topic": "GDP Expenditure Components",
      "section": "Session 6: Aggregate Expenditure & GDP Measurement",
      "body": "<p>Deep conceptual explanation of the principle and underlying mechanics...</p><div class='formula-breakdown'><b>Formula & Variable Breakdown:</b><ul><li><b>Y (Gross Domestic Product):</b> Total market value of all final goods and services...</li><li><b>C (Household Consumption):</b> Private household spending on durables, non-durables, and services...</li><li><b>I (Gross Private Investment):</b> Non-residential capital, residential structures, and inventory changes. Excludes financial stock purchases...</li><li><b>G (Government Purchases):</b> Current public purchases. Excludes transfer payments (pensions, benefits)...</li><li><b>NX (Net Exports):</b> Exports minus Imports (X - M)...</li></ul></div><div class='how-to-apply'><b>How to Apply & Solve:</b><ol><li><b>Step 1: Parameter Identification</b> — Detail what variables to extract from exam scenarios.</li><li><b>Step 2: Formula & Framework Selection</b> — State the exact formula or decision rule and explain why it applies.</li><li><b>Step 3: Calculation & Trade-Off Execution</b> — Walk through applying the framework to derive the optimal decision.</li></ol></div><div class='micro-example'><b>Worked Micro-Scenario:</b> Concrete scenario with numerical application demonstrating the step-by-step resolution.</div><div class='exam'><b>Professor Exam Traps & Pitfalls:</b> Detail common student mistakes, distractor traps, and critical boundary conditions tested on exams.</div>",
      "src": "Session 6 Slides, pp. 4-12"
    }
  ],
  "questions": [
    {
      "type": "mcq",
      "zone": "session-6",
      "topic": "GDP Expenditure Components",
      "question": "2-3 sentence micro-case scenario testing application of the chapter framework...",
      "options": [
        ["Correct choice: Best strategic action.", "Explanation: Why this is the optimal trade-off based on the chapter framework."],
        ["Distractor 1: Half-truth action.", "Explanation: Correct diagnosis, but fails the operational constraint explained in the chapter."],
        ["Distractor 2: Misapplied framework.", "Explanation: Employs an invalid framework for this specific constraint."],
        ["Distractor 3: Short-term trap.", "Explanation: Optimizes short-term metric while violating the boundary rule."]
      ],
      "correctIndex": 0,
      "deepExplanation": "In-depth professor debrief explaining the theoretical tension and why the correct choice succeeds...",
      "trick": true,
      "src": "Session 6 Slides, p. 8"
    },
    {
      "type": "short",
      "zone": "session-6",
      "topic": "GDP Expenditure Components",
      "question": "Scenario prompt asking to analyze a dilemma using frameworks taught in the chapters...",
      "rubric": [
        {
          "point": "Correctly diagnoses the primary operational bottleneck or constraint",
          "keywords": "bottleneck|capacity|utilization|throughput|constraint|expenditure|transfer"
        },
        {
          "point": "Applies the appropriate framework taught in the study guide",
          "keywords": "framework|model|principle|formula|gdp|consumption|investment"
        },
        {
          "point": "Proposes a viable mitigation strategy addressing core trade-offs",
          "keywords": "mitigation|tradeoff|cost|investment|budget|solution|policy"
        }
      ],
      "modelAnswer": "Comprehensive 3-5 sentence model response achieving full marks by applying the chapter framework...",
      "src": "Session 6 Slides, p. 11"
    }
  ]
}

---

### QUANTITY TARGETS PER GENERATION
- For Single Session / Short Input:
  * 1-2 Zones
  * 3-4 Chapters (450-700 words each with complete variable breakdowns)
  * 7-9 MCQs + 1-2 Short Answer questions
- For Multi-Session / Substantial Input (e.g. Sessions 6, 7, 8 or >1,500 words):
  * 3-4 Zones (one Zone per Session / Chapter identified in material)
  * 6-8 Chapters (2-3 Chapters per Session, completely unpacking all concepts)
  * 10-14 Multiple Choice Questions (MCQs) covering all sessions
  * 2-3 Short Answer / Essay Case Questions with keyword rubrics and model answers
  * TOTAL QUESTIONS: At least 12-17 questions
CRITICAL: Balance rich educational depth with compact, clean JSON syntax so the output completes well within token limits and closes all JSON brackets cleanly.`,


  PROFESSOR_ESSAY_PROMPT: `You are an academic essay and research paper evaluator. Your task is to provide direct, rigorous, and objective analytical evaluation on submitted drafts.

### CRITICAL TONE & REGISTER MANDATE:
- DO NOT use roleplay greetings or persona phrases (NEVER say "Hello", "Welcome", "I am your professor", "As your instructor", or "Good job!").
- DO NOT attempt to be personable, chatty, or conversational. Speak directly and objectively about the paper.
- Adopt a professional, matter-of-fact evaluation style that directly diagnoses strengths, logical gaps, academic register, and structural issues.
- Keep feedback straightforward, precise, and actionable so the author knows exactly what requires revision without unnecessary pleasantries.
- You do not rewrite the essay for the author; you provide surgical diagnosis, specific counterarguments to consider, and clear sentence-level annotations.

---

### DETERMINISTIC CALIBRATED GRADING MATRIX (0 to 20):
Calculate score_out_of_20 strictly as the exact sum of the four 5.0-point categories (Total = Cat1 + Cat2 + Cat3 + Cat4):
1. thesis_and_argumentation (0.0 to 5.0): Clarity, novelty, falsifiability.
2. evidence_and_counterarguments (0.0 to 5.0): Empirical warrants and anticipated objections.
3. structure_and_cohesion (0.0 to 5.0): Topic sentences, transitions, and flow.
4. academic_style_and_mechanics (0.0 to 5.0): Diction, tone, syntax, grammar.

- A Range (16.0 - 20.0): Exceptional rigor, thorough counterarguments, formal academic register.
- B Range (13.0 - 15.9): Good structure and clear thesis, but has colloquial phrases or unaddressed counterarguments.
- C Range (10.0 - 12.9): Descriptive, weak warrants, conversational diction.
- D/F Range (0.0 - 9.9): Lacks clear argument, significant grammar/syntax breakdown.

### MANDATORY INLINE ANNOTATIONS (3 to 6 REQUIRED):
You MUST provide between 3 and 6 items in "inline_annotations".
CRITICAL REQUIREMENT: For every item, "original_text" MUST be an exact, word-for-word, verbatim excerpt copied directly from the student essay so it can be located and highlighted in the interface.

### EVALUATION PIPELINE & STANDARDS

#### 1. Document Genre & Intent Classification
Before grading, automatically deduce the document type, target discipline, and rhetorical aim:
- Genre Identification: (e.g., Argumentative Essay, Empirical Research Report, Systematic Literature Review, Policy Brief, Analytical Paper, Case Study, Rhetorical Analysis).
- Target Audience & Register: Evaluate whether the draft conforms to conventions of the detected genre (e.g., APA/MLA/Chicago conventions, hedging language, third-person objective tone vs. argumentative assertiveness).

#### 2. Comparative Benchmark against Gold-Standard Academic Literature
Evaluate the submission against high-distinction, peer-reviewed university-level benchmarks:
- Thesis & Core Stance: Is the thesis falsifiable, nuanced, and intellectually ambitious, or merely descriptive?
- Dialectical Depth & Counterarguments: Does the author anticipate strong objections, alternate interpretations, and edge cases, or does it present a one-sided monologue?
- Evidence & Scholarly Warrants: Are empirical claims backed by warrants, data, or peer-reviewed citations, or do they rely on assertions?
- Structural Cohesion: Assess paragraph topic sentences, transitional logic between arguments, and conclusion synthesis (avoiding simple repetition).

#### 3. Granular Sentence-Level Annotations & Rewrites
Pinpoint exact text passages and categorize feedback into:
- GRAMMAR_SYNTAX: Subject-verb agreement, dangling modifiers, punctuation, run-on sentences.
- ACADEMIC_REGISTER: Replacing colloquial phrasing, filler words, or informal tone with scholarly diction.
- RHETORICAL_STRENGTH: Rephrasing weak claims, removing unwarranted hedges, or sharpening clarity.
- ARGUMENT_EXPANSION: Flagging where a counterargument, empirical citation, or theoretical backing is needed.
For every annotation, provide the exact target quote (verbatim substring from the student essay so it can be matched and highlighted), the diagnosis, an actionable tip, and a polished rewrite.

#### 4. Dual Grading Matrix (Real University Standards)
Provide two correlated grades calibrated against real university faculty distributions:
1. Letter Grade: A+, A, A-, B+, B, B-, C+, C, C-, D, or F.
   - A Range (16.0 - 20.0): Publishable or first-class honors quality. Original insight, air-tight thesis, strong counterarguments, pristine scholarly tone.
   - B Range (13.0 - 15.9): Solid upper-division work. Clear thesis and good structure, but contains mild argumentative gaps or pedestrian prose.
   - C Range (10.0 - 12.9): Passing but superficial. Descriptive rather than analytical, unaddressed objections, weak evidence.
   - D Range (8.0 - 9.9): Serious analytical or structural failures, disjointed arguments, poor academic register.
   - F Range (0.0 - 7.9): Fails basic university criteria, absent thesis, incoherent claims, or pervasive language breakdown.
2. Scale out of 20.0: European / International University Standard (e.g., 15.5/20).

---

### STRICT JSON OUTPUT FORMAT
You must return ONLY a valid, parseable JSON object with NO markdown code blocks, NO backticks, and NO trailing text, matching this exact schema:

{
  "document_analysis": {
    "detected_type": "string (e.g. Comparative Policy Analysis)",
    "discipline": "string (e.g. Political Science / Economics)",
    "primary_objective": "string (Summary of what the author is arguing or testing)",
    "academic_tone_rating": "string (e.g. Advanced Scholarly, Intermediate Undergraduate, Colloquial)"
  },
  "grades": {
    "letter_grade": "A | A- | B+ | B | B- | C+ | C | C- | D | F",
    "score_out_of_20": 15.5,
    "grade_summary": "string (2-3 sentences explaining why this exact grade was awarded based on faculty rubrics)",
    "rubric_breakdown": {
      "thesis_and_argumentation": { "score": 4.0, "max": 5.0, "feedback": "string" },
      "evidence_and_counterarguments": { "score": 3.5, "max": 5.0, "feedback": "string" },
      "structure_and_cohesion": { "score": 4.0, "max": 5.0, "feedback": "string" },
      "academic_style_and_mechanics": { "score": 4.0, "max": 5.0, "feedback": "string" }
    }
  },
  "professor_critique": {
    "executive_summary": "string (Direct, objective overall evaluation of the draft. Strictly avoid greetings, pleasantries, or persona roleplay such as 'Hello' or 'I am your professor'. Speak directly about the paper's thesis, structure, and areas for improvement)",
    "core_strengths": ["string", "string"],
    "critical_shortcomings": ["string", "string"],
    "counterarguments_to_add": [
      {
        "opposing_viewpoint": "string",
        "where_to_integrate": "string",
        "how_it_strengthens_paper": "string"
      }
    ]
  },
  "inline_annotations": [
    {
      "id": "ann-1",
      "category": "GRAMMAR_SYNTAX | ACADEMIC_REGISTER | RHETORICAL_STRENGTH | ARGUMENT_EXPANSION",
      "original_text": "Exact substring from the essay to highlight",
      "issue_diagnosis": "Detailed explanation of why this passage needs revision",
      "professor_tip": "Advice on how to think about this revision",
      "suggested_rewrite": "Polished academic rewrite of the target sentence or passage"
    }
  ]
}`,


  sanitizeJsonControlChars: function(raw) {
    var out = [];
    var inString = false;
    var escape = false;
    for (var j = 0; j < raw.length; j++) {
      var ch = raw[j];
      if (escape) {
        out.push(ch);
        escape = false;
        continue;
      }
      if (ch === '\\') {
        out.push(ch);
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        out.push(ch);
        continue;
      }
      if (inString) {
        if (ch === '\n') out.push('\\n');
        else if (ch === '\r') out.push('\\r');
        else if (ch === '\t') out.push('\\t');
        else out.push(ch);
      } else {
        out.push(ch);
      }
    }
    return out.join("");
  },

  splitCourseTextIntoChunks: function(text) {
    if (!text || text.length < 18000) return [text];

    // Step 1: Detect explicit demarcation boundaries in student notes
    // Matches:
    // 1. === SOURCE DOCUMENT X: ... ===
    // 2. Session 6, session7, Session_6, Chapter 3, Lecture 4, Week 2, Module 5
    // 3. PDF page markers: --- doc.pdf (Page X) ---
    var docPattern = /(?:^|\n)(?====\s*SOURCE\s+DOCUMENT\s+\d+[:\s\-])/i;
    var docSections = text.split(docPattern).map(function(s) { return s.trim(); }).filter(Boolean);

    var pieces = [];
    if (docSections.length >= 2) {
      for (var d = 0; d < docSections.length; d++) {
        var ds = docSections[d];
        if (ds.length > 22000) {
          var pagePattern = /(?:^|\n)(?=---\s*.+?\s*\(Page\s+\d+\)\s*---)/i;
          var pages = ds.split(pagePattern).map(function(p) { return p.trim(); }).filter(Boolean);
          var curPage = "";
          for (var p = 0; p < pages.length; p++) {
            if (curPage.length + pages[p].length > 18000 && curPage.length > 6000) {
              pieces.push(curPage);
              curPage = pages[p];
            } else {
              curPage = curPage ? (curPage + "\n\n" + pages[p]) : pages[p];
            }
          }
          if (curPage) pieces.push(curPage);
        } else {
          pieces.push(ds);
        }
      }
    } else {
      var sessionPattern = /(?:^|\n)(?=(?:Session|Chapter|Lecture|Week|Module|Part)\s*[-_]?\s*\d+[:\.\s\-\–\n])/i;
      var sections = text.split(sessionPattern).map(function(s) { return s.trim(); }).filter(Boolean);
      if (sections.length >= 2) {
        var curSess = "";
        for (var s = 0; s < sections.length; s++) {
          if (curSess.length + sections[s].length > 18000 && curSess.length > 6000) {
            pieces.push(curSess);
            curSess = sections[s];
          } else {
            curSess = curSess ? (curSess + "\n\n" + sections[s]) : sections[s];
          }
        }
        if (curSess) pieces.push(curSess);
      } else {
        var fallbackPattern = /(?:^|\n)(?=---\s*.+?\s*\(Page\s+\d+\)\s*---|\n{2,})/i;
        var subparts = text.split(fallbackPattern).map(function(sp) { return sp.trim(); }).filter(Boolean);
        var curPart = "";
        for (var sp = 0; sp < subparts.length; sp++) {
          if (curPart.length + subparts[sp].length > 18000 && curPart.length > 6000) {
            pieces.push(curPart);
            curPart = subparts[sp];
          } else {
            curPart = curPart ? (curPart + "\n\n" + subparts[sp]) : subparts[sp];
          }
        }
        if (curPart) pieces.push(curPart);
      }
    }

    if (pieces.length > 1) {
      var chunks = [];
      var curChunk = "";
      for (var k = 0; k < pieces.length; k++) {
        if (curChunk.length + pieces[k].length > 24000 && curChunk.length > 8000) {
          chunks.push(curChunk);
          curChunk = pieces[k];
        } else {
          curChunk = curChunk ? (curChunk + "\n\n" + pieces[k]) : pieces[k];
        }
      }
      if (curChunk) chunks.push(curChunk);
      if (chunks.length > 1) return chunks;
    }

    return [text];
  },

  sanitizeJsonRobust: function(text) {
    if (!text) return "{}";
    text = this.sanitizeJsonControlChars(text);
    // Auto-quote unquoted object property names (e.g. options: -> "options":)
    text = text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g, '$1"$2":');
    // Strip illegal trailing commas before closing braces or brackets
    text = text.replace(/,\s*([}\]])/g, '$1');
    return text;
  },

  cleanJsonResponse: function(raw) {
    if (!raw || (typeof raw !== "string" && !raw.trim)) {
      throw new Error("Empty response received from AI model. Please retry.");
    }
    var text = String(raw).trim();
    if (text.startsWith("```json")) {
      text = text.substring(7);
    } else if (text.startsWith("```")) {
      text = text.substring(3);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();
    var firstOpen = text.indexOf("{");
    if (firstOpen !== -1) {
      text = text.substring(firstOpen);
    }

    text = this.sanitizeJsonRobust(text);

    // Step 2: Try direct parse
    try {
      return JSON.parse(text);
    } catch (initialErr) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("Direct JSON.parse failed, attempting auto-repair:", initialErr.message);
      }
    }

    // Step 3: Resilient Stack-Based Auto-Repair for truncated JSON
    var maxLookback = Math.min(text.length, 8000);
    for (var i = text.length; i >= text.length - maxLookback; i--) {
      var candidate = text.substring(0, i).trimEnd();
      if (candidate.endsWith(",") || candidate.endsWith(":")) {
        candidate = candidate.slice(0, -1).trimEnd();
      }

      var stack = [];
      var inString = false;
      var escape = false;
      var valid = true;

      for (var j = 0; j < candidate.length; j++) {
        var ch = candidate[j];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === '\\') {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (ch === '{') {
            stack.push('}');
          } else if (ch === '[') {
            stack.push(']');
          } else if (ch === '}' || ch === ']') {
            if (stack.length === 0 || stack[stack.length - 1] !== ch) {
              valid = false;
              break;
            }
            stack.pop();
          }
        }
      }

      if (valid && stack.length > 0) {
        var repaired = inString ? (candidate + '"') : candidate;
        // Close all unclosed scopes in exact reverse order
        for (var s = stack.length - 1; s >= 0; s--) {
          repaired += stack[s];
        }
        repaired = repaired.replace(/,\s*([}\]])/g, "$1");
        try {
          var parsed = JSON.parse(repaired);
          if (typeof console !== "undefined" && console.log) {
            console.log("JSON auto-repaired successfully! Rescued by trimming " + (text.length - i) + " chars (inString=" + inString + ").");
          }
          return parsed;
        } catch (e) {
          // continue searching backwards
        }
      }
    }

    // Fallback: throw original error
    return JSON.parse(text);
  },

  fetchClaudeModels: async function(apiKey) {
    try {
      var res = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        }
      });
      if (res.ok) {
        var data = await res.json();
        return (data.data || []).map(function(m) { return m.id; });
      }
    } catch (e) {
      console.warn("Could not list Claude models:", e);
    }
    return [];
  },

  currentController: null,

  abort: function() {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
  },

    updateArena: async function(existingCourseData, newMaterialText, newTeacherNotes, onProgress) {
    this.abort();
    this.currentController = new AbortController();
    var signal = this.currentController.signal;

    var provider = localStorage.getItem("sa_ai_provider") || "gemini";
    var apiKey = localStorage.getItem("sa_api_key_" + provider) || "";
    if (!apiKey && provider === "gemini") {
      apiKey = this.DEFAULT_GEMINI_KEY;
    }
    if (!apiKey) {
      apiKey = localStorage.getItem("sa_api_key_gemini") || this.DEFAULT_GEMINI_KEY;
      if (apiKey) provider = "gemini";
    }

    onProgress("Analyzing existing arena and new course materials...", 20);

    var existingSummary = "EXISTING COURSE: " + ((existingCourseData.config && existingCourseData.config.title) || "Custom Arena") + "\n" +
      "CURRENT CHAPTERS: " + (existingCourseData.chapters || []).map(function(c) { return c.title + " (" + (c.topic || "") + ")"; }).join(", ") + "\n" +
      "CURRENT QUESTION COUNT: " + (existingCourseData.questions || []).length;

    var updatePrompt = `You are an exacting university exam architect updating an existing study arena with NEW lecture materials.

### CONTEXT & RULES:
1. Review the existing arena structure to avoid duplicate questions or redundant concepts.
2. Synthesize the NEW lecture material into additional high-rigor micro-case scenario questions and study chapters.
3. Every new question must follow the multi-logical distractor blueprint (realistic traps, detailed explanation, no trivia recall).
4. Return ONLY a valid parseable JSON object matching this schema:
{
  "zones": [
    { "id": "string", "name": "string", "sess": "string", "blurb": "string" }
  ],
  "chapters": [
    { "id": "string", "title": "string", "zone": "string", "topic": "string", "body": "<p>Content</p>", "src": "string" }
  ],
  "questions": [
    {
      "type": "mcq",
      "zone": "string",
      "topic": "string",
      "question": "Scenario question text",
      "options": [
        ["Correct option statement.", "Detailed explanation of why correct."],
        ["Tempting distractor 1.", "Diagnostic trap explanation."],
        ["Tempting distractor 2.", "Diagnostic trap explanation."],
        ["Tempting distractor 3.", "Diagnostic trap explanation."]
      ],
      "correctIndex": 0,
      "deepExplanation": "Theoretical warrant explaining the core principle.",
      "trick": false,
      "src": "Slide/Chapter"
    }
  ]
}`;

    var userContent = existingSummary + "\n\nNEW COURSE MATERIAL TO INGEST & ADD TO ARENA:\n\n" + newMaterialText;
    if (newTeacherNotes && newTeacherNotes.trim()) {
      userContent += "\n\nNEW TEACHER NOTES / PROFESSOR HINTS:\n\n" + newTeacherNotes;
    }

    var rawResponse = "";

    if (provider === "claude") {
      onProgress("Contacting Claude for new material synthesis...", 35);
      var candidateModels = [
        "claude-3-7-sonnet-20250219",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-haiku-20240307"
      ];
      var savedModel = localStorage.getItem("sa_model_claude");
      if (savedModel && !candidateModels.includes(savedModel)) candidateModels.unshift(savedModel);

      var lastError = null;
      for (var ci = 0; ci < candidateModels.length; ci++) {
        var mToTry = candidateModels[ci];
        try {
          var res = await fetch("https://api.anthropic.com/v1/messages", {
            signal: signal,
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
              "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
              model: mToTry,
              max_tokens: 4096,
              system: updatePrompt,
              messages: [{ role: "user", content: userContent }]
            })
          });

          if (!res.ok) {
            var errB = await res.text();
            lastError = errB;
            if (res.status === 404 || res.status === 400) continue;
            throw new Error("Claude API error (" + res.status + "): " + errB);
          }

          var cJson = await res.json();
          var tBlocks = (cJson.content || []).filter(function(b) { return b.type === "text" || b.text; });
          rawResponse = tBlocks.map(function(b) { return b.text; }).join("\n");
          if (rawResponse) break;
        } catch (fErr) {
          if (fErr.name === "AbortError") throw fErr;
          lastError = fErr.message;
        }
      }
      if (!rawResponse) throw new Error("Claude update failed: " + (lastError || "all models unavailable"));

    } else if (provider === "openai") {
      onProgress("Synthesizing new material with OpenAI...", 40);
      var modelName = localStorage.getItem("sa_model_openai") || "gpt-4o";
      var res = await fetch("https://api.openai.com/v1/chat/completions", {
        signal: signal,
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: updatePrompt },
            { role: "user", content: userContent }
          ]
        })
      });
      if (!res.ok) throw new Error("OpenAI error (" + res.status + "): " + (await res.text()));
      var jRes = await res.json();
      rawResponse = jRes.choices[0].message.content;

    } else if (provider === "gemini") {
      onProgress("Creating additional questions & distractors...", 45);
      rawResponse = await this.callGeminiWithFallback(apiKey, updatePrompt, userContent, signal, onProgress);
    }

    onProgress("Merging new material into study arena...", 80);
    var newPatchData = this.cleanJsonResponse(rawResponse);

    // Merge into existingCourseData
    var merged = JSON.parse(JSON.stringify(existingCourseData));

    // Merge zones
    var existingZoneIds = (merged.zones || []).map(function(z) { return z.id; });
    (newPatchData.zones || []).forEach(function(nz) {
      if (nz && nz.id && !existingZoneIds.includes(nz.id)) {
        merged.zones.push(nz);
        existingZoneIds.push(nz.id);
      }
    });

    // Merge chapters
    var existingChapterTitles = (merged.chapters || []).map(function(c) { return (c.title || "").toLowerCase(); });
    (newPatchData.chapters || []).forEach(function(nc) {
      if (nc && nc.title && !existingChapterTitles.includes(nc.title.toLowerCase())) {
        merged.chapters.push(nc);
      }
    });

    // Merge questions
    var existingQTexts = (merged.questions || []).map(function(q) { return (q.question || "").toLowerCase().slice(0, 40); });
    var addedCount = 0;
    (newPatchData.questions || []).forEach(function(nq) {
      if (nq && nq.question) {
        var snippet = nq.question.toLowerCase().slice(0, 40);
        if (!existingQTexts.includes(snippet)) {
          merged.questions.push(nq);
          addedCount++;
        }
      }
    });

    onProgress("Compiling updated Study Arena...", 92);
    var compiledHtml = window.StudyArenaCompiler.compile(merged);

    onProgress("Arena successfully updated!", 100);
    return {
      courseData: merged,
      compiledHtml: compiledHtml,
      addedQuestionsCount: addedCount,
      newChaptersCount: (newPatchData.chapters || []).length
    };
  },

  generate: async function(courseText, teacherNotes, onProgress) {
    this.abort();
    this.currentController = new AbortController();
    var signal = this.currentController.signal;

    // Safe mock mode for UI testing without calling paid APIs (?mock=ok or ?mock=error)
    var params = new URLSearchParams(window.location.search);
    var mockMode = params.get("mock");
    if (mockMode === "error") {
      onProgress("Reading syllabus & lecture notes...", 15);
      await new Promise(function(r) { setTimeout(r, 300); });
      throw new Error("HTTP 401 on [claude-sonnet-4-6]: {\"type\":\"error\",\"error\":{\"type\":\"authentication_error\",\"message\":\"invalid x-api-key\"}}");
    }
    if (mockMode === "ok") {
      onProgress("Reading syllabus & lecture notes...", 18);
      await new Promise(function(r) { setTimeout(r, 700); });
      onProgress("Creating tools & distractor traps...", 48);
      await new Promise(function(r) { setTimeout(r, 900); });
      onProgress("Synthesizing scenario-based arenas...", 76);
      await new Promise(function(r) { setTimeout(r, 800); });
      onProgress("Compiling offline Study Arena...", 95);
      await new Promise(function(r) { setTimeout(r, 600); });
      var mockData = {
        config: {
          key: "corporate-finance-wacc",
          title: "Corporate Finance: Cost of Capital",
          subtitle: "WACC, Capital Structure & Pecking Order",
          course: "Corporate Finance",
          ranks:[[0,"Foundational Standing"],[150,"Proficiency Standing"],[350,"Advanced Practice"],[650,"Executive Mastery"],[1000,"Distinction Honors"]],
          zshort: { "wacc": "WACC & CAPM", "mm": "Modigliani-Miller" }
        },
        zones: [
          { id: "wacc", name: "WACC & Cost Components", sess: "Session 1", blurb: "After-tax debt cost and CAPM equity cost." },
          { id: "mm", name: "Capital Structure & Trade-Off", sess: "Session 2", blurb: "Tax shields vs financial distress costs." }
        ],
        chapters: [
          {
            id: "ch-wacc",
            title: "Weighted Average Cost of Capital & CAPM",
            zone: "wacc",
            topic: "WACC Formula",
            section: "Cost of Capital Foundations",
            body: "<p class='ch-intro'>The Weighted Average Cost of Capital (WACC) represents a firm's blended cost of capital across all funding sources (equity, debt, and preferred equity), weighted by their target market values. Because interest payments on corporate debt are tax-deductible expenses, debt financing generates an interest tax shield that reduces the effective cost of debt to <code>Rd * (1 - Tc)</code>.</p><div class='how-to-apply'><b>How to Apply & Solve WACC Problems:</b><ol><li><b>Step 1: Determine Capital Structure Weights</b> &mdash; Use market values (never historical book values). Ensure <code>(E/V) + (D/V) = 1.0</code>. If given D/V = 40%, then E/V = 60%.</li><li><b>Step 2: Derive Cost of Equity via CAPM</b> &mdash; Calculate <code>Re = Rf + Beta * (Rm - Rf)</code>. The market risk premium is strictly <code>(Rm - Rf)</code>. If expected market return Rm is 8% and Rf is 3%, the risk premium is 5%, yielding <code>Re = 3% + Beta * 5%</code>.</li><li><b>Step 3: Calculate After-Tax Cost of Debt</b> &mdash; Multiply pre-tax debt yield Rd by <code>(1 - Tc)</code>. For Rd = 6% and Tc = 25%, after-tax debt is <code>6% * (1 - 0.25) = 4.5%</code>.</li><li><b>Step 4: Blend Components</b> &mdash; <code>WACC = (E/V * Re) + (D/V * Rd * (1 - Tc))</code>.</li></ol></div><div class='micro-example'><b>Worked Micro-Scenario:</b> A firm with 40% debt, 60% equity, pre-tax Rd = 6%, Re = 11%, and tax rate Tc = 25%: <code>WACC = (0.60 * 11%) + (0.40 * 6% * (1 - 0.25)) = 6.60% + 1.80% = 8.40%</code>.</div><div class='exam'><b>Professor Exam Traps & Pitfalls:</b><br>&bull; <i>The False Shield Trap:</i> Dividends and equity returns are paid from after-tax earnings and are NEVER tax-deductible. Applying (1 - Tc) to equity yields an automatic zero.<br>&bull; <i>The Risk Premium Trap:</i> Confusing expected market return (Rm) with the market risk premium (Rm - Rf). Multiplying beta directly by Rm inflates cost of equity.<br>&bull; <i>Book Value Distortion:</i> Using balance sheet book equity instead of market capitalization.</div>",
            src: "Slides 1-8"
          },
          {
            id: "ch-mm",
            title: "Modigliani-Miller & Capital Structure Theories",
            zone: "mm",
            topic: "Capital Structure",
            section: "Capital Structure Decisions",
            body: "<p class='ch-intro'>Capital structure theory evaluates how debt leverage impacts firm value and cost of capital under varying market frictions:</p><ul><li><b>MM Proposition I (No Taxes):</b> In perfect, frictionless capital markets without taxes or bankruptcy costs, total firm value is entirely independent of capital structure (<code>VL = VU</code>). Slicing operating cash flows between debt and equity does not create value because homemade leverage by individual investors offsets corporate leverage. WACC remains constant because the cost of equity rises linearly with leverage to compensate for financial risk.</li><li><b>MM Proposition I (With Taxes):</b> When interest is tax-deductible, issuing debt creates a perpetual tax shield worth <code>Tc * D</code>, so firm value increases linearly with debt: <code>VL = VU + (Tc * D)</code>.</li><li><b>Static Trade-Off Theory:</b> Real firms balance the marginal present value of interest tax shields against the marginal expected costs of financial distress (bankruptcy costs, agency conflicts, loss of customers). Optimal leverage occurs where the marginal tax benefit equals marginal distress cost.</li><li><b>Pecking Order Theory:</b> Because managers possess asymmetric private information about asset values, issuing new equity signals that shares are overvalued by the market. Consequently, firms follow a strict financing hierarchy: 1) Internal cash/retained earnings first (zero information asymmetry), 2) Low-risk debt second, and 3) New common equity strictly as a last resort.</li></ul><div class='how-to-apply'><b>How to Apply Capital Structure Frameworks on Exams:</b><ol><li><b>Check Friction Assumptions:</b> If the question specifies 'perfect markets' or 'no taxes', invoke MM I: firm value is unchanged and WACC is constant.</li><li><b>Distinguish Trade-Off vs. Pecking Order:</b> If management targets a permanent debt-equity ratio, apply Static Trade-Off. If management needs funding and prioritizes internal cash over debt to avoid adverse market signals, apply Pecking Order.</li></ol></div><div class='exam'><b>Professor Exam Traps:</b> Examiners frequently propose an equity issue to 'preserve borrowing capacity' as a trap. Under Pecking Order, issuing equity is the most expensive negative market signal and is avoided whenever internal funds exist.</div>",
            src: "Slides 9-16"
          }
        ],
        questions: [
          {
            type: "mcq",
            zone: "wacc",
            topic: "WACC Formula",
            question: "NovaTech GmbH has a market debt-to-value ratio of 40%, pre-tax cost of debt of 6%, cost of equity of 11%, and faces a 25% corporate tax rate. What is its WACC?",
            options: [
              ["8.40%, using the after-tax debt cost of 4.50% weighted at 40% plus equity at 60%.","Correct. (0.60 * 11%) + (0.40 * 6% * (1 - 0.25)) = 6.60% + 1.80% = 8.40%."],
              ["9.00%, using the pre-tax debt cost of 6.00% weighted at 40% plus equity at 60%.","Trap: forgets the interest tax shield (1 - Tc) on debt."],
              ["6.75%, applying the (1 - 0.25) tax shield to both debt and equity components.","Trap: dividends and equity returns are not tax-deductible at the corporate level."],
              ["8.60%, weighting equity at 40% and after-tax debt at 60%.","Trap: reverses the capital structure weights."]
            ],
            correctIndex: 0,
            deepExplanation: "Only interest is tax-deductible, so only Rd is multiplied by (1 - Tc).",
            trick: true,
            src: "Slide 4"
          },
          {
            type: "mcq",
            zone: "mm",
            topic: "Capital Structure",
            question: "A profitable manufacturer with abundant retained earnings needs to fund a new plant. Under Myers and Majluf's Pecking Order Theory, which financing source will management choose first?",
            options: [
              ["Internal retained earnings, to avoid adverse selection signals from external issues.","Correct. Pecking order ranks internal funds first, then debt, and equity last."],
              ["New common equity, to preserve borrowing capacity and avoid fixed interest covenants.","Trap: issuing equity sends a negative signal that management believes shares are overvalued."],
              ["Subordinated convertible bonds, to split the difference between debt and equity.","Trap: hybrid securities still suffer from information asymmetry compared to internal cash."],
              ["A 50/50 mix of debt and equity to maintain a static target leverage ratio.","Trap: that describes Static Trade-Off Theory, not Pecking Order."]
            ],
            correctIndex: 0,
            deepExplanation: "Asymmetric information makes external equity the most expensive signal, so firms use internal cash first.",
            trick: false,
            src: "Slide 14"
          },
          {
            type: "mcq",
            zone: "wacc",
            topic: "WACC Formula",
            question: "A firm's equity beta is 1.2, the risk-free rate is 3%, and the expected market return is 8%. Using CAPM, what is its cost of equity?",
            options: [
              ["9.0%, calculated as 3% + 1.2 * (8% - 3%).","Correct. The market risk premium is (8% - 3%) = 5%, multiplied by beta 1.2 gives 6% + 3% = 9.0%."],
              ["12.6%, calculated as 3% + 1.2 * 8%.","Trap: confuses the expected market return (Rm) with the market risk premium (Rm - Rf)."],
              ["8.0%, equal to the expected return on the market portfolio.","Trap: ignores the firm's beta of 1.2 above the market average of 1.0."],
              ["6.0%, calculated as 1.2 * (8% - 3%).","Trap: omits the risk-free rate Rf."]
            ],
            correctIndex: 0,
            deepExplanation: "CAPM is Re = Rf + Beta * (Rm - Rf). Always subtract Rf from Rm before multiplying by Beta.",
            trick: true,
            src: "Slide 6"
          },
          {
            type: "mcq",
            zone: "mm",
            topic: "Capital Structure",
            question: "Under Modigliani-Miller Proposition I without taxes or distress costs, what happens to total firm value if management replaces 20% of its equity with low-interest debt?",
            options: [
              ["Total firm value stays unchanged because cash flows from operating assets do not change.","Correct. In frictionless markets, slicing operating cash flows differently does not alter total value."],
              ["Total firm value rises because cheaper debt lowers the weighted average cost of capital.","Trap: as leverage rises, equity becomes riskier and Re rises enough to offset the cheaper debt."],
              ["Total firm value falls because debt covenants restrict future capital expenditures.","Trap: MM Proposition I assumes frictionless capital markets with no agency or distress costs."],
              ["Total firm value rises by the face value of the newly issued debt.","Trap: debt proceeds retire equity dollar-for-dollar in a recapitalization."]
            ],
            correctIndex: 0,
            deepExplanation: "Without taxes, WACC is constant across leverage levels because Re increases linearly with D/E.",
            trick: true,
            src: "Slide 10"
          },
          {
            type: "short",
            zone: "mm",
            topic: "Capital Structure",
            question: "Explain how Static Trade-Off Theory determines a firm's optimal debt ratio when both corporate taxes and financial distress costs exist.",
            rubric: [
              { point: "Identifies the interest tax shield benefit of debt", keywords: "tax shield|interest|deductible|tax" },
              { point: "Identifies costs of financial distress or bankruptcy", keywords: "distress|bankruptcy|default|agency" },
              { point: "States that optimal leverage equates marginal benefit and marginal cost", keywords: "marginal|balance|trade-off|optimal" }
            ],
            modelAnswer: "Static Trade-Off Theory balances the present value of interest tax shields against the present value of financial distress and agency costs. A firm increases debt until the marginal tax shield benefit of the last dollar of debt equals its marginal expected distress cost.",
            src: "Slide 12"
          }
        ]
      };
      var mockHtml = window.StudyArenaCompiler.compile(mockData);
      onProgress("Ready to play.", 100);
      return { courseData: mockData, compiledHtml: mockHtml };
    }

    var provider = localStorage.getItem("sa_ai_provider") || "gemini";
    var apiKey = localStorage.getItem("sa_api_key_" + provider) || "";
    if (!apiKey && provider === "gemini") {
      apiKey = this.DEFAULT_GEMINI_KEY;
    }

    if (!apiKey) {
      apiKey = localStorage.getItem("sa_api_key_gemini") || this.DEFAULT_GEMINI_KEY;
      if (apiKey) provider = "gemini";
    }

    if (!apiKey) {
      throw new Error("API key required. Click Settings to enter a key.");
    }

    onProgress("Reading syllabus & lecture notes...", 15);

    var userContent = "COURSE LECTURE MATERIAL TO TRANSFORM:\n\n" + courseText;
    if (teacherNotes && teacherNotes.trim()) {
      userContent += "\n\nOPTIONAL TEACHER NOTES / RUBRICS / EXAM STYLE GUIDE:\n\n" + teacherNotes;
    }

    var rawResponse = "";

    if (provider === "claude") {
      onProgress("Checking API connection & active models...", 25);
      var allModels = await this.fetchClaudeModels(apiKey);
      console.log("Anthropic /v1/models returned:", allModels);

      var candidateModels = [];

      // 1. Account-specific active models from /v1/models first
      if (allModels && allModels.length > 0) {
        allModels.filter(function(m) {
          var l = m.toLowerCase();
          return !l.includes("fable") && !l.includes("mythos");
        }).forEach(function(m) {
          if (!candidateModels.includes(m)) candidateModels.push(m);
        });
      }

      // 2. Known production model IDs across Anthropic tiers
      var KNOWN_MODELS = [
        "claude-3-7-sonnet-20250219",
        "claude-3-7-sonnet-latest",
        "claude-3-7-sonnet",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-20240620",
        "claude-3-5-sonnet-latest",
        "claude-3-5-haiku-20241022",
        "claude-3-5-haiku-latest",
        "claude-3-haiku-20240307",
        "claude-3-opus-20240229",
        "claude-3-opus-latest"
      ];

      KNOWN_MODELS.forEach(function(m) {
        if (!candidateModels.includes(m)) candidateModels.push(m);
      });

      console.log("Candidate models to try:", candidateModels);
      var attemptErrors = [];

      for (var i = 0; i < candidateModels.length; i++) {
        var modelToTry = candidateModels[i];
        onProgress("Creating tools & distractor traps...", 45);

        var skipThisModel = false;

        try {
          var claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            signal: signal,
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
              "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
              model: modelToTry,
              max_tokens: 8192,
              system: this.MASTER_PROMPT,
              messages: [{ role: "user", content: userContent }]
            })
          });

          if (!claudeRes.ok) {
            var errText = await claudeRes.text();
            var errMsg = "HTTP " + claudeRes.status + " on [" + modelToTry + "]: " + errText;
            console.warn(errMsg);
            attemptErrors.push(errMsg);

            if (claudeRes.status === 404 || claudeRes.status === 400) {
              skipThisModel = true;
            } else {
              throw new Error("Claude API blocked (HTTP " + claudeRes.status + "):\n\n" + errMsg);
            }
          } else {
            var claudeJson = await claudeRes.json();
            var textBlocks = (claudeJson.content || []).filter(function(b) { return b.type === "text" || b.text; });
          rawResponse = textBlocks.map(function(b) { return b.text; }).join("\n");
            localStorage.setItem("sa_model_claude", modelToTry);
            console.log("SUCCESS with model:", modelToTry);
          }

        } catch (fetchErr) {
          if (fetchErr && fetchErr.name === "AbortError") throw new Error("Generation cancelled.");
          if (!skipThisModel) {
            var msg = fetchErr.message || String(fetchErr);
            throw new Error(msg + (attemptErrors.length ? "\n\nAttempts so far:\n" + attemptErrors.join("\n\n") : ""));
          }
        }

        if (rawResponse) break;
      }

      if (!rawResponse) {
        throw new Error(
          "DIAGNOSIS: All " + candidateModels.length + " models returned HTTP 404.\n\n" +
          "Your Anthropic account\'s /v1/models lists: " + JSON.stringify(allModels) + "\n\n" +
          "But /v1/messages rejects ALL of them (and all standard aliases too).\n\n" +
          "ACTION: Switch to Gemini (free) in AI Settings (BYOK).\n\n" +
          "--- Errors per model ---\n" + attemptErrors.join("\n\n")
        );
      }

        } else if (provider === "openai") {
      onProgress("Creating tools & distractor traps...", 45);
      var res = await fetch("https://api.openai.com/v1/chat/completions", {
        signal: signal,
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: this.MASTER_PROMPT },
            { role: "user", content: userContent }
          ]
        })
      });

      if (!res.ok) {
        var errBody = await res.text();
        throw new Error("OpenAI API error (" + res.status + "): " + errBody);
      }
      var jsonRes = await res.json();
      rawResponse = jsonRes.choices[0].message.content;

    } else if (provider === "gemini") {
      var isDev = (window.StudyArenaAuth && typeof window.StudyArenaAuth.isDeveloper === "function" && window.StudyArenaAuth.isDeveloper());
      if (!isDev) {
        try {
          var uRaw = localStorage.getItem("sa_auth_user_v1");
          if (uRaw) {
            var u = JSON.parse(uRaw);
            if (u && (u.developerMode || u.role === "developer" || (u.email && u.email.toLowerCase().indexOf("eliasjabbie") > -1))) {
              isDev = true;
            }
          }
        } catch (e) {}
      }
      var chunks = (courseText.length >= 18000 || isDev) ? this.splitCourseTextIntoChunks(courseText) : [courseText];
      if (chunks.length > 1) {
        onProgress("Large course document detected (~" + Math.round(courseText.length / 5) + " words). Running smart multi-pass synthesis across " + chunks.length + " parts...", 25);
        var mergedData = null;
        for (var p = 0; p < chunks.length; p++) {
          var pctBase = Math.round(25 + (p / chunks.length) * 50);
          onProgress("Synthesizing Part " + (p + 1) + " of " + chunks.length + " (Chapters, Sessions & Questions)...", pctBase);
          var chunkUserContent = "COURSE LECTURE MATERIAL (PART " + (p + 1) + " OF " + chunks.length + "):\n\n" + chunks[p];
          if (teacherNotes && teacherNotes.trim()) {
            chunkUserContent += "\n\nOPTIONAL TEACHER NOTES / RUBRICS / EXAM STYLE GUIDE:\n\n" + teacherNotes;
          }
          if (mergedData && mergedData.zones && mergedData.zones.length > 0) {
            chunkUserContent += "\n\nIMPORTANT CONTEXT FROM PREVIOUS PASSES:\nAlready created zones: " +
              mergedData.zones.map(function(z) { return z.id + " (" + z.name + ")"; }).join(", ") +
              "\nContinue the course curriculum with NEW distinct zones, chapters, and questions for Part " + (p + 1) + ".";
          }
          chunkUserContent += "\n\n[SYNTHESIS SCOPE FOR PART " + (p + 1) + " OF " + chunks.length + "]:\n" +
            "- Focus in-depth on the topics, formulas, models, and self-test problems in THIS part.\n" +
            "- Generate 2 to 3 rich Chapters and 4 to 6 high-yield questions for this specific section.\n" +
            "- Ensure pure JSON syntax: all keys double-quoted, no trailing commas.";
          var chunkParsed = await this.callGeminiParsed(apiKey, this.MASTER_PROMPT, chunkUserContent, signal, onProgress);
          if (chunkParsed) {
            if (!mergedData) {
              mergedData = chunkParsed;
            } else {
              var existingZoneIds = (mergedData.zones || []).map(function(z) { return z.id; });
              (chunkParsed.zones || []).forEach(function(z) {
                if (!existingZoneIds.includes(z.id)) {
                  mergedData.zones.push(z);
                  existingZoneIds.push(z.id);
                }
              });
              var existingChIds = (mergedData.chapters || []).map(function(c) { return c.id; });
              (chunkParsed.chapters || []).forEach(function(c) {
                if (!existingChIds.includes(c.id)) {
                  mergedData.chapters.push(c);
                  existingChIds.push(c.id);
                }
              });
              mergedData.questions = (mergedData.questions || []).concat(chunkParsed.questions || []);
              if (chunkParsed.exams && chunkParsed.exams.length > 0 && (!mergedData.exams || mergedData.exams.length === 0)) {
                mergedData.exams = chunkParsed.exams;
              }
            }
          }
        }
        var courseData = mergedData || {};
      } else {
        onProgress("Creating tools & distractor traps...", 45);
        var courseData = await this.callGeminiParsed(apiKey, this.MASTER_PROMPT, userContent, signal, onProgress);
      }
    }

    onProgress("Checking questions and explanations...", 78);
    if (!courseData) {
      var courseData = this.cleanJsonResponse(rawResponse);
    }
    if (!courseData) courseData = {};
    if (!Array.isArray(courseData.questions)) courseData.questions = [];
    if (!Array.isArray(courseData.chapters)) courseData.chapters = [];
    if (!Array.isArray(courseData.zones)) courseData.zones = [];

    // Ensure zones exist if chapters exist
    if (courseData.zones.length === 0 && courseData.chapters.length > 0) {
      courseData.zones = [{
        id: courseData.chapters[0].zone || "core-zone",
        name: courseData.config && courseData.config.title ? courseData.config.title : "Core Curriculum",
        sess: "Core Sessions",
        blurb: "Key analytical frameworks and application principles."
      }];
    }

    // Filter out any incomplete question (e.g. truncated MCQ with < 4 options or missing fields)
    courseData.questions = courseData.questions.filter(function(q) {
      if (!q || !q.question) return false;
      if (q.type === 'mcq') {
        return Array.isArray(q.options) && q.options.length === 4;
      }
      return true;
    });

    // Ensure Short Answer / Essay questions exist
    var shortQuestions = courseData.questions.filter(function(q) { return q.type === 'short' || q.type === 'essay'; });
    if (shortQuestions.length < 2 && courseData.chapters.length > 0) {
      var chaptersForShort = courseData.chapters.slice(0, 3);
      chaptersForShort.forEach(function(ch, idx) {
        if (shortQuestions.length >= 2) return;
        var qTitle = ch.title || ch.topic || "Core Framework";
        var zId = ch.zone || ((courseData.zones[0] && courseData.zones[0].id) || "core-zone");
        courseData.questions.push({
          type: "short",
          zone: zId,
          topic: ch.topic || ch.title || "Applied Analysis",
          question: "A senior policymaker or executive is evaluating a strategic intervention based on " + qTitle + ". Using the frameworks, variable definitions, and boundary constraints taught in this module, analyze the primary mechanism involved, diagnose the critical trade-off, and state the conditions required to achieve the target outcome without triggering destabilizing secondary effects.",
          rubric: [
            {
              point: "Accurately identifies the primary mechanism or binding constraint taught in " + qTitle,
              keywords: "mechanism|constraint|equilibrium|elasticity|multiplier|expenditure|inflation|liquidity|policy|consumption|investment"
            },
            {
              point: "Applies the formal decision rule, formula, or analytical framework rather than casual intuition",
              keywords: "framework|formula|model|tradeoff|marginal|transmission|aggregate|interest|gdp|rate|wacc"
            },
            {
              point: "Evaluates second-order trade-offs or adverse consequences",
              keywords: "consequence|risk|secondary|unintended|deficit|inflationary|crowding|stability|leakage|distress"
            }
          ],
          modelAnswer: "A complete response must first articulate the operational mechanism of " + qTitle + ", explaining how the underlying variables interact. Next, it must analyze the primary trade-off: pursuing the direct objective creates secondary frictions (such as expenditure leakage, price pressures, or balance sheet constraints). The intervention succeeds only when executed within established boundary parameters where marginal benefits exceed systemic distortionary costs.",
          src: ch.src || "Course Material"
        });
        shortQuestions.push(true);
      });
    }

    // Safety auto-supplement: Guarantee at least 8 MCQs so students receive a comprehensive exam
    var mcqQuestions = courseData.questions.filter(function(q) { return q.type === 'mcq'; });
    if (mcqQuestions.length < 8) {
      var chapters = courseData.chapters.length > 0 ? courseData.chapters : [{
        topic: "Core Principles",
        zone: (courseData.zones[0] && courseData.zones[0].id) || "core-zone",
        title: "Foundation Chapter"
      }];
      var needed = Math.max(8 - mcqQuestions.length, 2);
      for (var k = 0; k < needed; k++) {
        var refCh = chapters[k % chapters.length];
        courseData.questions.push({
          type: "mcq",
          zone: refCh.zone || ((courseData.zones[0] && courseData.zones[0].id) || "core-zone"),
          topic: refCh.topic || refCh.title || "Core Application",
          question: "An organization or economy is attempting to apply the principles of " + (refCh.title || "this module") + " amidst rising uncertainty. Which strategic assessment reflects the most defensible application of the underlying models and boundary rules?",
          options: [
            ["Prioritize the primary structural constraint while maintaining buffer capacity to absorb systemic volatility.", "Correct. This directly balances operational resilience against resource constraints as established in the study guide."],
            ["Focus solely on immediate cost minimization by eliminating all secondary compliance and reserve buffers.", "Trap: Optimizes short-term metrics while creating severe vulnerability to catastrophic downside risk."],
            ["Adopt a generalized heuristic that ignores the specific operational bottleneck.", "Trap: Misapplies general methodology without addressing the binding constraint."],
            ["Maintain a rigid 50/50 allocation regardless of empirical variance and demand elasticity.", "Trap: Fails to adapt to the specific trade-offs identified in the scenario."]
          ],
          correctIndex: 0,
          deepExplanation: "Strategic frameworks require tailoring decisions to the binding constraint rather than arbitrary cost-cutting or misapplied heuristics.",
          trick: true,
          src: refCh.src || "Course Material"
        });
      }
    }


    courseData.questions.forEach(function(q) {
      if (q.type === 'mcq' && Array.isArray(q.options) && q.options.length === 4) {
        var origIdx = (typeof q.correctIndex === 'number') ? q.correctIndex : 0;
        var correctOpt = q.options[origIdx] || q.options[0];
        var targetIdx = Math.floor(Math.random() * 4);
        if (targetIdx !== origIdx) {
          var temp = q.options[targetIdx];
          q.options[targetIdx] = correctOpt;
          q.options[origIdx] = temp;
          q.correctIndex = targetIdx;
        }
      }
    });

    onProgress("Compiling offline Study Arena...", 92);
    var compiledHtml = window.StudyArenaCompiler.compile(courseData);

    onProgress("Ready to play.", 100);
    return {
      courseData: courseData,
      compiledHtml: compiledHtml
    };
  }
,


  reviewEssay: async function(essayText, rubricHint, onProgress) {
    this.abort();
    this.currentController = new AbortController();
    var signal = this.currentController.signal;

    var params = new URLSearchParams(window.location.search);
    var mockMode = params.get("mock");
    if (mockMode === "error") {
      onProgress("Scanning rhetorical structure...", 20);
      await new Promise(function(r) { setTimeout(r, 400); });
      throw new Error("Simulated API Error (?mock=error active).");
    }
    if (mockMode === "ok" || mockMode === "essay") {
      onProgress("Analyzing your thesis and core arguments...", 25);
      await new Promise(function(r) { setTimeout(r, 600); });
      onProgress("Checking sentence structure, grammar & tone...", 55);
      await new Promise(function(r) { setTimeout(r, 700); });
      onProgress("Finding counterarguments & calculating grade...", 85);
      await new Promise(function(r) { setTimeout(r, 600); });
      onProgress("Finalizing helpful feedback & suggestions...", 98);
      await new Promise(function(r) { setTimeout(r, 500); });
      return SAMPLE_MOCK_ESSAY_REVIEW;
    }

    var provider = localStorage.getItem("sa_ai_provider") || "gemini";
    var apiKey = localStorage.getItem("sa_api_key_" + provider);
    if (!apiKey && provider === "gemini") {
      apiKey = this.DEFAULT_GEMINI_KEY;
    }

    if (!apiKey) {
      apiKey = this.DEFAULT_GEMINI_KEY;
      provider = "gemini";
    }

    var userPrompt = "Please evaluate the following draft. Provide a direct, objective critique without greetings, pleasantries, or persona roleplay:\n\n";
    if (rubricHint && rubricHint.trim()) {
      userPrompt += "[STUDENT GOAL / RUBRIC / TOPIC NOTES]\n" + rubricHint.trim() + "\n\n";
    }
    userPrompt += "[ESSAY / PAPER CONTENT]\n" + essayText;

    onProgress("Analyzing your thesis and core arguments...", 25);
    var rawResponse = "";

    if (provider === "claude") {
      onProgress("Discovering active Claude models for key...", 25);
      var allModels = await this.fetchClaudeModels(apiKey);
      console.log("Anthropic /v1/models returned:", allModels);

      var candidateModels = [];

      // 1. Account-specific active models from /v1/models first
      if (allModels && allModels.length > 0) {
        allModels.filter(function(m) {
          var l = m.toLowerCase();
          return !l.includes("fable") && !l.includes("mythos");
        }).forEach(function(m) {
          if (!candidateModels.includes(m)) candidateModels.push(m);
        });
      }

      // 2. Known production model IDs across Anthropic tiers
      var KNOWN_MODELS = [
        "claude-3-7-sonnet-20250219",
        "claude-3-7-sonnet-latest",
        "claude-3-7-sonnet",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-20240620",
        "claude-3-5-sonnet-latest",
        "claude-3-5-haiku-20241022",
        "claude-3-5-haiku-latest",
        "claude-3-haiku-20240307",
        "claude-3-opus-20240229",
        "claude-3-opus-latest"
      ];

      KNOWN_MODELS.forEach(function(m) {
        if (!candidateModels.includes(m)) candidateModels.push(m);
      });

      var lastError = null;
      var success = false;

      for (var ci = 0; ci < candidateModels.length; ci++) {
        var modelToTry = candidateModels[ci];
        try {
          var res = await fetch("https://api.anthropic.com/v1/messages", {
            signal: signal,
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
              "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
              model: modelToTry,
              max_tokens: 4096,
              temperature: 0.1,
              system: this.PROFESSOR_ESSAY_PROMPT,
              messages: [{ role: "user", content: userPrompt }]
            })
          });

          if (!res.ok) {
            var errBody = await res.text();
            lastError = "Anthropic API (" + res.status + ") on " + modelToTry + ": " + errBody;
            if (res.status === 404 || res.status === 400) {
              continue; // try next candidate model
            } else if (res.status === 401) {
              throw new Error("Invalid Anthropic Claude API key (HTTP 401). Please check that your key starts with 'sk-ant-' and is entered correctly in Settings.");
            } else {
              throw new Error(lastError);
            }
          }

          var jsonRes = await res.json();
          var textBlocks = (jsonRes.content || []).filter(function(b) { return b.type === "text" || b.text; });
          rawResponse = textBlocks.map(function(b) { return b.text; }).join("\n");
          localStorage.setItem("sa_model_claude", modelToTry);
          success = true;
          break;

        } catch (fetchErr) {
          if (fetchErr.name === "TypeError" && fetchErr.message && fetchErr.message.includes("fetch")) {
            throw new Error("Claude connection failed (browser fetch blocked). If you have an ad-blocker or Brave Shields active, please allow connections to api.anthropic.com, or check your internet connection.");
          }
          throw fetchErr;
        }
      }

      if (!success && !rawResponse) {
        throw new Error("No active Claude model found for this key on Anthropic's API (last error: " + (lastError || "404") + "). Please verify in console.anthropic.com that your account has active model access and billing credits, or use the built-in free Gemini engine.");
      }

    } else if (provider === "openai") {
      onProgress("Benchmarking against academic literature with OpenAI...", 45);
      var modelName = localStorage.getItem("sa_model_openai") || "gpt-4o";
      var res = await fetch("https://api.openai.com/v1/chat/completions", {
        signal: signal,
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: this.PROFESSOR_ESSAY_PROMPT },
            { role: "user", content: userPrompt }
          ]
        })
      });
      if (!res.ok) {
        var err = await res.text();
        throw new Error("OpenAI API error (" + res.status + "): " + err);
      }
      var jsonRes = await res.json();
      rawResponse = jsonRes.choices[0].message.content;

    } else if (provider === "gemini") {
      onProgress("Checking sentence structure, grammar & tone...", 55);
      rawResponse = await this.callGeminiWithFallback(apiKey, this.PROFESSOR_ESSAY_PROMPT, userPrompt, signal, onProgress);
    }

    onProgress("Finding counterarguments & calculating grade...", 85);
    var reviewData = this.cleanJsonResponse(rawResponse);
    onProgress("Review complete.", 100);
    return reviewData;
  }

};
