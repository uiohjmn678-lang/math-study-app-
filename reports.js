// ============================================================
//  수능완성 - 문제 신고 모아 보기
//
//  학생이 앱에서 "🚩 이 문제 이상해요" 를 누르면
//  users/{uid}/reports/{자동ID} 에 쌓인다. 그걸 한눈에 모아 본다.
//
//  왜 필요한가
//    문제를 AI가 만들고 AI가 검증한다. 두 검증기가 같은 착각을 하면
//    불량이 통과한다 — 그 잔여 오류는 "사람이 걸러낸 수"로만 잴 수 있다.
//    이 명령이 그 숫자를 뽑는다.
//
//  [실행]
//    node reports.js            최근 신고 보기
//    node reports.js --all      전부 보기
//    node reports.js --count    사유별·단원별 집계만
//
//  ※ serviceAccountKey.json 이 같은 폴더에 있어야 한다.
// ============================================================

const fs = require('fs');
const path = require('path');

const DB_NAME = 'math-study-app';   // 기본 데이터베이스가 아니라 이름 붙은 DB를 쓴다

// firebase-admin 은 버전마다 쓰는 법이 다르다. 양쪽 다 받아 준다.
function loadAdmin() {
  try {
    const a = require('firebase-admin/app');
    const f = require('firebase-admin/firestore');
    if (a.initializeApp && a.cert && f.getFirestore) {
      return {
        initializeApp: a.initializeApp,
        cert: a.cert,
        getDb: (app) => f.getFirestore(app, DB_NAME),
        getAuth: () => require('firebase-admin/auth').getAuth(),
        mode: '새 방식',
      };
    }
  } catch (_) {}

  try {
    const admin = require('firebase-admin');
    if (admin && admin.credential && admin.credential.cert) {
      return {
        initializeApp: (o) => admin.initializeApp(o),
        cert: (sa) => admin.credential.cert(sa),
        getDb: (app) => {
          const d = admin.firestore(app);
          if (typeof d.settings === 'function') {
            try { d.settings({ databaseId: DB_NAME }); } catch (_) {}
          }
          return d;
        },
        getAuth: () => admin.auth(),
        mode: '옛 방식',
      };
    }
  } catch (_) {}

  console.error('\n[중단] firebase-admin 을 불러오지 못했습니다.');
  console.error('    npm install firebase-admin\n');
  process.exit(1);
}
const FB = loadAdmin();

// ---- 서비스 계정 키 ----
const KEY_FILE = path.resolve(process.cwd(), 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8').replace(/^﻿/, ''));
} catch (e) {
  console.error('\n[중단] serviceAccountKey.json 을 읽지 못했습니다.');
  console.error('  찾은 위치 : ' + KEY_FILE);
  console.error('  원인      : ' + e.message + '\n');
  process.exit(1);
}
if (!serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('\n[중단] 이 파일은 서비스 계정 키가 아닙니다.');
  console.error('  실제 항목 : ' + Object.keys(serviceAccount).join(', ') + '\n');
  process.exit(1);
}

let app, db;
try {
  app = FB.initializeApp({ credential: FB.cert(serviceAccount) });
  db = FB.getDb(app);
} catch (e) {
  console.error('\n[중단] Firebase 연결에 실패했습니다.');
  console.error('  방식 : ' + FB.mode);
  console.error('  원인 : ' + e.message + '\n');
  process.exit(1);
}

const when = (t) => {
  try {
    const d = t && typeof t.toDate === 'function' ? t.toDate() : (t ? new Date(t) : null);
    return d ? d.toLocaleString('ko-KR') : '-';
  } catch (_) { return '-'; }
};
const short = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
};

// 신고를 전부 긁어온다.
// collectionGroup 이 색인 때문에 막히는 환경이 있어서, 실패하면 사용자별로 돈다.
async function fetchReports() {
  const out = [];
  try {
    const snap = await db.collectionGroup('reports').get();
    snap.forEach((d) => {
      const uid = d.ref.path.split('/')[1];
      out.push({ uid, id: d.id, ...d.data() });
    });
    return out;
  } catch (e) {
    console.log('  (collectionGroup 실패 → 사용자별로 조회합니다: ' + e.message + ')');
  }

  const auth = FB.getAuth();
  let token;
  do {
    const page = await auth.listUsers(1000, token);
    for (const u of page.users) {
      const snap = await db.collection('users').doc(u.uid).collection('reports').get();
      snap.forEach((d) => out.push({ uid: u.uid, email: u.email, id: d.id, ...d.data() }));
    }
    token = page.pageToken;
  } while (token);
  return out;
}

// 이메일을 붙여 준다 (누가 신고했는지 보려고)
async function withEmails(rows) {
  const need = [...new Set(rows.filter((r) => !r.email).map((r) => r.uid))];
  if (need.length === 0) return rows;
  const auth = FB.getAuth();
  const map = {};
  for (const uid of need) {
    try { map[uid] = (await auth.getUser(uid)).email; } catch (_) { map[uid] = uid.slice(0, 8); }
  }
  return rows.map((r) => ({ ...r, email: r.email || map[r.uid] }));
}

function printCounts(rows) {
  const byReason = {};
  const byType = {};
  rows.forEach((r) => {
    byReason[r.reason || '(없음)'] = (byReason[r.reason || '(없음)'] || 0) + 1;
    const t = r.type || '(단원 없음)';
    byType[t] = (byType[t] || 0) + 1;
  });

  console.log('\n사유별');
  Object.entries(byReason).sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}건   ${k}`));

  console.log('\n단원별');
  Object.entries(byType).sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}건   ${k}`));
}

(async () => {
  const arg = process.argv[2] || '';
  if (arg === '--help' || arg === '-h') {
    console.log(`
수능완성 문제 신고 모아 보기

  node reports.js           최근 20건 보기
  node reports.js --all     전부 보기
  node reports.js --count   집계만 보기
`);
    return;
  }

  console.log('\n신고를 불러오는 중...');
  let rows = await fetchReports();
  if (rows.length === 0) {
    console.log('\n아직 신고가 없습니다.\n');
    return;
  }
  rows = await withEmails(rows);
  rows.sort((a, b) => {
    const ta = a.at && a.at.toDate ? a.at.toDate().getTime() : 0;
    const tb = b.at && b.at.toDate ? b.at.toDate().getTime() : 0;
    return tb - ta;
  });

  console.log(`\n총 ${rows.length}건`);

  if (arg !== '--count') {
    const show = arg === '--all' ? rows : rows.slice(0, 20);
    console.log(arg === '--all' ? '' : `\n최근 ${show.length}건\n`);
    show.forEach((r, i) => {
      console.log(`${String(i + 1).padStart(3)}. [${r.reason || '사유없음'}]  ${r.email || r.uid}`);
      console.log(`     시각 : ${when(r.at)}`);
      if (r.type)   console.log(`     단원 : ${r.type}${r.level ? ' / ' + r.level + '점' : ''}  (${r.source || '-'})`);
      if (r.answer) console.log(`     정답 : ${short(r.answer, 60)}${r.studentAnswer ? '   학생답: ' + short(r.studentAnswer, 40) : ''}`);
      if (r.memo)   console.log(`     메모 : ${short(r.memo, 200)}`);
      if (r.problem) console.log(`     문제 : ${short(r.problem, 160)}`);
      console.log('');
    });
    if (arg !== '--all' && rows.length > show.length) {
      console.log(`  ... 외 ${rows.length - show.length}건.  node reports.js --all  로 전부 보기`);
    }
  }

  printCounts(rows);
  console.log('');
})().then(() => process.exit(0))
  .catch((e) => { console.error('\n[오류]', e.message, '\n'); process.exit(1); });
