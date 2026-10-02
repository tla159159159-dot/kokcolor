// 도안별 카톡/SNS 미리보기 이미지(1200x630) 생성: NODE_PATH=<playwright 있는 곳> node tools/build-og.js
// packs.json 기준 → og/<그림id>.jpg, og/t-<테마id>.jpg
const fs = require("fs"), path = require("path"), { chromium } = require("playwright");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "og");
const packs = JSON.parse(fs.readFileSync(path.join(__dirname, "packs.json"), "utf8"));
fs.mkdirSync(OUT, { recursive: true });
const IMG = path.join(ROOT, "img"); fs.mkdirSync(IMG, { recursive: true });
// 이미지 검색용 도안 PNG(800x800, 흰 배경 선화 + 작은 워터마크) → img/<그림id>.png
const lineCss = `body{margin:0;width:800px;height:800px;background:#fff;position:relative;font-family:"Jua",sans-serif}svg{width:800px;height:800px;display:block}
.fill{fill:#fff;stroke:#2a2533;stroke-width:4.5;stroke-linejoin:round}.fill[data-n="배경"]{stroke:none}.ln{fill:none;stroke:#2a2533;stroke-width:4.5;stroke-linecap:round}.dk{fill:#2a2533}.wt{fill:#fff;stroke:#2a2533;stroke-width:3.5}
.wm{position:absolute;right:26px;bottom:18px;font-size:22px;color:#b9b2cc}`;
const css = `body{margin:0;width:1200px;height:630px;display:flex;align-items:center;gap:48px;padding:0 70px;box-sizing:border-box;
 background:linear-gradient(120deg,#F3EDFF,#FFE9F3 55%,#FFF1E3);font-family:'Jua',sans-serif;color:#241B3E}
.t{flex:1}.logo{font-size:44px;color:#7C4DFF}.h{font-size:80px;line-height:1.15;margin:18px 0}.s{font-size:38px;color:#6E6788}
.b{display:inline-block;margin-top:26px;background:linear-gradient(120deg,#7C4DFF,#FF5FA2 55%,#FF9F45);color:#fff;font-size:34px;padding:14px 30px;border-radius:999px}
.pics{display:flex;gap:16px}.pic{background:#fff;border-radius:36px;padding:16px;box-shadow:0 20px 50px rgba(36,27,62,.15)}
svg{display:block}.fill{fill:#fff;stroke:#241B3E;stroke-width:5;stroke-linejoin:round}.fill[data-n="배경"]{fill:#fff;stroke:none}
.ln{fill:none;stroke:#241B3E;stroke-width:5;stroke-linecap:round}.dk{fill:#241B3E}.wt{fill:#fff;stroke:#241B3E;stroke-width:4}`;
const html = (title, sub, svgs, size) => `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet"><style>${css} svg{width:${size}px;height:${size}px}</style>
<div class="t"><div class="logo">콕콕</div><div class="h">${title}</div><div class="s">${sub}</div><div class="b">무료로 색칠하기 ›</div></div>
<div class="pics">${svgs.map(s => `<div class="pic">${s}</div>`).join("")}</div>`;
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }), p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const shot = async (h, f) => { await p.setContent(h, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: path.join(OUT, f), type: "jpeg", quality: 82 }); };
  for (const k of packs) {
    await shot(html(`${k.name.replace(/\s/g, "")}<br>색칠공부`, `도안 ${k.pics.length}종 · 인쇄 가능`, k.pics.slice(0, 2).map(x => x.svg), 230), `t-${k.id}.jpg`);
    for (const x of k.pics) {
      await p.setViewportSize({ width: 800, height: 800 });
      await p.setContent(`<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet"><style>${lineCss}</style>${x.svg}<div class="wm">콕콕 kokcolor.kr</div>`, { waitUntil: "networkidle" });
      await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: path.join(IMG, x.id + ".png") });
      await p.setViewportSize({ width: 1200, height: 630 });
    }
    for (const x of k.pics) await shot(html(`${x.name}<br>색칠공부 도안`, "유아 색칠놀이 · 인쇄", [x.svg], 440), `${x.id}.jpg`);
  }
  await b.close(); console.log("og:", fs.readdirSync(OUT).length);
})();
