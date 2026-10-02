// 배포 후 사이트맵 전체 주소를 네이버·빙(IndexNow)에 색인 요청
const KEY = "e5104966fc7b5d40c09d231f8c30d8ff", HOST = "kokcolor.kr";
(async () => {
  const xml = await (await fetch("https://kokcolor.kr/sitemap.xml")).text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList });
  for (const ep of ["https://searchadvisor.naver.com/indexnow", "https://api.indexnow.org/indexnow"]) {
    const r = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
    console.log(ep, r.status, urlList.length + " urls");
  }
})();
