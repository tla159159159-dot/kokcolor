const { clearSession } = require("./_session");
module.exports = (req, res) => { clearSession(res); res.writeHead(302, { Location: "/" }).end(); };
