/**
 * Study Arena Multi-Provider AI Generator
 * Supports Claude (Anthropic), ChatGPT (OpenAI), and Google Gemini via client-side BYOK.
 */

window.StudyArenaAPI = {
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
      onProgress("Reading syllabus & lecture notes...", 15);
      await new Promise(function(r) { setTimeout(r, 250); });
      onProgress("Creating tools & distractor traps...", 45);
      await new Promise(function(r) { setTimeout(r, 350); });
      onProgress("Compiling offline Study Arena...", 92);
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

    var provider = localStorage.getItem("sa_ai_provider") || "claude";
    var apiKey = localStorage.getItem("sa_api_key_" + provider) || "";

    if (!apiKey) {
      throw new Error("Missing API Key for " + provider + ". Please click \'AI Settings (BYOK)\' to set your key.");
    }

    onProgress("Reading syllabus & lecture notes...", 15);

    var userContent = "COURSE LECTURE MATERIAL TO TRANSFORM:\n\n" + courseText;
    if (teacherNotes && teacherNotes.trim()) {
      userContent += "\n\nOPTIONAL TEACHER NOTES / RUBRICS / EXAM STYLE GUIDE:\n\n" + teacherNotes;
    }

    var rawResponse = "";

    if (provider === "claude") {
      onProgress("Checking API connection...", 25);
      var allModels = await this.fetchClaudeModels(apiKey);
      console.log("Anthropic /v1/models returned:", allModels);

      // Clear any previously-saved model (Fable, research tier IDs, etc.)
      localStorage.removeItem("sa_model_claude");

      // Proven Anthropic aliases - try these FIRST before anything from /v1/models.
      // The /v1/models endpoint may list internal research IDs like claude-haiku-5-5
      // that do NOT work via /v1/messages on the standard API tier.
      var SAFE_ALIASES = [
        "claude-sonnet-4-6",
        "claude-haiku-4-5-20251001",
        "claude-haiku-5-5",
        "claude-sonnet-5-5",
        "claude-sonnet-5",
        "claude-3-5-haiku-latest",
        "claude-3-5-sonnet-latest"
      ];

      var candidateModels = [];

      // 1. Standard aliases first
      SAFE_ALIASES.forEach(function(m) {
        if (!candidateModels.includes(m)) candidateModels.push(m);
      });

      // 2. Any safe models from /v1/models not already in the list
      if (allModels.length > 0) {
        allModels.filter(function(m) {
          var l = m.toLowerCase();
          return !l.includes("fable") && !l.includes("opus") && !l.includes("mythos");
        }).forEach(function(m) {
          if (!candidateModels.includes(m)) candidateModels.push(m);
        });
      }

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
      var modelName = "gemini-1.5-flash";
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
};
