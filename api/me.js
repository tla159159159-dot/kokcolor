const { getSession } = require("./_session");
const { status, redis } = require("./_db");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const s = getSession(req);
  if (!s) return res.json({ loggedIn: false });
  try {
    const sub = JSON.parse((await redis("GET", `kok:sub:${s.uid}`)) || "null");
    res.json({ loggedIn: true, uid: s.uid, ...(await status(s.uid)), subActive: !!(sub && sub.active),
      payReady: !!(process.env.NICEPAY_CLIENT_KEY && process.env.NICEPAY_OPEN) });
  }
  catch (e) { res.json({ loggedIn: true, uid: s.uid, gold: false, printsLeft: null, dbError: true }); }
};
