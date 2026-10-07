# 콕콕 주간 새 도안 추가 절차

규칙
- 카테고리(팩)는 절대 새로 만들지 않는다. 기존 17개 팩 안에 그림만 추가한다.
- 한 주에 4장. 그림 수가 가장 적은 팩부터 고르고, 같은 팩에 몰리지 않게 서로 다른 팩 4개에 1장씩.
- 계절 우선: 10월은 할로윈, 11~12월은 크리스마스 팩에 1장을 꼭 포함.
- 기존 그림과 겹치는 소재 금지 (`node tools/extract-packs.js` 출력의 id 목록 확인).

그림 스타일 (index.html 의 기존 그림을 먼저 몇 개 읽고 똑같이)
- 한 그림 = 한 항목: `{id:"영소문자숫자", name:"한글이름", svg:\`<svg ${A}>${BG()} ...도형... </svg>\`},`
- 360x360, `${BG()}`로 시작. 바닥은 `${GR("땅")}` 등. 헬퍼: `rays(cx,cy,rIn,rOut,n,"이름")`, `star(cx,cy,ro,ri,n)`.
- 칠할 영역: `class="fill" data-n="한글 부위명"` 8~16개, 크고 단순하게. 선: `class="ln"`, 눈 등 작은 검정: `class="dk"`, 눈 하이라이트 `class="wt"`.
- 인라인 스타일·색·text·defs·id 금지. 8~352 안에. 아이용으로 귀엽고 무섭지 않게.

순서
1. 준비: `npm i --prefix /tmp/pw playwright@1.63.0` (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1), 이후 `export NODE_PATH=/tmp/pw/node_modules`
2. `node tools/extract-packs.js` 로 팩별 그림 수·id 확인 → 팩 4개와 소재 고르기
3. `tools/newpics/new/<팩id>.txt` 에 새 항목 작성 (팩마다 파일 하나)
4. 확인: `node tools/newpics/preview.js tools/newpics/new/<팩id>.txt /tmp/p.png` → 이미지를 직접 열어 보고, 알아보기 어렵거나 깨진 그림은 고칠 때까지 반복
5. `python3 tools/newpics/merge.py` (index.html 에 합치고 "N종" 숫자 자동 갱신)
6. `node tools/extract-packs.js && node tools/build-doan.js && node tools/build-og.js` (개별 페이지·사이트맵·미리보기 이미지)
7. 로컬 확인: 휴대폰(375)·패드(768·1024) 크기로 index.html 을 열어 가로 넘침 없고, 새 그림을 눌러 색칠 화면이 열리는지 확인
8. 커밋·푸시 (main) → Vercel 자동 배포, IndexNow 자동 색인 요청. 배포 후 kokcolor.kr 에 새 그림 수가 보이는지 확인
