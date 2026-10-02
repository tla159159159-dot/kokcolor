// 토스페이먼츠 자동결제(빌링) 공통
const crypto = require("crypto");
const { redis } = require("./_db");

const PRICE = 2900, ORDER_NAME = "콕콕 골드 1개월", DAY = 864e5, PERIOD = 30 * DAY;
const auth = () => "Basic " + Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64");

// 토스 규칙: 2~50자, 특수문자(-_=.@) 1개 이상, 추측 불가한 값
const customerKeyFor = uid => "kok_" + crypto.createHmac("sha256", process.env.SESSION_SECRET).update(uid).digest("hex").slice(0, 40);

async function toss(path, body) {
  const r = await fetch("https://api.tosspayments.com" + path, {
    method: "POST",
    headers: { Authorization: auth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error(j.message || "toss error"), { code: j.code });
  return j;
}

// 한 달 치 결제 → 성공하면 골드 기간 연장
async function chargeMonth(uid, sub) {
  const orderId = `kok-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const pay = await toss(`/v1/billing/${sub.billingKey}`, {
    customerKey: sub.customerKey, amount: PRICE, orderId, orderName: ORDER_NAME,
  });
  const cur = Number(await redis("GET", `kok:gold:${uid}`)) || 0;
  const until = Math.max(cur, Date.now()) + PERIOD;
  await redis("SET", `kok:gold:${uid}`, String(until));
  sub.next = until; sub.fails = 0; sub.lastOrderId = orderId; sub.lastPaymentKey = pay.paymentKey;
  await redis("SET", `kok:sub:${uid}`, JSON.stringify(sub));
  await redis("ZADD", "kok:subs", String(until), uid);
  await redis("RPUSH", `kok:pay:${uid}`, JSON.stringify({ at: Date.now(), orderId, paymentKey: pay.paymentKey, amount: PRICE }));
  return until;
}

module.exports = { toss, chargeMonth, customerKeyFor, PRICE, DAY };
