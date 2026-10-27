const { setSession, readCookie } = require("./_session");
module.exports = async (req, res) => {
  const { code, state, error } = req.query;
  const back = (q) => res.writeHead(302, { Location: "/" + q }).end();
  if (error || !code) return back("?login=cancel");
  if (!state || state !== readCookie(req, "kk_state")) return back("?login=fail");
  try {
    const tok = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code", client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://kokcolor.kr/api/google-callback", code,
      }),
    }).then((r) => r.json());
    if (!tok.access_token) return back("?login=fail");
    const me = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + tok.access_token } }).then((r) => r.json());
    if (!me.sub) return back("?login=fail");
    setSession(res, { uid: "google:" + me.sub });
    const next = state.split("-")[1];
    back("?login=ok" + (next ? "&next=" + next : ""));
  } catch (e) {
    back("?login=fail");
  }
};
