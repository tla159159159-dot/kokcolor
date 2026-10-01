const crypto = require("crypto");
module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.setHeader("Set-Cookie", `kk_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const q = new URLSearchParams({
    client_id: process.env.KAKAO_REST_KEY,
    redirect_uri: "https://kokcolor.kr/api/kakao-callback",
    response_type: "code",
    state,
  });
  res.writeHead(302, { Location: "https://kauth.kakao.com/oauth/authorize?" + q }).end();
};
