const { setSession, readCookie } = require("./_session");
module.exports = async (req, res) => {
  const { code, state, error } = req.query;
  const back = (q) => res.writeHead(302, { Location: "/" + q }).end();
  if (error || !code) return back("?login=cancel");
  if (!state || state !== readCookie(req, "kk_state")) return back("?login=fail");
  try {
    const tok = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_KEY,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: "https://kokcolor.kr/api/kakao-callback",
        code,
      }),
    }).then((r) => r.json());
    if (!tok.access_token) return back("?login=fail");
    const me = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: "Bearer " + tok.access_token },
    }).then((r) => r.json());
    if (!me.id) return back("?login=fail");
    setSession(res, { uid: "kakao:" + me.id });
    const next = state.split("-")[1];
    back("?login=ok" + (next ? "&next=" + next : ""));
  } catch (e) {
    back("?login=fail");
  }
};
