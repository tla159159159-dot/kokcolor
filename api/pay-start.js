// 간편결제(카카오페이·네이버페이·삼성페이) 30일 이용권 — 주문 만들기. 자동연장 없음
const { getSession } = require("./_session");
const { redis } = require("./_db");
const { newOrderId, priceFor } = require("./_nice");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false, msg: "로그인이 필요해요." });
  if (!process.env.NICEPAY_CLIENT_KEY || !process.env.NICEPAY_OPEN) return res.status(503).json({ ok: false, msg: "골드 오픈 준비 중이에요." });
  const orderId = newOrderId("ez");
  // 결제창에서 돌아올 땐 쿠키가 안 올 수 있어서 주문번호로 계정을 찾음
  const amount = await priceFor(s.uid);
  await redis("SET", `kok:order:${orderId}`, JSON.stringify({ uid: s.uid, amount }), "EX", "1800");
  res.json({ ok: true, clientId: process.env.NICEPAY_CLIENT_KEY, orderId, amount, goodsName: "콕콕 골드 30일" });
};
