// ============================================================
//  Gemini 프록시 (Netlify Functions)
//
//  왜 이게 필요한가
//   - 브라우저 코드에 API 키를 넣으면, 소스 보기로 누구나 꺼내 쓸 수 있다.
//   - 그래서 키는 Netlify 환경변수(서버)에만 두고,
//     브라우저는 키 없이 이 함수에 요청만 보낸다.
//   - 키는 한 번도 사용자 화면에 내려가지 않는다.
//
//  배포 전 반드시
//   Netlify → Site settings → Environment variables 에
//   GEMINI_API_KEY 를 등록할 것. 없으면 500을 돌려준다.
// ============================================================

const MODEL = 'gemini-2.5-flash';
const ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_BODY = 6 * 1024 * 1024;   // 6MB — Netlify 일반 함수의 요청 한도

// Netlify 는 일반 함수를 30초에 강제 종료한다.
// 그보다 조금 일찍 우리가 끊어야 "AI 응답이 오래 걸립니다" 라는 제대로 된 안내를
// 돌려줄 수 있다. 30초를 넘기면 Netlify 가 먼저 죽여서 알 수 없는 오류가 뜬다.
const TIMEOUT_MS = 26 * 1000;

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { message: 'POST 요청만 받습니다.' } });
  }

  // 선택 잠금장치: ALLOWED_ORIGIN 을 등록해 두면 그 도메인에서 온 요청만 통과시킨다.
  // (등록하지 않으면 통과시킨다 — 배포가 막히지 않도록)
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed) {
    const origin = event.headers.origin || event.headers.Origin || '';
    const referer = event.headers.referer || event.headers.Referer || '';
    if (!origin.startsWith(allowed) && !referer.startsWith(allowed)) {
      return json(403, { error: { message: '허용되지 않은 출처입니다.' } });
    }
  }

  // ---- 승인된 로그인 사용자만 통과 ----
  // FIREBASE_WEB_API_KEY 를 등록해 두면 검사한다. (없으면 검사하지 않고 통과)
  // 확인 방법: 브라우저가 보낸 로그인 토큰을 구글에 물어보고,
  //            토큰 안에 approved 표시가 박혀 있는지 본다.
  //            승인 표시는 approve.js 로만 붙일 수 있어 사용자가 위조할 수 없다.
  const webKey = process.env.FIREBASE_WEB_API_KEY;
  if (webKey) {
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
        return json(403, {
          error: { message: '아직 승인되지 않은 계정입니다. 관리자 승인 후 이용할 수 있습니다.' },
        });
      }
    } catch (e) {
      console.error('[gemini] 로그인 확인 실패:', e.message);
      return json(503, { error: { message: '로그인 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.' } });
    }
  } else {
    console.warn('[gemini] FIREBASE_WEB_API_KEY 가 없어 로그인 검사를 건너뜁니다.');
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // 키 값 자체는 절대 로그에 찍지 않는다
    console.error('[gemini] GEMINI_API_KEY 환경변수가 없습니다.');
    return json(500, {
      error: { message: '서버에 AI 키가 설정되지 않았습니다. 관리자에게 문의하세요.' },
    });
  }

  const body = event.body || '';
  if (!body) return json(400, { error: { message: '요청 본문이 비어 있습니다.' } });
  if (body.length > MAX_BODY) {
    return json(413, { error: { message: '요청이 너무 큽니다. 이미지 크기를 줄여 주세요.' } });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    // 클라이언트가 보낸 본문을 그대로 전달한다.
    // (문제 생성·검증·채점·사진 분석이 모두 같은 형식이라 손댈 필요가 없다)
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: ctrl.signal,
    });

    const text = await res.text();

    // 429(요청 과다)·503(혼잡)은 앱이 직접 재시도하므로 상태 코드를 그대로 돌려준다.
    return {
      statusCode: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
      body: text,
    };
  } catch (e) {
    const aborted = e.name === 'AbortError';
    console.error('[gemini] 호출 실패:', aborted ? 'timeout' : e.message);
    return json(aborted ? 504 : 502, {
      error: {
        message: aborted
          ? 'AI 응답이 너무 오래 걸립니다. 잠시 후 다시 시도해 주세요.'
          : 'AI 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      },
    });
  } finally {
    clearTimeout(timer);
  }
};