/**
 * Study Arena Client-Side Compiler
 * Takes validated course JSON from the AI and compiles it into a single standalone HTML game.
 */

window.StudyArenaCompiler = {
  validate: function(data) {
    var errors = [];
    if (!data.config || !data.config.key || !data.config.title) {
      errors.push("Missing required config fields (key, title).");
    }
    if (!data.zones || !Array.isArray(data.zones) || data.zones.length === 0) {
      errors.push("Course must have at least one zone.");
    }
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length < 5) {
      errors.push("Course must have at least 5 questions.");
    }

    // Validate questions
    (data.questions || []).forEach(function(q, i) {
      if (!q.zone) errors.push("Question " + (i+1) + " is missing a zone id.");
      if (q.type === 'mcq') {
        if (!q.options || q.options.length !== 4) {
          errors.push("MCQ Question " + (i+1) + " must have exactly 4 options.");
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  compile: function(data) {
    var validation = this.validate(data);
    if (!validation.valid) {
      throw new Error("Validation failed:\n" + validation.errors.join("\n"));
    }

    var config = data.config;
    var zones = data.zones;
    var chapters = data.chapters || [];
    var questions = data.questions || [];
    var exams = data.exams || [];

    // 1. config.js
    var configJs = "var CONFIG = " + JSON.stringify(config, null, 2) + ";\n";

    // 2. zones.js
    var zonesJs = "var ZONES = " + JSON.stringify(zones, null, 2) + ";\nvar TOPICS = {};\n";

    // 3. questions.js
    var qLines = [];
    questions.forEach(function(q) {
      if (q.type === 'mcq') {
        var opts = JSON.stringify(q.options);
        var deep = JSON.stringify(q.deepExplanation || "");
        var extras = JSON.stringify({
          topic: q.topic || "Core Frameworks",
          trick: !!q.trick,
          src: q.src || "Course Notes"
        });
        qLines.push("M(" + JSON.stringify(q.zone) + ", " + JSON.stringify(q.question) + ", " + opts + ", " + (q.correctIndex || 0) + ", " + deep + ", " + extras + ");");
      } else if (q.type === 'short' || q.type === 'essay') {
        var rubrics = (q.rubric || []).map(function(r) {
          return "R(" + JSON.stringify(r.point) + ", " + JSON.stringify(r.keywords || "") + ")";
        }).join(", ");
        var extras = JSON.stringify({
          topic: q.topic || "Case Applications",
          src: q.src || "Course Notes"
        });
        qLines.push("T(" + JSON.stringify(q.zone) + ", " + JSON.stringify(q.type) + ", " + JSON.stringify(q.question) + ", [" + rubrics + "], " + JSON.stringify(q.modelAnswer || "") + ", " + extras + ");");
      }
    });
    var questionsJs = qLines.join("\n") + "\n";

    // 4. figures.js
    var figuresJs = "var FIGS = {};\n";

    // 5. learn.js
    var learnLines = [];
    chapters.forEach(function(ch) {
      var extras = JSON.stringify({
        z: ch.zone,
        tp: ch.topic,
        body: ch.body,
        src: ch.src || "Course Slides"
      });
      learnLines.push("L(" + JSON.stringify(ch.section || "Study Guide") + ", " + JSON.stringify(ch.id) + ", " + JSON.stringify(ch.title) + ", " + extras + ");");
    });
    var learnJs = learnLines.join("\n") + "\n";

    // 6. exams.js
    var examsJs = "var EXAMS = " + JSON.stringify(exams) + ";\n";

    // Stitch together using ENGINE_BUNDLE
    var b = window.ENGINE_BUNDLE;
    if (!b) {
      throw new Error("Engine template bundle not loaded.");
    }

    var fullHtml = [
      b.head,
      configJs,
      b.prelude,
      zonesJs,
      questionsJs,
      figuresJs,
      learnJs,
      examsJs,
      b.main,
      b.tail
    ].join("\n");

    return fullHtml;
  }
};
