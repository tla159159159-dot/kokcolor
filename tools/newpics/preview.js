// 사용: NODE_PATH=<playwright node_modules> node tools/newpics/preview.js <팩>.txt out.png
// <pack>.txt = index.html PACKS의 pics 항목 줄들(  {id:"..", name:"..", svg:`<svg ${A}>${BG()} ... </svg>`},) 그대로
const fs = require("fs"), { chromium } = require("playwright");
const src = fs.readFileSync(process.argv[2], "utf8");
function rays(cx,cy,rIn,rOut,n,name){ let s="";
  for(let i=0;i<n;i++){ const a=i*2*Math.PI/n, p=(r,an)=>`${(cx+r*Math.cos(an)).toFixed(1)},${(cy+r*Math.sin(an)).toFixed(1)}`;
    s+=`<polygon class="fill" data-n="${name}" points="${p(rIn,a-0.17)} ${p(rOut,a)} ${p(rIn,a+0.17)}"/>`; } return s; }
function star(cx,cy,ro,ri,n){ let p=[];
  for(let i=0;i<n*2;i++){ const r=i%2?ri:ro, a=-Math.PI/2+i*Math.PI/n; p.push(`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`);} return p.join(" "); }
const A = 'class="art" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg"';
const GR = (n="땅",y=300) => `<path class="fill" data-n="${n}" d="M8 ${y} H352 V326 a26 26 0 0 1 -26 26 H34 a26 26 0 0 1 -26 -26 Z"/>`;
const BG = c => `<rect class="fill" data-n="배경" x="8" y="8" width="344" height="344" rx="26"/>`;
const pics = eval("[" + src + "]");
for (const p of pics) { if (!/^[a-z0-9]{1,30}$/.test(p.id)) throw Error("bad id " + p.id); const n = (p.svg.match(/class="fill"/g) || []).length; if (n < 4) throw Error(p.id + ": 색칠 영역 너무 적음"); }
const css = `body{margin:0;display:flex;flex-wrap:wrap;gap:12px;padding:12px;background:#eee;font:16px sans-serif}
.c{background:#fff;padding:6px;text-align:center}svg{width:180px;height:180px;display:block}
.fill{fill:#fff;stroke:#2a2533;stroke-width:4;stroke-linejoin:round}.ln{fill:none;stroke:#2a2533;stroke-width:4;stroke-linecap:round}.dk{fill:#2a2533}.wt{fill:#fff;stroke:#2a2533;stroke-width:3}`;
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }), pg = await b.newPage({ viewport: { width: 1800, height: 400 } });
  await pg.setContent(`<style>${css}</style>` + pics.map(p => `<div class="c">${p.svg}<div>${p.id} · ${p.name}</div></div>`).join(""));
  await pg.screenshot({ path: process.argv[3], fullPage: true }); await b.close(); console.log("ok", pics.length);
})();
