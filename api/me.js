const { getSession } = require("./_session");
module.exports = (req, res) => {
  const s = getSession(req);
  res.setHeader("Cache-Control", "no-store");
  res.json(s ? { loggedIn: true, uid: s.uid, gold: false } : { loggedIn: false });
};
