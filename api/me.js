const { getSession } = require("./_session");
const { status } = require("./_db");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const s = getSession(req);
  if (!s) return res.json({ loggedIn: false });
  try { res.json({ loggedIn: true, uid: s.uid, ...(await status(s.uid)) }); }
  catch (e) { res.json({ loggedIn: true, uid: s.uid, gold: false, printsLeft: null, dbError: true }); }
};
