const crypto = require("crypto");
module.exports = (req, res) => {
  const next = ["gold", "print", "review"].includes(req.query.next) ? req.query.next : "";
  const state = crypto.randomBytes(16).toString("hex") + (next ? "-" + next : "");
  res.setHeader("Set-Cookie", `kk_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const q = new URLSearchParams({
    client_id: process.env.NAVER_CLIENT_ID,
    redirect_uri: "https://kokcolor.kr/api/naver-callback",
    response_type: "code",
    state,
  });
  res.writeHead(302, { Location: "https://nid.naver.com/oauth2.0/authorize?" + q }).end();
};
