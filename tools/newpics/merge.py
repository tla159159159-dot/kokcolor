# 새 도안 합치기: tools/newpics/new/<팩id>.txt (pics 항목 줄들) → index.html 해당 팩 끝에 추가 + "N종" 숫자 갱신 + tools/newpics/<팩id>.txt 에 기록
# 사용: python3 tools/newpics/merge.py
import os, re, glob
R = os.path.join(os.path.dirname(__file__), "..", "..")
idx = os.path.join(R, "index.html"); s = open(idx, encoding="utf-8").read()
def total(t): b = t[t.index("const PACKS = ["):]; return len(re.findall(r'\{id:"[a-z0-9]+", name:', b[:b.index("\n];")]))
old = total(s); added = []
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), "new", "*.txt"))):
    pid = os.path.basename(f)[:-4]; add = open(f, encoding="utf-8").read().strip().rstrip(",")
    for i in re.findall(r'\{id:"([a-z0-9]+)"', add):
        assert f'{{id:"{i}"' not in s, f"이미 있는 id: {i}"
    i = s.index('{ id:"%s"' % pid); j = s.index("\n]}", i); body = s[i:j].rstrip()
    if not body.endswith(","): k = i + len(body); s = s[:k] + "," + s[k:]; j += 1
    s = s[:j] + "\n" + add + s[j:]; added.append(pid)
    with open(os.path.join(os.path.dirname(__file__), f"{pid}.txt"), "a", encoding="utf-8") as a: a.write("\n" + add + ",")
    os.remove(f)
new = total(s)
for a, b in [(f"{old}종", f"{new}종"), (f"<b>{old}</b>", f"<b>{new}</b>"), (f"도안 {old}종", f"도안 {new}종")]: s = s.replace(a, b)
open(idx, "w", encoding="utf-8").write(s)
p404 = os.path.join(R, "404.html"); t = open(p404, encoding="utf-8").read().replace(f"{old}종", f"{new}종"); open(p404, "w", encoding="utf-8").write(t)
print("합침:", added, f"{old} → {new}")
