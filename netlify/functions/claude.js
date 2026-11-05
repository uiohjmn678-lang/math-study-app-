// ============================================================
//  클로드 프록시 (Netlify Functions) — 제미나이가 막혔을 때 쓰는 두 번째 AI
//
//  왜 이게 필요한가
//   - 오후 8시처럼 사람이 몰리는 시간에 구글 서버가 503(혼잡)을 돌려준다.
//     이건 우리 할당량 문제가 아니라 구글이 전 세계와 나눠 쓰는 용량 문제라,
//     요금제를 올려도 해결되지 않는다. 기다리는 수밖에 없었다.
//   - 그래서 회사가 다른 AI 를 하나 더 둔다. 구글이 막히면 이쪽으로 넘어간다.
//     두 회사가 같은 시각에 동시에 막힐 일은 드물다.
//
//  어떻게 끼워 넣었나
//   - 앱 코드는 전부 제미나이 형식으로 말한다. 그걸 고치려면 수십 곳을 건드려야 한다.
//     그래서 이 함수가 "통역"을 한다.
//       받을 때 : 제미나이 형식 요청  →  앤트로픽 형식으로 바꿔 보냄
//       줄 때   : 앤트로픽 형식 응답  →  제미나이 형식으로 바꿔 돌려줌
//     앱 입장에서는 제미나이가 답한 것과 똑같이 보인다. 그래서 앱은 한 곳만 고쳤다.
//
//  ★ 보안 — 이 부분을 지우지 말 것
//   이 주소는 돈이 나가는 키를 쥐고 있다. gemini.js 와 똑같이
//   "로그인 + 관리자 승인" 을 받은 사람만 통과시킨다.
//   검사에 필요한 환경변수가 없으면 통과가 아니라 차단이다.
//
//  배포 전 반드시
//   Netlify → Site settings → Environment variables 에 등록할 것
//     ANTHROPIC_API_KEY      sk-ant-... (앤트로픽 콘솔에서 발급)
//     FIREBASE_WEB_API_KEY   AIzaSy... (gemini.js 가 쓰는 것과 같은 값)
//   ※ ANTHROPIC_API_KEY 를 등록하지 않아도 앱은 고장나지 않는다.
//     이 함수가 "못 쓴다"고 답하고, 앱은 예전처럼 제미나이만 쓴다.
// ============================================================

const MODEL    = 'claude-haiku-5-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const API_VER  = '2023-06-01';

const MAX_BODY   = 6 * 1024 * 1024;   // 6MB — Netlify 일반 함수의 요청 한도
const TIMEOUT_MS = 26 * 1000;         // Netlify 가 30초에 끊기 전에 우리가 먼저 끊는다
const MAX_OUT    = 8000;              // 돌려받을 글의 최대 길이
const MIN_OUT    = 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(obj),
  };
}

// ---- 통역 1: 제미나이 요청 → 앤트로픽 요청 ----------------------
// 제미나이 : { contents:[{parts:[{text}, {inline_data:{mime_type,data}}]}],
//              generationConfig:{ maxOutputTokens } }
// 앤트로픽 : { model, max_tokens, messages:[{role:'user', content:[...]}] }
function toAnthropic(g) {
  const content = [];

  for (const c of (g.contents || [])) {
    for (const p of (c.parts || [])) {
      if (!p) continue;

      if (typeof p.text === 'string' && p.text) {
        content.push({ type: 'text', text: p.text });
        continue;
      }

      // 제미나이는 inline_data 와 inlineData 두 이름을 다 쓴다. 둘 다 받는다.
      const inl = p.inline_data || p.inlineData;
      if (inl && inl.data) {
        const mime = inl.mime_type || inl.mimeType || '';
        if (mime === 'application/pdf') {
          content.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: inl.data },
          });
        } else if (/^image\/(jpeg|png|gif|webp)$/.test(mime)) {
          content.push({
            type: 'image',
            source: { type: 'base64', media_type: mime, data: inl.data },
          });
        } else {
          // 못 다루는 형식은 조용히 빼면 "왜 사진을 안 보냐"가 된다. 글로 알려준다.
          content.push({ type: 'text', text: `(첨부 파일 형식 ${mime || '알 수 없음'} 은 이 AI 가 읽지 못합니다)` });
        }
      }
    }
  }

  if (content.length === 0) return null;   // 보낼 내용이 없다

  // 제미나이의 maxOutputTokens 에는 "생각하는 토큰"이 같이 들어 있다.
  // 클로드는 생각 몫을 따로 두지 않으므로 그대로 쓰면 지나치게 크다. 잘라서 쓴다.
  const want = Number((g.generationConfig || {}).maxOutputTokens) || 4000;
  const max_tokens = Math.max(MIN_OUT, Math.min(MAX_OUT, Math.round(want)));

  // temperature 는 보내지 않는다. 최신 모델은 기본값 외를 거부한다.
  return { model: MODEL, max_tokens, messages: [{ role: 'user', content }] };
}

// ---- 통역 2: 앤트로픽 응답 → 제미나이 응답 ----------------------
// 앱의 callGemini 는 candidates[0].content.parts[*].text 를 읽는다.
// 그 모양 그대로 만들어 주면 앱은 손댈 필요가 없다.
function toGemini(data) {
  const text = (data.content || [])
    .filter(b => b && b.type === 'text' && typeof b.text === 'string')
    .map(b => b.text)
    .join('');

  return {
    candidates: [{
      content: { parts: [{ text }] },
      // 길이에 걸려 잘렸으면 앱이 알아보도록 제미나이와 같은 말로 바꿔 준다
      finishReason: data.stop_reason === 'max_tokens' ? 'MAX_TOKENS' : 'STOP',
    }],
  };
}

// ---- 본체 -----------------------------------------------------
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { message: 'POST 요청만 받습니다.' } });
  }

  // 선택 잠금장치: ALLOWED_ORIGIN 을 등록해 두면 그 도메인에서 온 요청만 통과시킨다.
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed) {
    const origin  = event.headers.origin  || event.headers.Origin  || '';
    const referer = event.headers.referer || event.headers.Referer || '';
    if (!origin.startsWith(allowed) && !referer.startsWith(allowed)) {
      return json(403, { error: { message: '허용되지 않은 출처입니다.' } });
    }
  }

  // ---- 승인된 로그인 사용자만 통과 (gemini.js 와 같은 검사) ----
  // ★ 검사에 필요한 것이 없으면 "통과"가 아니라 "차단"이다.
  const webKey = process.env.FIREBASE_WEB_API_KEY;
  if (!webKey) {
    console.error('[claude] FIREBASE_WEB_API_KEY 가 없어 요청을 차단했습니다. ' +
      'Netlify 대시보드의 Environment variables 에 등록하세요 (netlify.toml 은 함수에 전달되지 않습니다).');
    return json(503, { error: { message: '서버 설정이 끝나지 않았습니다. 관리자에게 문의하세요.' } });
  }

  {
    const authz = event.headers.authorization || event.headers.Authorization || '';
    const idToken = authz.startsWith('Bearer ') ? authz.slice(7) : '';
    if (!idToken) {
      return json(401, { error: { message: '로그인이 필요합니다. 다시 로그인해 주세요.' } });
    }
    try {
      const vr = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(webKey)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }) }
      );
      const vd = await vr.json();
      const user = vd.users && vd.users[0];
      if (!vr.ok || !user) {
        return json(401, { error: { message: '로그인이 만료되었습니다. 다시 로그인해 주세요.' } });
      }
      let claims = {};
      try { claims = user.customAttributes ? JSON.parse(user.customAttributes) : {}; } catch (_) {}
      if (claims.approved !== true) {
        return json(403, { error: { message: '아직 승인되지 않은 계정입니다. 관리자 승인 후 이용할 수 있습니다.' } });
      }
    } catch (e) {
      console.error('[claude] 로그인 확인 실패:', e.message);
      return json(503, { error: { message: '로그인 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.' } });
    }
  }

  // ---- 키 ----
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // 아직 키를 등록하지 않은 상태. 앱은 이 답을 보고 그냥 제미나이만 쓴다.
    // 키 값 자체는 절대 로그에 찍지 않는다.
    console.warn('[claude] ANTHROPIC_API_KEY 가 없어 예비 AI 를 쓸 수 없습니다.');
    return json(503, { error: { message: '예비 AI 가 설정되지 않았습니다.' } });
  }

  // ---- 본문 ----
  const raw = event.body || '';
  if (!raw) return json(400, { error: { message: '요청 본문이 비어 있습니다.' } });
  if (raw.length > MAX_BODY) {
    return json(413, { error: { message: '요청이 너무 큽니다. 이미지 크기를 줄여 주세요.' } });
  }

  let gBody;
  try { gBody = JSON.parse(raw); }
  catch (_) { return json(400, { error: { message: '요청 본문이 JSON 이 아닙니다.' } }); }

  const aBody = toAnthropic(gBody);
  if (!aBody) return json(400, { error: { message: '보낼 내용이 없습니다.' } });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': API_VER,
        'X-Api-Key': key,
      },
      body: JSON.stringify(aBody),
      signal: ctrl.signal,
    });

    const text = await res.text();

    if (!res.ok) {
      let msg = `예비 AI 호출 실패 (${res.status})`;
      try {
        const j = JSON.parse(text);
        if (j.error && j.error.message) msg = j.error.message;
      } catch (_) {}
      // 잔액 부족은 기다려도 안 풀린다. 로그에 분명히 남겨야 원인을 찾는다.
      if (/credit|balance|insufficient/i.test(text)) {
        console.error('[claude] 잔액 부족으로 거절되었습니다. 앤트로픽 콘솔에서 충전하세요.');
      } else {
        console.error('[claude] 오류:', res.status);
      }
      // 429·529 등은 숫자를 그대로 넘긴다. 앱이 보고 판단한다.
      return json(res.status, { error: { message: msg } });
    }

    let data;
    try { data = JSON.parse(text); }
    catch (_) { return json(502, { error: { message: '예비 AI 응답을 읽지 못했습니다.' } }); }

    const out = toGemini(data);
    const len = out.candidates[0].content.parts[0].text.length;
    if (len === 0) {
      console.error('[claude] 글이 비어 있습니다. stop_reason =', data.stop_reason);
      return json(502, { error: { message: '예비 AI 가 빈 답을 돌려주었습니다.' } });
    }

    console.log('[claude] 완료:', `${len}자`, data.stop_reason || '');
    return json(200, out);

  } catch (e) {
    const aborted = e.name === 'AbortError';
    console.error('[claude] 호출 실패:', aborted ? 'timeout' : e.message);
    return json(aborted ? 504 : 502, {
      error: {
        message: aborted
          ? '예비 AI 응답이 너무 오래 걸립니다.'
          : '예비 AI 서버에 연결하지 못했습니다.',
      },
    });
  } finally {
    clearTimeout(timer);
  }
};
