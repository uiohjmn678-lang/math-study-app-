// ============================================================
//  Gemini 백그라운드 함수 (Netlify Background Functions)
//
//  왜 이게 필요한가
//   - 일반 함수는 30초에 강제로 끊긴다.
//     그런데 시험지 읽기는 40~70초가 걸린다. 그냥은 못 쓴다.
//   - 백그라운드 함수는 15분까지 돈다.
//     대신 "답을 돌려주지 않는다" — 호출하자마자 빈 202만 준다.
//   - 그래서 결과를 Firestore 에 적어 두고,
//     브라우저가 그 문서를 실시간으로 지켜보며 받아 간다.
//
//  얻는 것
//   - 70초짜리 작업이 끊기지 않는다.
//   - 폰 화면이 꺼져서 잠깐 연결이 끊겨도, 작업은 서버에서 계속 돌고
//     결과는 Firestore 에 남는다. 깨어나면 그대로 받아 간다.
//
//  파일 이름 끝의 "-background" 가 이 함수를 백그라운드로 만든다. 바꾸지 말 것.
//
//  배포 전 반드시
//   Netlify 환경변수에 아래 둘을 등록할 것.
//     GEMINI_API_KEY         구글에서 받은 Gemini 키
//     FIREBASE_WEB_API_KEY   AIzaSy... (auth.js 에 있는 공개용 키)
//   FIREBASE_WEB_API_KEY 가 없으면 누가 요청했는지 알 수 없어서
//   아무 일도 하지 않고 종료한다.
// ============================================================

const MODEL = 'gemini-2.5-flash';
const ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 작업 문서를 적을 곳. auth.js 의 firebaseConfig 와 같은 프로젝트여야 한다.
const FB_PROJECT  = process.env.FIREBASE_PROJECT_ID  || 'math-study-app-16f56';
const FB_DATABASE = process.env.FIREBASE_DATABASE_ID || 'math-study-app';

const MAX_BODY   = 8 * 1024 * 1024;    // 8MB — 성적표 사진 업로드
const MAX_RESULT = 900 * 1024;         // Firestore 문서 한도(1MiB)보다 안전하게
const TIMEOUT_MS = 10 * 60 * 1000;     // 10분 (백그라운드 한도 15분보다 여유)

// ---- Firestore REST 헬퍼 -------------------------------------
// 서비스 계정 키를 쓰지 않는다. 학생이 보낸 로그인 토큰으로 그 학생 자리에 적는다.
// 덕분에 Netlify 에 비밀 키를 더 넣지 않아도 되고, 보안 규칙도 그대로 적용된다.
const S = (v) => ({ stringValue: String(v) });
const T = () => ({ timestampValue: new Date().toISOString() });
const I = (n) => ({ integerValue: String(n) });

function docUrl(uid, jobId) {
  return `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}` +
         `/databases/${FB_DATABASE}/documents/users/${encodeURIComponent(uid)}` +
         `/jobs/${encodeURIComponent(jobId)}`;
}

// requireNew=true 면 "문서가 아직 없을 때만" 성공한다.
// Netlify 가 같은 작업을 두 번 던져도 Gemini 를 두 번 부르지 않게 막는 장치다.
async function writeJob(uid, jobId, idToken, fields, requireNew) {
  const mask = Object.keys(fields)
    .map((n) => `updateMask.fieldPaths=${encodeURIComponent(n)}`)
    .join('&');
  const qs = mask + (requireNew ? '&currentDocument.exists=false' : '');
  return fetch(`${docUrl(uid, jobId)}?${qs}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fields }),
  });
}

// ---- 본체 ---------------------------------------------------
exports.handler = async (event) => {
  // 백그라운드 함수는 반드시 성공(2xx)으로 끝내야 한다.
  // 에러를 돌려주면 Netlify 가 1분 뒤, 또 2분 뒤에 자동으로 다시 부른다.
  // 그러면 Gemini 를 세 번 부르게 되고 무료 할당량만 날아간다.
  // 그래서 모든 오류는 작업 문서에 적어서 브라우저에 알리고, 함수 자체는 200 으로 끝낸다.
  const done = () => ({ statusCode: 200, body: '' });

  let uid = '';
  let jobId = '';
  let idToken = '';

  try {
    const raw = event.body || '';
    if (!raw) { console.error('[bg] 본문이 비었습니다.'); return done(); }
    if (raw.length > MAX_BODY) { console.error('[bg] 본문이 너무 큽니다.'); return done(); }

    let incoming;
    try { incoming = JSON.parse(raw); }
    catch (_) { console.error('[bg] 본문이 JSON 이 아닙니다.'); return done(); }

    jobId = incoming.jobId || '';
    const payload = incoming.payload;
    if (!jobId || !payload) { console.error('[bg] jobId 또는 payload 가 없습니다.'); return done(); }

    // 1) 누가 보냈는지 확인한다 -------------------------------
    const authz = event.headers.authorization || event.headers.Authorization || '';
    idToken = authz.startsWith('Bearer ') ? authz.slice(7) : '';
    if (!idToken) {
      // 토큰이 없으면 작업 문서를 적을 권한도 없다. 알릴 방법이 없으니 조용히 끝낸다.
      console.error('[bg] 로그인 토큰이 없습니다.');
      return done();
    }

    const webKey = process.env.FIREBASE_WEB_API_KEY;
    if (!webKey) {
      console.error('[bg] FIREBASE_WEB_API_KEY 가 없습니다. 환경변수를 등록하세요.');
      return done();
    }

    const vr = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(webKey)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }) }
    );
    const vd = await vr.json().catch(() => ({}));
    const user = vd.users && vd.users[0];
    if (!vr.ok || !user || !user.localId) {
      console.error('[bg] 토큰 확인 실패:', vr.status);
      return done();
    }
    uid = user.localId;

    // 승인된 계정인지 확인. 승인 표시는 approve.js 로만 붙을 수 있다.
    let claims = {};
    try { claims = user.customAttributes ? JSON.parse(user.customAttributes) : {}; } catch (_) {}
    if (claims.approved !== true) {
      await writeJob(uid, jobId, idToken, {
        status: S('error'),
        error: S('아직 승인되지 않은 계정입니다. 관리자 승인 후 이용할 수 있습니다.'),
        httpStatus: I(403),
        updatedAt: T(),
      }, true);
      return done();
    }

    // 2) 중복 실행 막기 ---------------------------------------
    const first = await writeJob(uid, jobId, idToken, {
      status: S('running'),
      startedAt: T(),
      updatedAt: T(),
    }, true);

    if (!first.ok) {
      // "문서가 이미 있다"는 거절은 중복 호출이라는 뜻이다.
      // Firestore 는 이걸 400 FAILED_PRECONDITION 으로 주기도 하고 409 ALREADY_EXISTS 로 주기도 해서
      // 숫자만 보면 놓친다. 본문의 status 문자열까지 같이 본다.
      const detail = await first.text().catch(() => '');
      let kind = '';
      try { kind = (JSON.parse(detail).error || {}).status || ''; } catch (_) {}
      const duplicate =
        first.status === 409 || first.status === 412 ||
        kind === 'ALREADY_EXISTS' || kind === 'FAILED_PRECONDITION';

      if (duplicate) {
        console.log('[bg] 이미 처리 중인 작업이라 건너뜁니다:', jobId);
        return done();
      }
      // 여기로 오면 결과를 적을 수가 없다 = 브라우저에 알릴 방법도 없다.
      // 로그에 원인을 남겨야 한다. (보안 규칙 문제가 대부분이다)
      console.error('[bg] 작업 문서 생성 실패:', first.status, detail.slice(0, 500));
      return done();
    }

    // 3) Gemini 호출 ------------------------------------------
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.error('[bg] GEMINI_API_KEY 환경변수가 없습니다.');
      await writeJob(uid, jobId, idToken, {
        status: S('error'),
        error: S('서버에 AI 키가 설정되지 않았습니다. 관리자에게 문의하세요.'),
        httpStatus: I(500),
        updatedAt: T(),
      }, false);
      return done();
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res, text;
    try {
      res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      text = await res.text();
    } finally {
      clearTimeout(timer);
    }

    // 4) 결과를 작업 문서에 적는다 ----------------------------
    if (!res.ok) {
      // 429(요청 과다)·503(혼잡)은 상태 코드를 그대로 넘긴다.
      // 브라우저가 그걸 보고 알아서 다시 시도한다.
      let msg = `AI 호출 실패 (${res.status})`;
      try {
        const j = JSON.parse(text);
        if (j.error && j.error.message) msg = j.error.message;
      } catch (_) {}
      console.error('[bg] Gemini 오류:', res.status);
      await writeJob(uid, jobId, idToken, {
        status: S('error'), error: S(msg), httpStatus: I(res.status), updatedAt: T(),
      }, false);
      return done();
    }

    if (text.length > MAX_RESULT) {
      console.error('[bg] 결과가 너무 큽니다:', text.length);
      await writeJob(uid, jobId, idToken, {
        status: S('error'),
        error: S('AI 응답이 너무 길어 저장할 수 없습니다. 문제 수를 줄여 다시 시도해 주세요.'),
        httpStatus: I(413),
        updatedAt: T(),
      }, false);
      return done();
    }

    await writeJob(uid, jobId, idToken, {
      status: S('done'), result: S(text), httpStatus: I(200), updatedAt: T(),
    }, false);

    console.log('[bg] 완료:', jobId, `${text.length}바이트`);
    return done();

  } catch (e) {
    const aborted = e.name === 'AbortError';
    console.error('[bg] 실패:', aborted ? 'timeout' : e.message);
    // 여기까지 왔으면 uid·jobId 를 알 수도 있다. 알면 브라우저에 알려 준다.
    if (uid && jobId && idToken) {
      try {
        await writeJob(uid, jobId, idToken, {
          status: S('error'),
          error: S(aborted
            ? 'AI 응답이 너무 오래 걸려 중단했습니다. 잠시 후 다시 시도해 주세요.'
            : 'AI 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
          httpStatus: I(aborted ? 504 : 502),
          updatedAt: T(),
        }, false);
      } catch (_) {}
    }
    return done();
  }
};
