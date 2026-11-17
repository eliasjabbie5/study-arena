"""Build one course into a single-file HTML game.
Usage: python3 -I build.py <course-folder-name> [output.html]
Order matters: config -> engine prelude -> content -> engine main. Nothing is minified or rewritten."""
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent
course = sys.argv[1]
out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else root/"dist"/f"{course}.html"
c = root/"courses"/course
parts = [root/"engine/head.html", c/"config.js", root/"engine/prelude.js",
         c/"zones.js", c/"questions.js", c/"figures.js", c/"learn.js", c/"exams.js",
         root/"engine/main.js", root/"engine/tail.html"]
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("".join(p.read_text(encoding="utf-8") for p in parts), encoding="utf-8")
print(f"built {out} ({out.stat().st_size} bytes)")
