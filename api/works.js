// 내 작품: 로그인한 사람의 색칠 상태를 서버에 보관 → 다른 기기에서도 이어서 칠하기
const { getSession } = require("./_session");
const { redis } = require("./_db");
const MAX_WORKS = 300, MAX_FILLS = 200;
const okColor = c => typeof c === "string" && c.length <= 40 && /^(|#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\)|[a-z]+)$/.test(c);
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false });
  const key = `kok:works:${s.uid}`;
  if (req.method === "GET") {
    const flat = (await redis("HGETALL", key)) || [];
    const works = {};
    for (let i = 0; i < flat.length; i += 2) { try { works[flat[i]] = JSON.parse(flat[i + 1]); } catch (e) {} }
    return res.json({ ok: true, works });
  }
  if (req.method !== "POST") return res.status(405).end();
  const { id, snap } = req.body || {};
  if (!/^[a-z0-9]{1,30}$/.test(id || "")) return res.status(400).json({ ok: false });
  if (!Array.isArray(snap) || !snap.some(Boolean)) { await redis("HDEL", key, id); return res.json({ ok: true }); }
  if (snap.length > MAX_FILLS || !snap.every(okColor)) return res.status(400).json({ ok: false });
  if (Number(await redis("HLEN", key)) >= MAX_WORKS && !(await redis("HEXISTS", key, id))) return res.status(413).json({ ok: false });
  await redis("HSET", key, id, JSON.stringify(snap));
  res.json({ ok: true });
};
