// 카드 등록 성공 → 빌링키 발급 → 첫 달 결제
const { getSession } = require("./_session");
const { redis } = require("./_db");
const { toss, chargeMonth, customerKeyFor } = require("./_toss");
module.exports = async (req, res) => {
  const back = q => res.writeHead(302, { Location: "/?" + q }).end();
  const s = getSession(req);
  const { customerKey, authKey } = req.query;
  if (!s) return back("gold=login");
  if (!authKey || customerKey !== customerKeyFor(s.uid)) return back("gold=fail");
  try {
    const b = await toss("/v1/billing/authorizations/issue", { authKey, customerKey });
    const sub = { billingKey: b.billingKey, customerKey, card: b.card ? b.card.number : "", active: true, since: Date.now(), fails: 0 };
    await chargeMonth(s.uid, sub);
    back("gold=ok");
  } catch (e) {
    back("gold=fail&msg=" + encodeURIComponent(e.message || ""));
  }
};
