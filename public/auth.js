import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ===== Firebase 설정 - YOUR_ 부분을 본인 값으로 교체! =====
const firebaseConfig = {
  apiKey: "AIzaSyCf-4hUar_Ub7ukMkaHxFlvHyvnjulK5_g",
  authDomain: "math-study-app-16f56.firebaseapp.com",
  projectId: "math-study-app-16f56",
  storageBucket: "math-study-app-16f56.firebasestorage.app",
  messagingSenderId: "68548072606",
  appId: "1:68548072606:web:36089e92e366174d06178f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===== 현재 페이지 확인 =====
const isAuthPage = window.location.pathname.includes('auth.html');

// ===== 승인 확인 =====
// 가입은 누구나 할 수 있지만, 관리자가 승인해야 앱을 쓸 수 있다.
// 승인 표시는 로그인 토큰 안에 박혀 있다(커스텀 클레임).
// approve.js 로만 붙일 수 있어서 사용자가 위조할 수 없다.
async function isApproved(user, forceRefresh) {
  try {
    // forceRefresh=true 로 받아야 방금 승인된 것이 바로 반영된다
    const r = await user.getIdTokenResult(!!forceRefresh);
    return r.claims && r.claims.approved === true;
  } catch (e) {
    console.warn('승인 상태를 확인하지 못했습니다:', e.message);
    return false;
  }
}

// 승인 대기 화면 (auth.html 을 고치지 않아도 되도록 코드로 띄운다)
function showPending(user) {
  if (document.getElementById('pendingOverlay')) return;
  const name = user.displayName || '';
  const box = document.createElement('div');
  box.id = 'pendingOverlay';
  box.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(245,248,255,0.97);backdrop-filter:blur(6px);padding:24px;' +
    "font-family:'Pretendard',system-ui,sans-serif;";
  box.innerHTML = `
    <div style="max-width:420px;width:100%;background:#fff;border:1px solid #e3e6ea;border-radius:18px;
                padding:32px 28px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
      <div style="font-size:2.6rem;line-height:1;margin-bottom:14px;">🕒</div>
      <div style="font-size:1.25rem;font-weight:800;color:#1b2234;margin-bottom:10px;">
        승인 대기 중이에요
      </div>
      <div style="font-size:0.95rem;line-height:1.65;color:#5a6477;margin-bottom:22px;">
        ${name ? name + '님, ' : ''}가입 신청이 접수됐어요.<br>
        관리자가 승인하면 바로 이용할 수 있어요.
      </div>
      <div style="font-size:0.82rem;color:#8a92a6;background:#f6f8fc;border-radius:10px;
                  padding:10px 12px;margin-bottom:20px;word-break:break-all;">
        ${user.email || ''}
      </div>
      <button id="pendingRecheck" style="width:100%;padding:12px;border:none;border-radius:12px;
              background:#4A90E2;color:#fff;font-size:0.95rem;font-weight:700;cursor:pointer;
              font-family:inherit;margin-bottom:8px;">승인됐는지 다시 확인</button>
      <button id="pendingLogout" style="width:100%;padding:12px;border:1px solid #e3e6ea;
              border-radius:12px;background:#fff;color:#5a6477;font-size:0.9rem;font-weight:600;
              cursor:pointer;font-family:inherit;">로그아웃</button>
      <div id="pendingMsg" style="font-size:0.82rem;color:#d14343;margin-top:12px;min-height:18px;"></div>
    </div>`;
  document.body.appendChild(box);

  document.getElementById('pendingRecheck').onclick = async (e) => {
    const btn = e.currentTarget;
    const msg = document.getElementById('pendingMsg');
    btn.textContent = '확인 중...'; btn.disabled = true; msg.textContent = '';
    const ok = await isApproved(user, true);
    if (ok) { window.location.href = 'index.html'; return; }
    msg.textContent = '아직 승인되지 않았어요.';
    btn.textContent = '승인됐는지 다시 확인'; btn.disabled = false;
  };
  document.getElementById('pendingLogout').onclick = () => signOut(auth).then(() => location.reload());
}

// ===== 로그인 상태 감지 =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (!isAuthPage) window.location.href = 'auth.html';
    return;
  }
  const ok = await isApproved(user, true);
  if (ok) {
    if (isAuthPage) window.location.href = 'index.html';
    return;
  }
  // 승인 전: 앱으로 못 들어가고 대기 화면만 본다
  if (!isAuthPage) { window.location.href = 'auth.html'; return; }
  showPending(user);
});

// ===== 로그아웃 (index.html에서 사용) =====
window.doLogout = async function() {
  try {
    // API 키만 제거, 성적/커리큘럼 데이터는 보존
    localStorage.removeItem('gemini_api_key');
    await signOut(auth);
    window.location.href = 'auth.html';
  } catch (e) {
    alert('로그아웃 실패: ' + e.message);
  }
}

// ===== 아래는 auth.html에서만 사용 =====
if (isAuthPage) {

  window.showForm = function(formId) {
    document.querySelectorAll('.form-box').forEach(f => f.classList.remove('active'));
    document.getElementById(formId).classList.add('active');
    document.querySelectorAll('.error-msg, .success-msg').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
  }

  function getErrorMsg(code) {
    const msgs = {
      'auth/invalid-email': '올바른 이메일 형식이 아니에요.',
      'auth/user-not-found': '등록되지 않은 이메일이에요.',
      'auth/wrong-password': '비밀번호가 틀렸어요.',
      'auth/email-already-in-use': '이미 사용 중인 이메일이에요.',
      'auth/weak-password': '비밀번호는 6자리 이상이어야 해요.',
      'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
      'auth/invalid-credential': '가입된 계정이 없거나 비밀번호가 틀렸어요.\n회원가입을 먼저 해주세요!',
    };
    return msgs[code] || '오류가 발생했어요. 다시 시도해주세요.';
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }
  function showSuccess(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }
  function hideMsg(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  window.doLogin = async function() {
    const email = document.getElementById('login-email').value.trim();
    const pw = document.getElementById('login-pw').value;
    const btn = document.getElementById('login-btn');
    hideMsg('login-error');
    if (!email || !pw) { showError('login-error', '이메일과 비밀번호를 입력해주세요.'); return; }
    btn.textContent = '로그인 중...'; btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch (e) {
      showError('login-error', getErrorMsg(e.code));
      btn.textContent = '로그인'; btn.disabled = false;
    }
  }

  window.doSignup = async function() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pw = document.getElementById('signup-pw').value;
    const pw2 = document.getElementById('signup-pw2').value;
    const btn = document.getElementById('signup-btn');
    hideMsg('signup-error'); hideMsg('signup-success');
    if (!name || !email || !pw || !pw2) { showError('signup-error', '모든 항목을 입력해주세요.'); return; }
    if (pw !== pw2) { showError('signup-error', '비밀번호가 일치하지 않아요.'); return; }
    if (pw.length < 6) { showError('signup-error', '비밀번호는 6자리 이상이어야 해요.'); return; }
    btn.textContent = '가입 중...'; btn.disabled = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
      await updateProfile(userCredential.user, { displayName: name });
      // 가입은 됐지만 아직 승인 전이다. onAuthStateChanged 가 대기 화면을 띄운다.
      showSuccess('signup-success', `${name}님, 가입 신청이 접수됐어요. 승인을 기다려 주세요.`);
    } catch (e) {
      showError('signup-error', getErrorMsg(e.code));
      btn.textContent = '회원가입'; btn.disabled = false;
    }
  }

  window.doResetPw = async function() {
    const email = document.getElementById('reset-email').value.trim();
    const btn = document.getElementById('reset-btn');
    hideMsg('reset-error'); hideMsg('reset-success');
    if (!email) { showError('reset-error', '이메일을 입력해주세요.'); return; }
    btn.textContent = '전송 중...'; btn.disabled = true;
    try {
      await sendPasswordResetEmail(auth, email);
      showSuccess('reset-success', `📧 ${email} 로 재설정 링크를 보냈어요!`);
    } catch (e) {
      showError('reset-error', getErrorMsg(e.code));
    }
    btn.textContent = '재설정 메일 보내기 📧'; btn.disabled = false;
  }

  // 로그인 폼 엔터키 (이메일 + 비밀번호 둘 다)
  const loginEmail = document.getElementById('login-email');
  const loginPw = document.getElementById('login-pw');
  if (loginEmail) loginEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  if (loginPw) loginPw.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

  // 회원가입 폼 엔터키
  ['signup-name', 'signup-email', 'signup-pw', 'signup-pw2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSignup(); });
  });

  // 비밀번호 찾기 폼 엔터키
  const resetEmail = document.getElementById('reset-email');
  if (resetEmail) resetEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') doResetPw(); });
}