// 테마별·그림별 색칠공부 도안 SEO 페이지 생성: node tools/build-doan.js
// packs.json = index.html의 PACKS 스냅샷 (그림 추가 시 다시 뽑아서 교체)
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "색칠공부");
const packs = JSON.parse(fs.readFileSync(path.join(__dirname, "packs.json"), "utf8"));
const SITE = "https://kokcolor.kr", TODAY = new Date().toISOString().slice(0, 10);

const THEME = {
  basic:    { kw: "꽃·나무·자동차 색칠공부 도안", intro: "꽃, 나무, 우리집, 무지개, 자동차, 해님처럼 아이가 처음 색칠하기 좋은 쉬운 도안이에요. 선이 굵고 칸이 넓어서 3~5세 유아도 혼자 칠할 수 있어요." },
  animal:   { kw: "동물 색칠공부 도안", intro: "곰돌이, 고양이, 강아지, 토끼, 사자, 판다까지 아이들이 좋아하는 귀여운 동물 색칠공부 도안이에요. 화면에서 바로 색칠하거나 종이로 인쇄해서 칠할 수 있어요." },
  sea:      { kw: "바다 동물 색칠공부 도안", intro: "물고기, 고래, 문어, 게, 거북이, 불가사리 바다 친구들 색칠공부 도안이에요. 파란색 계열을 골라 바닷속을 꾸며 보세요." },
  sky:      { kw: "로켓·비행기 색칠공부 도안", intro: "로켓, 비행기, 열기구, 나비, 꿀벌, 병아리 하늘을 나는 친구들 색칠공부 도안이에요. 탈것을 좋아하는 아이에게 딱이에요." },
  snack:    { kw: "음식·간식 색칠공부 도안", intro: "아이스크림, 컵케이크, 도넛, 막대사탕, 수박, 딸기 맛있는 간식 색칠공부 도안이에요. 알록달록 무지개 붓으로 칠하면 더 재미있어요." },
  dino:     { kw: "공룡 색칠공부 도안", intro: "티라노, 트리케라톱스, 스테고, 목긴공룡, 아기공룡, 공룡알 둥지까지 공룡 색칠공부 도안 모음이에요. 공룡 좋아하는 아이가 제일 먼저 찾는 그림이에요." },
  princess: { kw: "공주 색칠공부 도안", intro: "공주님, 성, 유니콘, 보석 왕관, 인어공주, 개구리 왕자 공주 색칠공부 도안이에요. 반짝이는 색으로 나만의 공주 그림을 완성해 보세요." },
  bug:      { kw: "곤충·숲속 색칠공부 도안", intro: "무당벌레, 달팽이, 잠자리, 버섯, 애벌레, 도토리 숲속 친구들 색칠공부 도안이에요. 자연관찰 놀이와 함께하기 좋아요." },
  ride:     { kw: "소방차·버스·기차 색칠공부 도안", intro: "소방차, 경찰차, 버스, 기차, 배, 트럭까지 아이들이 좋아하는 탈것 색칠공부 도안이에요. 바퀴와 창문을 칸칸이 나눠서 칠하기 쉬워요." },
  fruit:    { kw: "과일·채소 색칠공부 도안", intro: "사과, 바나나, 포도, 당근, 토마토, 파인애플 과일·채소 색칠공부 도안이에요. 색 이름과 음식 이름을 함께 익히기 좋아요." },
  halloween:{ kw: "할로윈 색칠공부 도안", intro: "호박, 유령, 마녀모자, 박쥐, 사탕바구니, 부엉이 할로윈 색칠공부 도안이에요. 무섭지 않고 귀여운 그림이라 유아도 즐겁게 칠할 수 있어요." },
  xmas:     { kw: "크리스마스 색칠공부 도안", intro: "크리스마스 트리, 눈사람, 산타, 선물상자, 양말, 루돌프 크리스마스 색칠공부 도안이에요. 인쇄해서 카드나 장식으로 꾸며 보세요." },
  space:    { kw: "우주 색칠공부 도안", intro: "토성, 우주인, 외계인, UFO, 달님, 망원경까지 우주 색칠공부 도안이에요. 별과 행성을 마음대로 칠하며 상상력을 키워요." },
  farm:     { kw: "농장 동물 색칠공부 도안", intro: "젖소, 돼지, 양, 암탉, 조랑말, 오리 농장 동물 색칠공부 도안이에요. 동물 울음소리 놀이와 함께하면 더 즐거워요." },
  plant:    { kw: "꽃·식물 색칠공부 도안", intro: "해바라기, 튤립, 선인장, 네잎클로버, 단풍잎, 꽃바구니 꽃·식물 색칠공부 도안이에요. 계절 자연관찰과 함께하기 좋아요." },
  party:    { kw: "생일 파티 색칠공부 도안", intro: "생일케이크, 고깔모자, 풍선다발, 곰인형, 쿠키, 주스 생일 파티 색칠공부 도안이에요. 생일 카드나 파티 놀이로 인쇄해 써도 좋아요." },
  music:    { kw: "악기 색칠공부 도안", intro: "북, 기타, 피아노, 트럼펫, 실로폰, 탬버린 악기 색칠공부 도안이에요. 악기 이름을 익히며 칠할 수 있어요." },
};

// 한글 주소: /색칠공부/공룡 , /색칠공부/공룡/티라노
const KO = { basic: "꽃나무", animal: "동물", sea: "바다동물", sky: "하늘", snack: "간식", dino: "공룡", princess: "공주", bug: "곤충", ride: "탈것", fruit: "과일채소", halloween: "할로윈", xmas: "크리스마스", space: "우주", farm: "농장동물", plant: "꽃식물", party: "생일파티", music: "악기" };
const slug = s => s.trim().replace(/\s+/g, "-");
const themeUrl = p => `/색칠공부/${KO[p.id]}`;
const picUrl = (p, x) => `/색칠공부/${KO[p.id]}/${slug(x.name)}`;
const abs = u => SITE + encodeURI(u);

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const svgA11y = (svg, label) => svg.replace("<svg ", `<svg role="img" aria-label="${esc(label)}" `);

const page = ({ title, desc, canon, h1, body, crumbs, og = "/og.png" }) => `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KTFDM2WQQ2"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-KTFDM2WQQ2");</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${abs(canon)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="콕콕">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(canon)}"><meta property="og:image" content="${SITE}${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/rss+xml" title="콕콕 색칠공부 도안" href="/rss.xml">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#7C4DFF">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[0], item: abs(c[1]) })) })}</script>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/doan.css">
</head><body><div class="wrap">
<header class="top"><a class="logo" href="/">🖍️ 콕콕</a><a class="top-cta" href="/">무료 색칠하기 →</a></header>
<nav class="crumb">${crumbs.map((c, i) => i < crumbs.length - 1 ? `<a href="${c[1]}">${c[0]}</a> › ` : `<span>${c[0]}</span>`).join("")}</nav>
<h1>${h1}</h1>
${body}
<aside class="family"><b>함께 보면 좋은 곳</b><a href="https://www.dojangkwang.co.kr/?utm_source=kokcolor&amp;utm_medium=crosslink&amp;utm_campaign=doan" target="_blank" rel="noopener">✏️ 도장쾅 한글·숫자 학습지</a><a href="https://bamtol.co.kr/?utm_source=kokcolor&amp;utm_medium=crosslink&amp;utm_campaign=doan" target="_blank" rel="noopener">🌙 밤톨 자장가·동화</a><a href="https://mommoment.kr/?utm_source=kokcolor&amp;utm_medium=crosslink&amp;utm_campaign=doan" target="_blank" rel="noopener">💬 맘먼트 엄마 커뮤니티</a></aside>
<footer class="foot"><nav class="themes">${packs.map(p => `<a href="${themeUrl(p)}">${p.emoji} ${THEME[p.id].kw}</a>`).join("")}</nav>
<p><a href="/terms.html">이용약관</a> · <a href="/privacy.html">개인정보처리방침</a> · <a href="/refund.html">환불정책</a></p>
<p>© 2026 콕콕 kokcolor.kr · CKT컴퍼니</p></footer>
</div></body></html>`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(__dirname, "doan.css"), path.join(ROOT, "doan.css"));
fs.rmSync(path.join(ROOT, "doan"), { recursive: true, force: true });
const redirects = [];
const urls = [], imgOf = {};

for (const p of packs) {
  const t = THEME[p.id];
  fs.mkdirSync(path.join(OUT, KO[p.id]), { recursive: true });
  redirects.push({ source: `/doan/${p.id}`, destination: encodeURI(themeUrl(p)), permanent: true });
  const names = p.pics.map(x => x.name).join("·");
  // 테마 페이지
  fs.writeFileSync(path.join(OUT, KO[p.id] + ".html"), page({
    title: `${t.kw} ${p.pics.length}종 | 무료 색칠·인쇄 - 콕콕`,
    desc: `${t.kw} ${p.pics.length}종(${names})을 화면에서 무료로 색칠하고 종이로 인쇄해요. 가입 없이 바로 시작!`,
    canon: themeUrl(p), og: `/og/t-${p.id}.jpg`,
    h1: `${p.emoji} ${t.kw} <small>${p.pics.length}종</small>`,
    crumbs: [["홈", "/"], ["색칠공부 도안", "/#pics"], [t.kw, themeUrl(p)]],
    body: `<p class="intro">${t.intro}</p>
<a class="big-cta" href="/?pic=${p.pics[0].id}">🎨 지금 바로 무료로 색칠하기</a>
<ul class="grid">${p.pics.map(x => `<li><a href="${picUrl(p, x)}"><img src="/img/${x.id}.png" alt="${esc(x.name)} 색칠공부 도안" width="400" height="400" loading="lazy" decoding="async"><span>${x.name} 색칠공부</span></a></li>`).join("")}</ul>`,
  }));
  urls.push(themeUrl(p)); imgOf[themeUrl(p)] = p.pics.map(x => x.id); p.pics.forEach(x => { imgOf[picUrl(p, x)] = [x.id]; });
  // 그림 페이지
  p.pics.forEach((x, i) => {
    const others = p.pics.filter(o => o.id !== x.id);
    redirects.push({ source: `/doan/${p.id}/${x.id}`, destination: encodeURI(picUrl(p, x)), permanent: true });
    fs.writeFileSync(path.join(OUT, KO[p.id], slug(x.name) + ".html"), page({
      title: `${x.name} 색칠공부 도안 | 무료 색칠·인쇄 - 콕콕`,
      desc: `${x.name} 색칠공부 도안을 화면에서 무료로 바로 색칠하고, 종이로 인쇄해서 칠할 수도 있어요. ${t.kw} 모음 콕콕.`,
      canon: picUrl(p, x), og: `/og/${x.id}.jpg`,
      h1: `${x.name} 색칠공부 도안`,
      crumbs: [["홈", "/"], [t.kw, themeUrl(p)], [x.name, picUrl(p, x)]],
      body: `<div class="hero-pic"><img src="/img/${x.id}.png" alt="${esc(x.name)} 색칠공부 도안 - 유아 색칠놀이 무료 인쇄" width="800" height="800" fetchpriority="high"></div>
<div class="cta-row"><a class="big-cta" href="/?pic=${x.id}">🎨 화면에서 색칠하기</a><a class="ghost-cta" href="/?pic=${x.id}&amp;print=1">🖨️ 종이로 인쇄하기</a></div>
<p class="intro">${x.name} 그림은 ${t.kw} ${p.pics.length}종 중 하나예요. 칸을 누르면 바로 색이 채워져서 아직 손이 서툰 유아도 쉽게 완성할 수 있어요. 색칠은 무료이고, 카카오 로그인하면 매주 3장까지 무료로 인쇄할 수 있어요.</p>
<h2>같은 테마 도안</h2>
<ul class="grid">${others.map(o => `<li><a href="${picUrl(p, o)}">${svgA11y(o.svg, o.name + " 색칠공부 도안")}<span>${o.name}</span></a></li>`).join("")}</ul>`,
    }));
    urls.push(picUrl(p, x));
  });
}

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
${urls.map(u => `  <url><loc>${abs(u)}</loc><lastmod>${TODAY}</lastmod><priority>${u.split("/").length === 3 ? "0.8" : "0.6"}</priority>${(imgOf[u] || []).map(i => `<image:image><image:loc>${SITE}/img/${i}.png</image:loc></image:image>`).join("")}</url>`).join("\n")}
</urlset>
`);
// rss.xml: 네이버 RSS 제출용 (테마·그림 페이지)
const now = new Date().toUTCString();
const items = [];
for (const p of packs) {
  const t = THEME[p.id];
  items.push({ title: `${t.kw} ${p.pics.length}종`, url: themeUrl(p), desc: t.intro });
  p.pics.forEach(x => items.push({ title: `${x.name} 색칠공부 도안`, url: picUrl(p, x), desc: `${x.name} 색칠공부 도안을 화면에서 무료로 색칠하고 인쇄해요. ${t.kw} 모음.` }));
}
fs.writeFileSync(path.join(ROOT, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>콕콕 무료 색칠공부 도안</title>
<link>${SITE}/</link>
<description>무료 색칠공부 도안과 유아 색칠놀이 - 공룡·공주·동물 색칠공부 도안을 화면에서 색칠하고 인쇄해요.</description>
<language>ko</language>
<lastBuildDate>${now}</lastBuildDate>
${items.map(i => `<item><title>${esc(i.title)}</title><link>${abs(i.url)}</link><guid>${abs(i.url)}</guid><description>${esc(i.desc)}</description><pubDate>${now}</pubDate></item>`).join("\n")}
</channel></rss>
`);

// vercel.json: 확장자 없는 주소 + www 리다이렉트 + 옛 영어 주소 리다이렉트
fs.writeFileSync(path.join(ROOT, "vercel.json"), JSON.stringify({
  cleanUrls: true,
  crons: [{ path: "/api/renew", schedule: "0 1 * * *" }],
  redirects: [
    { source: "/:path*", has: [{ type: "host", value: "www.kokcolor.kr" }], destination: "https://kokcolor.kr/:path*", permanent: true },
    ...redirects,
  ],
}, null, 2) + "\n");
fs.writeFileSync(path.join(ROOT, "tools", "naver-urls.txt"), urls.slice(0, 0).concat(["/", ...packs.map(themeUrl)]).map(abs).join("\n") + "\n");
console.log("pages:", urls.length, "redirects:", redirects.length);
