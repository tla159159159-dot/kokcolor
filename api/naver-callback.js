const { setSession, readCookie } = require("./_session");
module.exports = async (req, res) => {
  const { code, state, error } = req.query;
  const back = (q) => res.writeHead(302, { Location: "/" + q }).end();
  if (error || !code) return back("?login=cancel");
  if (!state || state !== readCookie(req, "kk_state")) return back("?login=fail");
  try {
    const tok = await fetch("https://nid.naver.com/oauth2.0/token?" + new URLSearchParams({
      grant_type: "authorization_code", client_id: process.env.NAVER_CLIENT_ID, client_secret: process.env.NAVER_CLIENT_SECRET, code, state,
    })).then((r) => r.json());
    if (!tok.access_token) return back("?login=fail");
    const me = await fetch("https://openapi.naver.com/v1/nid/me", { headers: { Authorization: "Bearer " + tok.access_token } }).then((r) => r.json());
    if (!me.response || !me.response.id) return back("?login=fail");
    setSession(res, { uid: "naver:" + me.response.id });
    const next = state.split("-")[1];
    back("?login=ok" + (next ? "&next=" + next : ""));
  } catch (e) {
    back("?login=fail");
  }
};
