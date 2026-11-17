/**
 * Study Arena Multi-Provider AI Generator
 * Supports Claude (Anthropic), ChatGPT (OpenAI), and Google Gemini via client-side BYOK.
 */

window.StudyArenaAPI = {
  MASTER_PROMPT: `You are an elite Business School Professor and Exam Architect at an AACSB-accredited institution (e.g., I\u00c9SEG, HEC, Harvard Business School).

Your mission is to transform raw student course material (slides, readings, lecture transcripts) into a high-rigor, gamified "Study Arena" course.

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

4. AACSB RUBRIC CRITERIA (SHORT ANSWER & ESSAYS):
   Open-ended questions must be graded against specific rubric points evaluating:
   - Root-cause framing (identifying underlying structural issues, not surface symptoms).
   - Evidence & framework application (citing course models over casual opinion).
   - Trade-off analysis (short- vs. long-term impacts, stakeholder risks).
   - Actionable management recommendations.

5. CONTENT INTEGRITY (ZERO HALLUCINATIONS):
   Every question and chapter must trace strictly to the provided student material. Mark references with slide/page citations.

---

### OUTPUT SCHEMA REQUIREMENT

You must output PURE, VALID JSON with no markdown wrapping and no code fences, matching this exact schema:

{
  "config": {
    "key": "course-slug-v1",
    "title": "Course Name Arena",
    "subtitle": "Course Name \u00b7 Exam Prep Simulator",
    "course": "Full course name and university context",
    "ranks": [
      [0, "Novice"],
      [150, "Apprentice Analyst"],
      [350, "Associate Consultant"],
      [650, "Senior Strategist"],
      [1000, "Managing Director"]
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
- Minimum 3-4 Zones.
- Minimum 2 Chapters per Zone (each chapter topic must link to at least 2-3 questions).
- Minimum 10-14 MCQs total (including at least 3 labeled with 'trick': true).
- Minimum 2-3 Short Answer questions with AACSB keyword rubrics.`,

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
    return JSON.parse(text.trim());
  },

  generate: async function(courseText, teacherNotes, onProgress) {
    var provider = localStorage.getItem("sa_ai_provider") || "claude";
    var apiKey = localStorage.getItem("sa_api_key_" + provider) || "";

    if (!apiKey) {
      throw new Error("Missing API Key for " + provider + ". Please configure it in AI Settings.");
    }

    onProgress("Deconstructing course concepts and extracting zones...", 20);

    var userContent = "COURSE LECTURE MATERIAL TO TRANSFORM:\n\n" + courseText;
    if (teacherNotes && teacherNotes.trim()) {
      userContent += "\n\nOPTIONAL TEACHER NOTES / RUBRICS / EXAM STYLE GUIDE:\n\n" + teacherNotes;
    }

    var rawResponse = "";

    if (provider === "claude") {
      onProgress("Calling Claude (Sonnet 3.5) with AACSB Professor Blueprint...", 40);
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8192,
          system: this.MASTER_PROMPT,
          messages: [
            { role: "user", content: userContent }
          ]
        })
      });

      if (!res.ok) {
        var errBody = await res.text();
        throw new Error("Claude API error (" + res.status + "): " + errBody);
      }
      var jsonRes = await res.json();
      rawResponse = jsonRes.content[0].text;

    } else if (provider === "openai") {
      onProgress("Calling OpenAI (GPT-4o) with AACSB Professor Blueprint...", 40);
      var res = await fetch("https://api.openai.com/v1/chat/completions", {
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
      onProgress("Calling Gemini with AACSB Professor Blueprint...", 40);
      var modelName = "gemini-1.5-flash";
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
      var res = await fetch(url, {
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

    onProgress("Parsing and validating exam schema against Content Spec...", 75);
    var courseData = this.cleanJsonResponse(rawResponse);

    onProgress("Compiling single-file Study Arena game...", 90);
    var compiledHtml = window.StudyArenaCompiler.compile(courseData);

    onProgress("Done! Ready to play.", 100);
    return {
      courseData: courseData,
      compiledHtml: compiledHtml
    };
  }
};
