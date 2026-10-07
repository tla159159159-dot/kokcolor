// index.html 의 PACKS → tools/packs.json (build-doan.js·build-og.js 입력). 서버 없이 실행:
// NODE_PATH=<playwright 있는 node_modules> node tools/extract-packs.js
const fs = require("fs"), path = require("path"), { chromium } = require("playwright");
const ROOT = path.join(__dirname, "..");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }), p = await b.newPage();
  await p.route("**/*", r => {
    const u = new URL(r.request().url());
    if (u.hostname !== "kok.local") return r.abort();
    if (u.pathname.startsWith("/api/")) return r.fulfill({ json: { loggedIn: false } });
    const f = path.join(ROOT, decodeURIComponent(u.pathname === "/" ? "/index.html" : u.pathname));
    return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: "" });
  });
  await p.goto("http://kok.local/"); await p.waitForTimeout(500);
  const d = await p.evaluate(() => PACKS.map(k => ({ id: k.id, name: k.name, emoji: k.emoji, pics: k.pics.map(x => ({ id: x.id, name: x.name, svg: x.svg })) })));
  fs.writeFileSync(path.join(__dirname, "packs.json"), JSON.stringify(d));
  console.log(d.map(k => `${k.id}(${k.pics.length}): ` + k.pics.map(x => x.id).join(",")).join("\n"), "\n총", d.reduce((a, k) => a + k.pics.length, 0)); await b.close();
})();
