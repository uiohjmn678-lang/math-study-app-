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

// ===== 로그인 상태 감지 =====
onAuthStateChanged(auth, (user) => {
  if (user && isAuthPage) {
    window.location.href = 'index.html';
  } else if (!user && !isAuthPage) {
    window.location.href = 'auth.html';
  }
});

// ===== 로그아웃 (index.html에서 사용) =====
window.doLogout = async function() {
  try {
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
      showSuccess('signup-success', `🎉 ${name}님, 회원가입 완료!`);
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

  const loginPw = document.getElementById('login-pw');
  if (loginPw) {
    loginPw.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  }
}