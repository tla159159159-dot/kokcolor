// 서명된 쿠키 세션 (DB 없이 로그인 유지)
const crypto = require("crypto");
const NAME = "kk_sess";
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

const sign = (v) => crypto.createHmac("sha256", process.env.SESSION_SECRET).update(v).digest("base64url");

function readCookie(req, name) {
  const m = (req.headers.cookie || "").match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function getSession(req) {
  const raw = readCookie(req, NAME);
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sign(body)), b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const s = JSON.parse(Buffer.from(body, "base64url").toString());
  return s.exp > Date.now() / 1000 ? s : null;
}

function setSession(res, data) {
  const body = Buffer.from(JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString("base64url");
  res.setHeader("Set-Cookie", `${NAME}=${body}.${sign(body)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

function clearSession(res) {
  res.setHeader("Set-Cookie", `${NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

module.exports = { getSession, setSession, clearSession, readCookie, sign };
