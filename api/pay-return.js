// 나이스페이 결제창 인증 후 돌아오는 곳(POST) → 승인 → 골드 30일
const { redis } = require("./_db");
const { nice, addGold } = require("./_nice");
module.exports = async (req, res) => {
  const b = req.body || {};
  const go = r => { res.statusCode = 302; res.setHeader("Location", "/?gold=" + r); res.end(); };
  if (b.authResultCode !== "0000") return go("cancel");
  // GETDEL: 같은 주문 두 번 승인 방지
  const o = JSON.parse((b.orderId && await redis("GETDEL", `kok:order:${b.orderId}`)) || "null");
  if (!o || Number(b.amount) !== o.amount || !b.tid) return go("fail");
  const { uid, amount } = o;
  try {
    const pay = await nice(`/v1/payments/${encodeURIComponent(b.tid)}`, { amount });
    if (pay.orderId && pay.orderId !== b.orderId) return go("fail");
    await addGold(uid, { orderId: b.orderId, tid: pay.tid || b.tid, amount, method: pay.payMethod || "easypay" });
    go("ok");
  } catch (e) { go("fail"); }
};
