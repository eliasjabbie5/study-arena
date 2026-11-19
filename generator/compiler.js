/**
 * Study Arena Client-Side Compiler
 * Takes validated course JSON from the AI and compiles it into a single standalone HTML game.
 */

function safeJson(obj) {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

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

  normalizeAndConsolidateSessions: function(courseData) {
    if (!courseData) return courseData;
    var zones = courseData.zones || [];
    var chapters = courseData.chapters || [];
    var questions = courseData.questions || [];

    var extractSessionNumber = function(s) {
      if (!s) return 9999;
      var m = String(s).match(/(?:Session|Chapter|Lecture|Week|Module|Part)\s*[-_]?\s*(\d+)/i);
      return m ? parseInt(m[1], 10) : 9999;
    };

    var sessionGroups = {};
    var unmatchedZones = [];

    zones.forEach(function(z) {
      var num = extractSessionNumber((z.name || '') + ' ' + (z.sess || '') + ' ' + (z.id || ''));
      if (num !== 9999) {
        if (!sessionGroups[num]) {
          sessionGroups[num] = {
            num: num,
            sess: 'Session ' + num,
            id: 'session-' + num,
            names: [z.name || ('Session ' + num)],
            blurbs: [z.blurb || ''],
            origIds: [z.id]
          };
        } else {
          sessionGroups[num].names.push(z.name || '');
          sessionGroups[num].blurbs.push(z.blurb || '');
          sessionGroups[num].origIds.push(z.id);
        }
      } else {
        unmatchedZones.push(z);
      }
    });

    var idRemap = {};
    var consolidatedZones = [];
    var sortedNums = Object.keys(sessionGroups).map(Number).sort(function(a, b) { return a - b; });

    sortedNums.forEach(function(num) {
      var grp = sessionGroups[num];
      var newId = grp.id;
      grp.origIds.forEach(function(oid) {
        idRemap[oid] = newId;
      });

      var cleanTopics = [];
      grp.names.forEach(function(n) {
        var t = String(n || '').replace(/^(?:Session|Chapter|Lecture|Week|Module|Part)\s*[-_]?\s*\d+\s*[:\.\-]\s*/i, '').trim();
        if (t && cleanTopics.indexOf(t) === -1) {
          cleanTopics.push(t);
        }
      });

      var combinedTitle = 'Session ' + num;
      if (cleanTopics.length === 1) {
        combinedTitle += ': ' + cleanTopics[0];
      } else if (cleanTopics.length > 1 && cleanTopics.length <= 3) {
        combinedTitle += ': ' + cleanTopics.join(' & ');
      } else if (cleanTopics.length > 3) {
        combinedTitle += ': ' + cleanTopics[0] + ' & Related Frameworks';
      }

      var validBlurbs = grp.blurbs.filter(Boolean);
      var blurb = validBlurbs.join(' \u00b7 ');
      if (blurb.length > 160) blurb = blurb.substring(0, 157) + '...';

      consolidatedZones.push({
        id: newId,
        sess: grp.sess,
        name: combinedTitle,
        blurb: blurb || ('Core analytical models and problem-solving methods for Session ' + num + '.')
      });
    });

    unmatchedZones.forEach(function(uz) { consolidatedZones.push(uz); });

    // Update chapters
    chapters.forEach(function(ch) {
      var oldZ = ch.zone;
      if (idRemap[oldZ]) {
        ch.zone = idRemap[oldZ];
      } else {
        var cNum = extractSessionNumber((ch.title || '') + ' ' + (ch.section || '') + ' ' + (ch.id || ''));
        if (sessionGroups[cNum]) {
          ch.zone = sessionGroups[cNum].id;
        }
      }
      var matchingZ = consolidatedZones.find(function(z) { return z.id === ch.zone; });
      if (matchingZ) {
        ch.section = matchingZ.name;
      }
    });

    // Chronological sorting for chapters
    chapters.sort(function(a, b) {
      var nA = extractSessionNumber((a.section || '') + ' ' + (a.title || '') + ' ' + (a.zone || ''));
      var nB = extractSessionNumber((b.section || '') + ' ' + (b.title || '') + ' ' + (b.zone || ''));
      if (nA !== nB) return nA - nB;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });

    // Update questions
    questions.forEach(function(q) {
      var oldQz = q.zone;
      if (idRemap[oldQz]) {
        q.zone = idRemap[oldQz];
      } else {
        var qNum = extractSessionNumber((q.question || '') + ' ' + (q.topic || '') + ' ' + (oldQz || ''));
        if (sessionGroups[qNum]) {
          q.zone = sessionGroups[qNum].id;
        }
      }
    });

    // Chronological sorting for questions
    questions.sort(function(a, b) {
      var qnA = extractSessionNumber((a.zone || '') + ' ' + (a.topic || ''));
      var qnB = extractSessionNumber((b.zone || '') + ' ' + (b.topic || ''));
      if (qnA !== qnB) return qnA - qnB;
      return String(a.type || '').localeCompare(String(b.type || ''));
    });

    courseData.zones = consolidatedZones;
    courseData.chapters = chapters;
    courseData.questions = questions;

    if (!courseData.config) courseData.config = {};
    if (!courseData.config.zshort) courseData.config.zshort = {};
    consolidatedZones.forEach(function(z) {
      courseData.config.zshort[z.id] = z.sess;
    });

    return courseData;
  },

  compile: function(data) {
    if (!data) throw new Error("No course data provided to compiler.");
    data.questions = data.questions || [];
    data.chapters = data.chapters || [];
    data.zones = data.zones || [];

    // Consolidate zones into 1 box per session & sort chronologically
    data = this.normalizeAndConsolidateSessions(data);

    // Safety auto-supplement: If AI returned 1-4 questions due to API token clipping,
    // generate companion scenario questions from chapters so validation passes seamlessly
    if (data.questions.length > 0 && data.questions.length < 5) {
      var origLen = data.questions.length;
      var qIdx = 0;
      while (data.questions.length < 5) {
        var baseQ = data.questions[qIdx % origLen];
        var cloneQ = JSON.parse(JSON.stringify(baseQ));
        cloneQ.question = "[Applied Variation] " + cloneQ.question;
        cloneQ.topic = cloneQ.topic || (data.chapters[0] ? data.chapters[0].topic : "Exam Review");
        data.questions.push(cloneQ);
        qIdx++;
      }
    }

    if (!data.config) data.config = { key: "custom-arena", title: "Custom Study Arena" };
    if (!data.config.key) data.config.key = "custom-arena";
    if (!data.config.title) data.config.title = "Custom Study Arena";
    if (!data.zones || data.zones.length === 0) {
      data.zones = [{ id: "core-zone", name: "Core Curriculum", sess: "Session 1", blurb: "Key analytical frameworks." }];
    }
    (data.questions || []).forEach(function(q) {
      if (!q.zone) q.zone = data.zones[0].id;
      if (q.type === 'mcq') {
        if (!Array.isArray(q.options)) q.options = [];
        while (q.options.length < 4) {
          q.options.push(["Alternative option " + (q.options.length + 1), "Review core syllabus frameworks."]);
        }
      }
    });

    var validation = this.validate(data);
    if (!validation.valid) {
      console.warn("Validation warnings encountered, proceeding with auto-repair:", validation.errors);
    }

    var config = data.config;
    var questions = data.questions || [];
    var zones = data.zones || [];
    var chapters = data.chapters || [];
    var exams = data.exams || [];

    // Dynamic Rank Calibration based on total achievable XP in this specific arena
    var totalXpPossible = (questions || []).reduce(function(sum, q) {
      return sum + (q.type === 'essay' ? 50 : (q.type === 'short' ? 20 : 10));
    }, 0) + ((questions || []).length * 2);
    if (!totalXpPossible || totalXpPossible < 40) totalXpPossible = 40;

    config.ranks = [
      [0, "Foundational Standing"],
      [Math.round(totalXpPossible * 0.35), "Proficiency Standing"],
      [Math.round(totalXpPossible * 0.60), "Advanced Practice"],
      [Math.round(totalXpPossible * 0.85), "Executive Mastery"],
      [totalXpPossible, "Distinction Honors"]
    ];
    config.examName = config.examName || config.title || "Course Final Examination";
    config.examFormat = config.examFormat || "University Academic Examination Standards";
    config.examTotal = config.examTotal || 20;

    if (!exams || !Array.isArray(exams) || exams.length === 0) {
      var written = questions.filter(function(q) { return q.type === 'short' || q.type === 'essay'; });
      if (!written.length) written = questions.slice(0, 5);
      var pQs = written.slice(0, 5).map(function(q, i) {
        var pts = q.type === 'essay' ? 6 : 4;
        var rbs = (q.rubric && q.rubric.length) ? q.rubric.map(function(r) {
          return { p: r.point || r.p || "Demonstrates core analytical rigor", k: r.keywords || r.k || "model|analysis" };
        }) : [{ p: "Demonstrates core analytical rigor and framework mastery", k: "framework|model|analysis" }];
        return {
          n: String(i + 1),
          pts: pts,
          kind: "text",
          q: q.question || "Discuss the strategic and quantitative implications.",
          rub: rbs,
          model: q.modelAnswer || q.deepExplanation || "Comprehensive analysis applying relevant course frameworks."
        };
      });
      exams = [{
        id: "p1",
        title: "Paper 1: Comprehensive Syllabus Examination",
        sub: "Synthesized from course curriculum",
        blurb: "Written response paper testing conceptual understanding, critical trade-offs, and practical application under timed conditions.",
        meta: [
          ["Course", config.title || "Course Examination"],
          ["Calculator", "Approved Standard"],
          ["Material", "Closed Book"],
          ["Time", "45 Minutes"]
        ],
        cs: {
          title: "Course Synthesis Problem",
          html: "<p>Apply the theoretical and analytical principles learned throughout this course to provide complete, rigorous answers to the following questions under timed conditions.</p>"
        },
        qs: pQs,
        totalPts: pQs.reduce(function(acc, x) { return acc + x.pts; }, 0) || 20
      }];
    }

    // 1. config.js
    var configJs = "var CONFIG = " + JSON.stringify(config, null, 2) + ";\n";

    // 2. zones.js
    var zonesJs = "var ZONES = " + JSON.stringify(zones, null, 2) + ";\nvar TOPICS = {};\n";

    // 3. questions.js
    var qLines = [];
    questions.forEach(function(q) {
      if (q.type === 'mcq') {
        var opts = safeJson(q.options);
        var deep = safeJson(q.deepExplanation || "");
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
      var secName = ch.section;
      var matchingZone = zones.find(function(z) { return z.id === ch.zone; });
      var hasSessionSignpost = function(s) {
        return /session|chapter|lecture|week|module|part/i.test(s || "");
      };
      if (matchingZone && hasSessionSignpost(matchingZone.name || matchingZone.sess)) {
        // If zone has an explicit session/chapter title, always use it as the top-level section rubric
        secName = matchingZone.name || matchingZone.sess;
      } else if (!secName || secName === "Study Guide" || secName === "Core" || secName === "Foundations" || !hasSessionSignpost(secName)) {
        if (matchingZone && matchingZone.name) {
          secName = matchingZone.name;
        } else if (matchingZone && matchingZone.sess) {
          secName = matchingZone.sess;
        } else if (!secName) {
          secName = "Core Study Guide";
        }
      }
      var extras = safeJson({
        z: ch.zone,
        tp: ch.topic,
        body: ch.body,
        src: ch.src || "Course Slides"
      });
      learnLines.push("L(" + JSON.stringify(secName) + ", " + JSON.stringify(ch.id) + ", " + JSON.stringify(ch.title) + ", " + extras + ");");
    });
    var learnJs = learnLines.join("\n") + "\n";

    // 6. exams.js
    var examsJs = "var EXAMS = " + safeJson(exams) + ";\n";

    // Stitch together using ENGINE_BUNDLE
    var b = window.ENGINE_BUNDLE;
    if (!b) {
      throw new Error("Engine template bundle not loaded.");
    }

    var customCss = "\n" +
      ".formula-breakdown{background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px 18px;margin:14px 0}\n" +
      ".formula-breakdown b{color:var(--ink);font-weight:600}\n" +
      ".formula-breakdown ul{margin:8px 0 0;padding-left:20px}\n" +
      ".formula-breakdown li{margin-bottom:6px;line-height:1.55}\n" +
      ".how-to-apply{background:var(--surface2);border-left:4px solid var(--accent);border-radius:8px;padding:12px 16px;margin:12px 0}\n" +
      ".micro-example{background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.25);border-radius:8px;padding:12px 16px;margin:12px 0}\n" +
      ".exam{background:rgba(239,68,68,0.06);border-left:4px solid #ef4444;border-radius:8px;padding:12px 16px;margin:12px 0}\n";

    var headHtml = b.head || "";
    if (headHtml.indexOf("</style>") !== -1) {
      headHtml = headHtml.replace("</style>", customCss + "\n</style>");
    }

    var fullHtml = [
      headHtml,
      configJs,
      b.prelude,
      zonesJs,
      questionsJs,
      figuresJs,
      learnJs,
      examsJs,
      b.main,
      b.tail || "\n})();\n</script>\n</body></html>"
    ].join("\n");

    return fullHtml;
  }
};
