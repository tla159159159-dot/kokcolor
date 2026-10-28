// 구매평: 누구나 보기(GET), 로그인하면 쓰기(POST). 구매 여부는 아직 확인 안 함
// shortcut: 구매자만 쓰기·삭제 기능 없음, 필요해지면 kok:pay 기록 확인 + 관리자 삭제 추가
const { getSession } = require("./_session");
const { redis } = require("./_db");
const KEY = "kok:reviews", MAX = 300;
const who = s => s.name ? s.name[0] + "*".repeat(Math.max(1, s.name.length - 1))
  : ({ kakao: "카카오", naver: "네이버", google: "구글" }[s.uid.split(":")[0]] || "") + " 회원";
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") {
    const list = (await redis("LRANGE", KEY, "0", "49")) || [];
    return res.json({ ok: true, reviews: list.map(x => JSON.parse(x)) });
  }
  if (req.method !== "POST") return res.status(405).end();
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false, msg: "로그인하면 구매평을 쓸 수 있어요." });
  const b = req.body || {}, stars = Math.round(Number(b.stars));
  const text = String(b.text || "").replace(/\s+/g, " ").trim().slice(0, MAX);
  if (!(stars >= 1 && stars <= 5)) return res.status(400).json({ ok: false, msg: "별점을 골라 주세요." });
  if (text.length < 5) return res.status(400).json({ ok: false, msg: "5자 이상 써 주세요." });
  // 도배 방지: 계정당 하루 1개
  const day = `kok:review-day:${s.uid}:${new Date().toISOString().slice(0, 10)}`;
  if (Number(await redis("INCR", day)) > 1) return res.status(429).json({ ok: false, msg: "구매평은 하루에 하나만 쓸 수 있어요." });
  await redis("EXPIRE", day, "86400");
  const r = { who: who(s), stars, text, at: Date.now() };
  await redis("LPUSH", KEY, JSON.stringify(r));
  await redis("LTRIM", KEY, "0", "499");
  res.json({ ok: true, review: r });
};
