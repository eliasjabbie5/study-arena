"""One-off migration: split the original Ethics Arena.html into engine + course content.
Line ranges are 1-indexed, inclusive, taken from the original file (1900 lines).
Run: python3 -I split_ethics.py "<path to Ethics Arena.html>" <study-arena dir>
"""
import sys, pathlib
src, root = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
L = src.read_text(encoding="utf-8").split("\n")
def s(a, b): return "\n".join(L[a-1:b]) + "\n"

def sub(text, old, new, count=1):
    assert text.count(old) == count, (old[:60], text.count(old))
    return text.replace(old, new)

# ---- engine ----
head = s(1, 221)                                   # html, css, <div id=app>, <script>, IIFE open, "use strict"
head = sub(head, "<title>Ethics Arena</title>", "<title>Study Arena</title>")

prelude = ('var KEY=CONFIG.key;\ndocument.title=CONFIG.title;\n' + s(223, 224) + "\n"
           + s(243, 247) + "\n" + s(876, 883) + "\n" + s(1352, 1353) + "\n")

main = s(1007, 1350) + s(1703, 1897)
tail = s(1898, 1901)

main = sub(main, 'var RANKS=[[0,"Intern"],[100,"Analyst"],[300,"Associate"],[600,"Manager"],[900,"Ethics Officer"],[1250,"Chief Ethics Officer"]];', 'var RANKS=CONFIG.ranks;')
main = sub(main, 'var ZSHORT={csr:"CSR",theo:"Theories",beh:"Behaviour",mgmt:"Managing",ai:"AI",cases:"Cases"};', 'var ZSHORT=CONFIG.zshort;')
main = sub(main, 'Ethics & CSR course at IESEG School of Management', '"+CONFIG.course+"', 2)
main = sub(main, '<h1>Ethics Arena</h1><div class="mono">Ethics &amp; CSR · IÉSEG Paris · exam prep</div>', "<h1>'+esc(CONFIG.title)+'</h1><div class=\"mono\">'+esc(CONFIG.subtitle)+'</div>")
main = sub(main, 'Paper-style, 20 points, answers', "Paper-style, '+CONFIG.examTotal+' points, answers")
main = sub(main, 'the format of the 2025 annals:', "the format of '+esc(CONFIG.examFormat)+':")
main = sub(main, '<p class="hint">7 questions · 20 points\'', "<p class=\"hint\">'+e.qs.length+' questions · '+CONFIG.examTotal+' points'")
main = sub(main, "last score <b>'+l.s+'/20</b>", "last score <b>'+l.s+'/'+CONFIG.examTotal+'</b>")
main = sub(main, '<h2>Ethics &amp; CSR</h2>', "<h2>'+esc(CONFIG.examName)+'</h2>")
main = sub(main, "<td>20 points</td>", "<td>'+CONFIG.examTotal+' points</td>")
main = sub(main, "m:20,", "m:CONFIG.examTotal,")
main = sub(main, "var pc=total/20,", "var pc=total/CONFIG.examTotal,")
main = sub(main, "'+total+' / 20 · '", "'+total+' / '+CONFIG.examTotal+' · '")

(root/"engine/head.html").write_text(head); (root/"engine/prelude.js").write_text(prelude)
(root/"engine/main.js").write_text(main); (root/"engine/tail.html").write_text(tail)

# ---- content (course: ethics) ----
c = root/"courses/ethics"
(c/"zones.js").write_text(s(226, 242))
(c/"questions.js").write_text(s(248, 875))
(c/"figures.js").write_text(s(884, 1006))
(c/"learn.js").write_text(s(1354, 1585))
(c/"exams.js").write_text(s(1587, 1701))
print("ok")
