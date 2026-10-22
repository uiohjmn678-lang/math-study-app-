// ============================================================
//  수능완성 - 가입 승인 관리
//
//  가입은 누구나 할 수 있지만, 승인을 받아야 앱을 쓸 수 있다.
//  승인 표시는 Firebase 로그인 토큰 안에 박아 둔다(커스텀 클레임).
//  그래서 사용자가 자기 승인 상태를 직접 바꿀 수 없고,
//  서버 함수도 토큰만 보고 바로 판단할 수 있다.
//
//  [실행]
//    node approve.js --list              승인 대기 중인 사람 보기
//    node approve.js --all               전체 명단 보기
//    node approve.js hong@test.com       승인하기
//    node approve.js --revoke hong@test.com   승인 취소
//
//  ※ serviceAccountKey.json 이 같은 폴더에 있어야 한다.
// ============================================================

const fs = require('fs');
const path = require('path');

// firebase-admin 은 버전마다 쓰는 법이 다르다.
//   새 방식(v10 이상) : require('firebase-admin/app') 에서 꺼내 쓴다
//   옛 방식           : require('firebase-admin') 하나로 다 쓴다
// 어느 쪽이 깔려 있든 돌아가도록 둘 다 받아 준다.
function loadAdmin() {
  try {
    const a = require('firebase-admin/app');
    const b = require('firebase-admin/auth');
    if (a.initializeApp && a.cert && b.getAuth) {
      return { initializeApp: a.initializeApp, cert: a.cert, getAuth: b.getAuth, mode: '새 방식' };
    }
  } catch (_) { /* 옛 방식으로 넘어간다 */ }

  try {
    const admin = require('firebase-admin');
    if (admin && admin.credential && admin.credential.cert) {
      return {
        initializeApp: (o) => admin.initializeApp(o),
        cert: (sa) => admin.credential.cert(sa),
        getAuth: (app) => admin.auth(app),
        mode: '옛 방식',
      };
    }
  } catch (_) { /* 아래에서 안내한다 */ }

  console.error('\n[중단] firebase-admin 을 불러오지 못했습니다.');
  console.error('  설치가 덜 됐을 수 있습니다. 아래를 다시 실행해 보세요.\n');
  console.error('    npm install firebase-admin\n');
  process.exit(1);
}
const FB = loadAdmin();

const SERVICE_ACCOUNT_FILE = path.resolve(process.cwd(), 'serviceAccountKey.json');

// 1단계 — 파일을 읽는다
let raw;
try {
  raw = fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8').replace(/^﻿/, '');
} catch (e) {
  console.error('\n[중단] serviceAccountKey.json 파일을 찾지 못했습니다.');
  console.error('  찾은 위치 : ' + SERVICE_ACCOUNT_FILE);
  console.error('  원인      : ' + e.message);
  console.error('\n  이 스크립트와 같은 폴더에 있어야 합니다.\n');
  process.exit(1);
}

// 2단계 — JSON 으로 해석한다
let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error('\n[중단] serviceAccountKey.json 의 내용이 깨져 있습니다.');
  console.error('  원인 : ' + e.message);
  console.error('\n  파일을 다시 내려받아 보세요.\n');
  process.exit(1);
}

// 3단계 — 진짜 서비스 계정 키가 맞는지 본다
if (!serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('\n[중단] 이 파일은 서비스 계정 키가 아닙니다.');
  console.error('  있어야 할 항목 : private_key, client_email');
  console.error('  실제 항목      : ' + Object.keys(serviceAccount).join(', '));
  console.error('\n  Firebase 콘솔 → 프로젝트 설정(톱니) → 서비스 계정 탭');
  console.error('  → 새 비공개 키 생성  으로 받은 파일이어야 합니다.');
  console.error('  (앱 설정 쪽의 google-services.json 은 다른 파일입니다)\n');
  process.exit(1);
}

// 4단계 — Firebase 에 연결한다
let app;
try {
  app = FB.initializeApp({ credential: FB.cert(serviceAccount) });
} catch (e) {
  console.error('\n[중단] Firebase 연결에 실패했습니다.');
  console.error('  프로젝트 : ' + (serviceAccount.project_id || '?'));
  console.error('  방식     : ' + FB.mode);
  console.error('  원인     : ' + e.message + '\n');
  process.exit(1);
}
const auth = FB.getAuth(app);

const isApproved = (u) => u.customClaims && u.customClaims.approved === true;
const when = (s) => (s ? new Date(s).toLocaleString('ko-KR') : '-');

async function allUsers() {
  const out = [];
  let token;
  do {
    const page = await auth.listUsers(1000, token);
    out.push(...page.users);
    token = page.pageToken;
  } while (token);
  return out;
}

function printRow(u) {
  const mark = isApproved(u) ? '승인됨  ' : '대기 중 ';
  const name = (u.displayName || '이름없음').padEnd(10, ' ');
  console.log(`  ${mark} ${name} ${u.email}`);
  console.log(`           가입 ${when(u.metadata.creationTime)}`);
}

async function list(onlyPending) {
  const users = await allUsers();
  const target = onlyPending ? users.filter((u) => !isApproved(u)) : users;

  if (target.length === 0) {
    console.log(onlyPending ? '\n승인 대기 중인 사람이 없습니다.\n' : '\n가입자가 없습니다.\n');
    return;
  }
  console.log(`\n${onlyPending ? '승인 대기' : '전체 명단'} — ${target.length}명\n`);
  target.sort((a, b) => new Date(a.metadata.creationTime) - new Date(b.metadata.creationTime));
  target.forEach(printRow);

  const pending = users.filter((u) => !isApproved(u)).length;
  console.log(`\n  전체 ${users.length}명 · 승인됨 ${users.length - pending}명 · 대기 ${pending}명`);
  if (onlyPending && target.length > 0) {
    console.log(`\n  승인하려면:  node approve.js ${target[0].email}\n`);
  } else {
    console.log('');
  }
}

async function setApproved(email, value) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (e) {
    console.error(`\n[실패] ${email} 로 가입한 사람이 없습니다.`);
    console.error('  오타가 없는지 확인하거나  node approve.js --list  로 명단을 보세요.\n');
    process.exit(1);
  }

  if (isApproved(user) === value) {
    console.log(`\n이미 ${value ? '승인된' : '승인 취소된'} 계정입니다 — ${user.displayName || ''} ${email}\n`);
    return;
  }

  // 기존 클레임을 유지한 채 approved 만 바꾼다
  const claims = { ...(user.customClaims || {}), approved: value };
  if (!value) delete claims.approved;
  await auth.setCustomUserClaims(user.uid, claims);

  console.log(`\n${value ? '승인했습니다' : '승인을 취소했습니다'} — ${user.displayName || '이름없음'} (${email})`);
  if (value) {
    console.log('  본인이 로그아웃했다가 다시 로그인하면 바로 쓸 수 있습니다.');
    console.log('  (앱이 알아서 확인하므로 새로고침만 해도 되는 경우가 많습니다)\n');
  } else {
    console.log('  다음 로그인부터 막힙니다.\n');
  }
}

(async () => {
  const arg = process.argv[2];
  const arg2 = process.argv[3];

  if (!arg || arg === '--help' || arg === '-h') {
    console.log(`
수능완성 가입 승인 관리

  node approve.js --list                   승인 대기 중인 사람 보기
  node approve.js --all                    전체 명단 보기
  node approve.js hong@test.com            승인하기
  node approve.js --revoke hong@test.com   승인 취소
`);
    return;
  }

  if (arg === '--list') return list(true);
  if (arg === '--all') return list(false);
  if (arg === '--revoke') {
    if (!arg2) { console.error('\n취소할 이메일을 적어주세요.  node approve.js --revoke hong@test.com\n'); process.exit(1); }
    return setApproved(arg2, false);
  }
  if (!arg.includes('@')) {
    console.error(`\n"${arg}" 는 이메일이 아닙니다.  node approve.js --help  로 사용법을 보세요.\n`);
    process.exit(1);
  }
  return setApproved(arg, true);
})().then(() => process.exit(0))
  .catch((e) => { console.error('\n[오류]', e.message, '\n'); process.exit(1); });