module.exports = (req, res) => {
  const msg = req.query.message || "";
  res.writeHead(302, { Location: "/?gold=" + (req.query.code === "PAY_PROCESS_CANCELED" ? "cancel" : "fail") + "&msg=" + encodeURIComponent(msg) }).end();
};
