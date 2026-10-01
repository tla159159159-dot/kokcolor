// 인쇄 1장 사용 — 서버가 무료 횟수를 계정 기준으로 셈
const { getSession } = require("./_session");
const { redis, weekId, status, FREE_PER_WEEK } = require("./_db");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).end();
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false, reason: "login" });
  const st = await status(s.uid);
  if (st.gold) return res.json({ ok: true, gold: true });
  const key = `kok:prints:${s.uid}:${weekId()}`;
  const n = await redis("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 60 * 60 * 24 * 14);
  if (n > FREE_PER_WEEK) { await redis("DECR", key); return res.json({ ok: false, reason: "quota", printsLeft: 0 }); }
  res.json({ ok: true, printsLeft: FREE_PER_WEEK - n });
};
