const crypto = require("crypto");
module.exports = (req, res) => {
  const next = ["gold", "print", "review"].includes(req.query.next) ? req.query.next : "";
  const state = crypto.randomBytes(16).toString("hex") + (next ? "-" + next : "");
  res.setHeader("Set-Cookie", `kk_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: "https://kokcolor.kr/api/google-callback",
    response_type: "code",
    scope: "openid",
    state,
  });
  res.writeHead(302, { Location: "https://accounts.google.com/o/oauth2/v2/auth?" + q }).end();
};
