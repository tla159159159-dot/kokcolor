// 정기결제 해지: 다음 달부터 결제 안 함, 남은 기간은 그대로 골드
const { getSession } = require("./_session");
const { redis } = require("./_db");
const { expireBid } = require("./_nice");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false });
  const raw = await redis("GET", `kok:sub:${s.uid}`);
  if (raw) { const sub = JSON.parse(raw); sub.active = false; sub.canceledAt = Date.now(); if (sub.bid) { await expireBid(sub.bid); delete sub.bid; } await redis("SET", `kok:sub:${s.uid}`, JSON.stringify(sub)); }
  await redis("ZREM", "kok:subs", s.uid);
  res.json({ ok: true, goldUntil: Number(await redis("GET", `kok:gold:${s.uid}`)) || null });
};
