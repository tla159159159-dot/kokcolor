// 나이스페이 정기결제(빌링) 공통 — 문서: github.com/nicepayments/nicepay-manual api/payment-subscribe.md
const crypto = require("crypto");
const { redis } = require("./_db");

const PRICE = 2900, GOODS = "콕콕 골드 1개월", DAY = 864e5, PERIOD = 30 * DAY;
// 운영 전환: NICEPAY_API=https://api.nicepay.co.kr (기본은 샌드박스)
const BASE = () => process.env.NICEPAY_API || "https://sandbox-api.nicepay.co.kr";
const auth = () => "Basic " + Buffer.from(`${process.env.NICEPAY_CLIENT_KEY}:${process.env.NICEPAY_SECRET_KEY}`).toString("base64");
const newOrderId = p => `kok-${p}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

async function nice(path, body) {
  const r = await fetch(BASE() + path, {
    method: "POST",
    headers: { Authorization: auth(), "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  const code = j.resultCode || j.ResultCode;
  if (code !== "0000") throw Object.assign(new Error(j.resultMsg || j.ResultMsg || "결제 오류"), { code: code || r.status });
  return j;
}

// 카드정보 → AES-128-ECB(SecretKey 앞 16자리) Hex. 카드정보는 저장·로그하지 않음
function encCard({ cardNo, expYear, expMonth, idNo, cardPw }) {
  const plain = `cardNo=${cardNo}&expYear=${expYear}&expMonth=${expMonth}&idNo=${idNo}&cardPw=${cardPw}`;
  const c = crypto.createCipheriv("aes-128-ecb", Buffer.from(process.env.NICEPAY_SECRET_KEY.slice(0, 16), "utf8"), null);
  return Buffer.concat([c.update(plain, "utf8"), c.final()]).toString("hex");
}

async function registBid(uid, card) {
  const j = await nice("/v1/subscribe/regist", { encData: encCard(card), orderId: newOrderId("reg") });
  return { bid: j.bid || j.BID, cardName: j.cardName || j.CardName || "" };
}

const expireBid = bid => nice(`/v1/subscribe/${bid}/expire`, { orderId: newOrderId("exp") }).catch(() => null);

// 한 달 치 결제 → 성공하면 골드 기간 연장
async function chargeMonth(uid, sub) {
  const orderId = newOrderId("pay");
  const pay = await nice(`/v1/subscribe/${sub.bid}/payments`, { orderId, amount: PRICE, goodsName: GOODS, cardQuota: 0, useShopInterest: false });
  const cur = Number(await redis("GET", `kok:gold:${uid}`)) || 0;
  const until = Math.max(cur, Date.now()) + PERIOD;
  await redis("SET", `kok:gold:${uid}`, String(until));
  sub.next = until; sub.fails = 0; sub.lastOrderId = orderId; sub.lastTid = pay.tid;
  await redis("SET", `kok:sub:${uid}`, JSON.stringify(sub));
  await redis("ZADD", "kok:subs", String(until), uid);
  await redis("RPUSH", `kok:pay:${uid}`, JSON.stringify({ at: Date.now(), orderId, tid: pay.tid, amount: PRICE }));
  return until;
}

module.exports = { nice, encCard, registBid, expireBid, chargeMonth, PRICE, DAY };
