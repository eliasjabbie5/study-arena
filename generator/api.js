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
    "executive_summary": "Great work on this draft! You tackle a timely, important question and your main points are well organized. You show a solid understanding of both the tech side and the market dynamics. With a few wording tweaks and by answering opposing viewpoints, this paper will be ready for top marks.",
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
        "how_it_strengthens_paper": "Addressing this shows your professor that you understand the common counterargument and can explain why big cloud platforms still maintain market power."
      },
      {
        "opposing_viewpoint": "Rapid innovation might naturally break tech monopolies as smaller startups invent faster, cheaper algorithms.",
        "where_to_integrate": "Near the end of paragraph 4, right before your conclusion.",
        "how_it_strengthens_paper": "Discussing fast-paced innovation proves you have thought through both sides of the issue before recommending government regulation."
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
  DEFAULT_GEMINI_KEY: "AQ.Ab8RN6JCOQNgo0Rf8CphejiVWEhrLJDY0FTdph9IUCdhzyPboQ",
  DEFAULT_GEMINI_MODEL: "gemini-3.5-flash-lite",
  MASTER_PROMPT: `You are an exacting university course instructor and exam architect preparing practice exam materials for business and economics students.

Your mission is to transform raw student course material (slides, readings, lecture transcripts) into a high-rigor, interactive study arena.

---

### CORE PEDAGOGICAL RULES (THE PROFESSOR'S BLUEPRINT)

1. NO TRIVIA OR RECALL QUESTIONS:
   Never ask basic definition questions (e.g., "What does WACC stand for?"). Every question must be a 2\u20133 sentence micro-case scenario featuring:
   - A realistic company/manager context.
   - An operational constraint (tight cash flow, regulatory pressure, union opposition).
   - A strategic dilemma requiring the application of course frameworks.

2. MULTI-LOGICAL DISTRACTORS (REALISTIC TRAPS):
   Incorrect options must never be obviously wrong. Construct distractors using:
   - The Half-Truth: Diagnoses the problem correctly, but proposes the wrong strategic remedy.
   - The Misapplied Framework: Employs a valid course framework, but one unsuitable for this specific scenario.
   - The Trade-Off Trap: Focuses on short-term optimization at the expense of severe long-term risk.

3. EXPLANATIONS FOR EVERY WRONG CHOICE:
   Every distractor must include a 1\u20132 sentence explanation explaining *why* it fails and *which conceptual error* led to that choice.

4. EXAM RUBRIC CRITERIA (SHORT ANSWER & ESSAYS):
   Open-ended questions must be graded against specific rubric points evaluating:
   - Root-cause framing (identifying underlying structural issues, not surface symptoms).
   - Evidence & framework application (citing course models over casual opinion).
   - Trade-off analysis (short- vs. long-term impacts, stakeholder risks).
   - Actionable management recommendations.

5. CONTENT INTEGRITY (ZERO HALLUCINATIONS):
   Every question and chapter must trace strictly to the provided student material. Mark references with slide/page citations.

6. STRICT ANTI-SLOP STYLE & TONE DIRECTIVES:
   - Zero AI Cliche Vocabulary: Never use flowery, meta, or cliched AI words such as "delve", "testament", "tapestry", "beacon", "multifaceted", "pivotal", "plethora", "crucial role", "in conclusion", "it is important to remember", "realm", "furthermore".
   - Terse, Concrete Instructor Tone: Write like an exacting exam writer who values precision and respect for the student's revision time. Use real operational details, balance sheet constraints, customer dynamics, and regulatory limits.
   - Genuine Plausibility: Every distractor option in multiple-choice questions must sound like a defensible real-world management option that an inexperienced manager or student might mistakenly choose.

---


### CRITICAL SYNTAX RULES
1. Output pure, standard JSON.
2. Inside HTML strings, always use single quotes for attributes (e.g. <div class='exam'>), never unescaped double quotes.
3. Escape all quotes inside text strings properly.

### OUTPUT SCHEMA REQUIREMENT

You must output PURE, VALID JSON with no markdown wrapping and no code fences, matching this exact schema:

{
  "config": {
    "key": "course-slug-v1",
    "title": "Course Name Arena",
    "subtitle": "Course Name \u00b7 Exam Prep Simulator",
    "course": "Full course name and university context",
    "ranks": [
      [0, "Foundational Standing"],
      [150, "Proficiency Standing"],
      [350, "Advanced Practice"],
      [650, "Executive Mastery"],
      [1000, "Distinction Honors"]
    ],
    "zshort": {
      "zone_id": "Short Zone Name"
    }
  },
  "zones": [
    {
      "id": "zone_id",
      "name": "Full Zone Name",
      "sess": "Sessions 1-3",
      "blurb": "1-2 sentences summarizing core concepts."
    }
  ],
  "chapters": [
    {
      "id": "chapter-slug",
      "title": "Chapter Title",
      "zone": "zone_id",
      "topic": "Exact Topic Name",
      "body": "<p>Concise 200-300 word breakdown...</p><ul><li><b>Key Concept</b>: Definition.</li></ul><div class=\\"exam\\"><b>Exam Angle:</b> How the professor tests this topic and common student traps.</div>",
      "src": "Slides 2, pp. 10-14"
    }
  ],
  "questions": [
    {
      "type": "mcq",
      "zone": "zone_id",
      "topic": "Exact Topic Name",
      "question": "2-3 sentence micro-case scenario...",
      "options": [
        ["Correct choice: Best strategic action.", "Explanation: Why this is the optimal trade-off."],
        ["Distractor 1: Half-truth action.", "Explanation: Correct diagnosis, but fails the liquidity constraint."],
        ["Distractor 2: Misapplied framework.", "Explanation: Confuses PESTEL with Porter's Five Forces."],
        ["Distractor 3: Short-term trap.", "Explanation: Ignores long-term regulatory penalties."]
      ],
      "correctIndex": 0,
      "deepExplanation": "In-depth professor debrief explaining the core tension...",
      "trick": true,
      "src": "Slides 2, p. 12"
    },
    {
      "type": "short",
      "zone": "zone_id",
      "topic": "Exact Topic Name",
      "question": "Scenario prompt asking to analyze a managerial dilemma...",
      "rubric": [
        {
          "point": "Correctly diagnoses the primary operational bottleneck",
          "keywords": "bottleneck|capacity|utilization|throughput"
        },
        {
          "point": "Applies the appropriate framework to evaluate constraints",
          "keywords": "framework|theory of constraints|lean|six sigma"
        },
        {
          "point": "Proposes a viable mitigation strategy addressing cost trade-offs",
          "keywords": "mitigation|tradeoff|cost|investment|budget"
        }
      ],
      "modelAnswer": "Comprehensive 3-5 sentence model response achieving full marks...",
      "src": "Slides 3, p. 5"
    }
  ]
}

---

### QUANTITY TARGETS PER GENERATION
- Exactly 2-3 Zones.
- Exactly 1 Chapter per Zone (concise 100-150 words per chapter).
- Exactly 6-8 MCQs total (including 2 labeled with 'trick': true).
- Exactly 2 Short Answer questions with keyword grading rubrics.
CRITICAL: Keep all body text concise and compact so the full output completes well within token limits and closes all JSON schema brackets cleanly.`,


  PROFESSOR_ESSAY_PROMPT: `You are a supportive, high-standards University Writing Professor and Faculty Academic Advisor. Your mission is to help students (including high school seniors, first-year college students, and undergraduates) improve their essays and research papers.

You evaluate drafts with the intellectual depth and high standards of an exacting academic professor, but you explain all feedback, advice, diagnoses, and rewrite suggestions in clear, encouraging, and easy-to-understand language.

Avoid dense, intimidating academic jargon when explaining things to the student. If you introduce a scholarly concept (such as a counterargument, a logical warrant, or passive voice), explain what it means simply so the student can immediately learn from it and apply it.

You do not write the essay for the student. Instead, you guide them on how to strengthen their thesis, spot grammar and style issues, bring in counterarguments, and elevate their writing to earn top marks.

---

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
    "executive_summary": "string (Overall evaluation in a constructive, professorial voice)",
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

  cleanJsonResponse: function(raw) {
    var text = raw.trim();
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

    // Step 1: Sanitize literal unescaped newlines/tabs inside string values
    text = this.sanitizeJsonControlChars(text);

    // Step 2: Try direct parse
    try {
      return JSON.parse(text);
    } catch (initialErr) {
      console.warn("Direct JSON.parse failed, attempting auto-repair:", initialErr.message);
    }

    // Step 3: Auto-repair for truncated JSON: walk backwards to find a valid cut point and close open braces
    var maxLookback = Math.min(text.length, 6000);
    for (var i = text.length; i >= text.length - maxLookback; i--) {
      var candidate = text.substring(0, i).trimEnd();
      if (candidate.endsWith(",") || candidate.endsWith(":")) {
        candidate = candidate.slice(0, -1).trimEnd();
      }

      var openBraces = 0;
      var openBrackets = 0;
      var inString = false;
      var escape = false;

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
          if (ch === '{') openBraces++;
          else if (ch === '}') openBraces--;
          else if (ch === '[') openBrackets++;
          else if (ch === ']') openBrackets--;
        }
      }

      if (!inString && openBraces >= 0 && openBrackets >= 0) {
        var repaired = candidate;
        for (var b = 0; b < openBrackets; b++) repaired += "]";
        for (var r = 0; r < openBraces; r++) repaired += "}";
        try {
          var parsed = JSON.parse(repaired);
          console.log("JSON auto-repaired successfully! Rescued by trimming " + (text.length - i) + " chars.");
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
          { id: "ch-wacc", title: "Weighted Average Cost of Capital", zone: "wacc", topic: "WACC Formula", body: "<p>WACC blends the cost of equity and after-tax cost of debt weighted by market values.</p><div class='exam'><b>Exam Trap:</b> Always tax-effect the cost of debt using (1 - Tc), never the cost of equity.</div>", src: "Slides 1-8" },
          { id: "ch-mm", title: "Modigliani-Miller & Pecking Order", zone: "mm", topic: "Capital Structure", body: "<p>With corporate taxes, debt creates a tax shield (Tc * D), balanced against distress costs.</p>", src: "Slides 9-16" }
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
            rawResponse = claudeJson.content[0].text;
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
      onProgress("Creating tools & distractor traps...", 45);
      var modelName = this.DEFAULT_GEMINI_MODEL;
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
      var res = await fetch(url, {
        signal: signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: this.MASTER_PROMPT }] },
          contents: [{ parts: [{ text: userContent }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (!res.ok) {
        var errBody = await res.text();
        if (res.status === 400 && errBody.includes("API key not valid")) {
          throw new Error("Google Gemini API key is invalid (HTTP 400). Please click Settings (gear icon) and paste a valid key from Google AI Studio (aistudio.google.com/app/apikey).");
        }
        throw new Error("Gemini API error (" + res.status + "): " + errBody);
      }
      var jsonRes = await res.json();
      rawResponse = jsonRes.candidates[0].content.parts[0].text;
    }

    onProgress("Checking questions and explanations...", 78);
    var courseData = this.cleanJsonResponse(rawResponse);

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

    var userPrompt = "Please evaluate the following draft according to your academic professor review guidelines.\n\n";
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
          rawResponse = jsonRes.content[0].text;
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
      var modelName = this.DEFAULT_GEMINI_MODEL;
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
      var res = await fetch(url, {
        signal: signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: this.PROFESSOR_ESSAY_PROMPT }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      if (!res.ok) {
        var errBody = await res.text();
        if (res.status === 400 && errBody.includes("API key not valid")) {
          throw new Error("Google Gemini API key is invalid (HTTP 400). Please click Settings (gear icon) and paste a valid key from Google AI Studio (aistudio.google.com/app/apikey).");
        }
        throw new Error("Gemini API error (" + res.status + "): " + errBody);
      }
      var jsonRes = await res.json();
      rawResponse = jsonRes.candidates[0].content.parts[0].text;
    }

    onProgress("Finding counterarguments & calculating grade...", 85);
    var reviewData = this.cleanJsonResponse(rawResponse);
    onProgress("Review complete.", 100);
    return reviewData;
  }

};
