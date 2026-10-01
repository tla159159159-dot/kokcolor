// Upstash Redis REST (Vercel 마켓플레이스 연결 시 KV_REST_API_URL / KV_REST_API_TOKEN 자동 생성)
async function redis(...cmd) {
  const r = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.KV_REST_API_TOKEN },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const FREE_PER_WEEK = 3;

// 한국시간 기준 그 주 월요일 날짜를 주 ID로 사용 — 예: 2026-09-28
function weekId(now = Date.now()) {
  const d = new Date(now + 9 * 3600e3);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

async function status(uid) {
  const [goldUntil, used] = await Promise.all([
    redis("GET", `kok:gold:${uid}`),
    redis("GET", `kok:prints:${uid}:${weekId()}`),
  ]);
  const gold = Number(goldUntil || 0) > Date.now();
  const n = Number(used || 0);
  return { gold, goldUntil: gold ? Number(goldUntil) : null, printsUsed: n, printsLeft: gold ? null : Math.max(0, FREE_PER_WEEK - n) };
}

module.exports = { redis, weekId, status, FREE_PER_WEEK };
