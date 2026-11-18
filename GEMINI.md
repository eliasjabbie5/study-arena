# Permanent Project Directives: Study Arena

## Mandatory Rule: TRIPLE-CHECK FOR BUGS AFTER EVERY BUILD
Whenever any code is changed, built, or deployed:
1. Automated Syntax & Asset Check:
   - Verify all JavaScript, CSS, and HTML files pass syntax checks.
   - Ensure zero unescaped strings or illegal control characters in JS bundles.
   - Verify all asset query parameters (?v=...) match across index.html.

2. Live Browser QA Verification:
   - Check the running site for console errors (must be 0 uncaught errors).
   - Ensure all key engine objects (window.ENGINE_BUNDLE, window.StudyArenaCompiler, window.StudyArenaAPI, window.StudyArenaAuth) exist and initialize cleanly.

3. End-to-End Workflow Verification:
   - Verify the Learn section groups chapters into session/chapter rubrics.
   - Verify question generation guarantees (MCQs and open-ended rubrics).
   - Verify cloud sync and arena persistence.

NEVER announce a build as ready or done without running and passing these three checks.
