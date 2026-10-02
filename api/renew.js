// 매일 1번(Vercel Cron) — 결제일이 된 구독을 자동 결제. 실패하면 3일까지 재시도 후 해지
const { redis } = require("./_db");
const { chargeMonth, DAY } = require("./_toss");
module.exports = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();
  const due = await redis("ZRANGEBYSCORE", "kok:subs", "0", String(Date.now() + DAY / 2));
  const out = [];
  for (const uid of due || []) {
    const raw = await redis("GET", `kok:sub:${uid}`);
    const sub = raw && JSON.parse(raw);
    if (!sub || !sub.active) { await redis("ZREM", "kok:subs", uid); continue; }
    try { await chargeMonth(uid, sub); out.push([uid, "ok"]); }
    catch (e) {
      sub.fails = (sub.fails || 0) + 1;
      if (sub.fails >= 3) { sub.active = false; await redis("ZREM", "kok:subs", uid); }
      else await redis("ZADD", "kok:subs", String(Date.now() + DAY), uid);
      await redis("SET", `kok:sub:${uid}`, JSON.stringify(sub));
      out.push([uid, "fail", e.code || e.message]);
    }
  }
  res.json({ checked: (due || []).length, results: out });
};
