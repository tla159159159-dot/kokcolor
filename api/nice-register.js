// 골드 시작: 카드 등록(빌키 발급) → 첫 달 결제. 카드정보는 암호화해 나이스페이로만 전달
const { getSession } = require("./_session");
const { redis } = require("./_db");
const { registBid, expireBid, chargeMonth } = require("./_nice");
const TEST_UID = "kakao:5115936774";
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false, msg: "로그인이 필요해요." });
  // 콕콕 전용 상점 키 받기 전엔 잠금 — 받으면 Vercel에 NICEPAY_OPEN=1
  if (!process.env.NICEPAY_CLIENT_KEY || !process.env.NICEPAY_OPEN) return res.status(503).json({ ok: false, msg: "골드 오픈 준비 중이에요." });
  // 카드 대입 공격 방지: 계정당 하루 5번
  const tryKey = `kok:cardtry:${s.uid}:${new Date().toISOString().slice(0, 10)}`;
  if (Number(await redis("INCR", tryKey)) > 5) return res.status(429).json({ ok: false, msg: "오늘은 시도 횟수를 넘었어요. 내일 다시 해 주세요." });
  await redis("EXPIRE", tryKey, "86400");
  const b = req.body || {}, d = v => String(v || "").replace(/\D/g, "");
  const card = { cardNo: d(b.cardNo), expMonth: d(b.expMonth).padStart(2, "0"), expYear: d(b.expYear).slice(-2), idNo: d(b.idNo), cardPw: d(b.cardPw) };
  const bad = !/^\d{14,16}$/.test(card.cardNo) ? "카드번호(숫자 14~16자리)"
    : !/^(0[1-9]|1[0-2])$/.test(card.expMonth) ? "유효기간 월(01~12)"
    : !/^\d{2}$/.test(card.expYear) ? "유효기간 년(YY)"
    : !/^(\d{6}|\d{10})$/.test(card.idNo) ? "생년월일 6자리(법인카드는 사업자번호 10자리)"
    : !/^\d{2}$/.test(card.cardPw) ? "비밀번호 앞 2자리" : "";
  if (bad) return res.status(400).json({ ok: false, msg: `${bad}를 다시 확인해 주세요.` });
  let bid;
  try {
    const r = await registBid(s.uid, card);
    bid = r.bid;
    // ponytail: 운영자 계정은 카드 확인만 하고 결제 안 함(빌키 즉시 삭제). 실결제 테스트 끝나면 TEST_UID 지워도 됨
    if (s.uid === TEST_UID) { await expireBid(bid); return res.json({ ok: false, msg: `✅ 카드 확인 성공 (${r.cardName || "카드"}) · 결제는 안 됐어요` }); }
    const old = JSON.parse((await redis("GET", `kok:sub:${s.uid}`)) || "null");
    const sub = { bid, card: r.cardName, active: true, since: Date.now(), fails: 0 };
    const until = await chargeMonth(s.uid, sub);
    if (old && old.bid && old.bid !== bid) expireBid(old.bid);
    res.json({ ok: true, goldUntil: until });
  } catch (e) {
    if (bid) await expireBid(bid);
    res.status(402).json({ ok: false, msg: e.message || "결제하지 못했어요." });
  }
};
