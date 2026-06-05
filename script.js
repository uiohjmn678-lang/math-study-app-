// ============ DB section 매핑 ============
function getSectionFromType(type) {
  const map = {
    '수와 연산': '공통', '방정식과 부등식': '공통', '함수': '공통', '수열': '공통',
    '지수와 로그': '공통', '삼각함수': '공통',
    '함수의 극한과 연속': '공통', '미분': '공통', '적분': '공통',
    '수열의 극한': '미적분', '미분법': '미적분', '적분법': '미적분',
    '경우의 수': '확률과통계', '확률': '확률과통계', '통계': '확률과통계',
    '이차곡선': '기하', '평면벡터': '기하', '공간도형과 공간좌표': '기하',
  };
  return map[type] || '';
}

// ===== 수학완성 - script.js =====
// Gemini API 연동 수능 수학 AI 학습 도우미

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);
let currentUserId = null;

// 로그인 상태 감지 → userId 저장
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    loadUserDataFromFirestore();
  }
});

// ============ FIRESTORE 함수 ============
async function saveToFirestore(path, data) {
  if (!currentUserId) return;
  try {
    await setDoc(doc(db, 'users', currentUserId, ...path.split('/')), data, { merge: true });
  } catch (e) { console.error('Firestore 저장 오류:', e); }
}

async function loadFromFirestore(path) {
  if (!currentUserId) return null;
  try {
    const snap = await getDoc(doc(db, 'users', currentUserId, ...path.split('/')));
    return snap.exists() ? snap.data() : null;
  } catch (e) { console.error('Firestore 불러오기 오류:', e); return null; }
}

async function loadUserDataFromFirestore() {
  // 프로필 불러오기
  const profile = await loadFromFirestore('data/profile');
  if (profile) {
    if (profile.grade) { state.currentGrade = profile.grade; localStorage.setItem('current_grade', profile.grade); }
    if (profile.score) { state.currentScore = profile.score; localStorage.setItem('current_score', profile.score); }
    if (profile.weakTypes) { state.weakTypes = profile.weakTypes; localStorage.setItem('weak_types', JSON.stringify(profile.weakTypes)); }
    if (profile.name) { state.studentName = profile.name; localStorage.setItem('student_name', profile.name); }
    if (profile.scoreHistory) { state.scoreHistory = profile.scoreHistory; localStorage.setItem('score_history', JSON.stringify(profile.scoreHistory)); }
    if (profile.totalProblems) state.totalProblems = profile.totalProblems;
    if (profile.correctProblems) state.correctProblems = profile.correctProblems;
    if (profile.streak) state.streak = profile.streak;
  }

  // 점수 기록 불러오기
  const scoreHistData = await loadFromFirestore('data/score_history');
  if (scoreHistData && scoreHistData.history) {
    state.scoreHistory = scoreHistData.history;
    localStorage.setItem('score_history', JSON.stringify(state.scoreHistory));
  }

  // 등급 불러오기
  const gradeData = await loadFromFirestore('data/grade');
  if (gradeData && gradeData.grade) {
    state.currentGrade = gradeData.grade;
    localStorage.setItem('current_grade', state.currentGrade);
  }

    // 배지 불러오기
  const badgesData = await loadFromFirestore('data/badges');
  if (badgesData && badgesData.earned) {
    localStorage.setItem('earned_badges', JSON.stringify(badgesData.earned));
  }

  // 단원 진도표 불러오기
  const progressData = await loadFromFirestore('data/unit_progress');
  if (progressData && progressData.progress) {
    localStorage.setItem('unit_progress', JSON.stringify(progressData.progress));
  }

  // 오답노트 불러오기
  const wrongNotesData = await loadFromFirestore('data/wrong_notes');
  if (wrongNotesData && wrongNotesData.notes) {
    localStorage.setItem('wrong_notes', JSON.stringify(wrongNotesData.notes));
  }

  // 성적 분석 결과 불러오기
  const analysisData = await loadFromFirestore('data/analysis');
  if (analysisData && analysisData.result) {
    localStorage.setItem('last_analysis_result', analysisData.result);
    if (analysisData.title) localStorage.setItem('last_analysis_title', analysisData.title);
  }

    // 커리큘럼 불러오기 (Firestore 실패 시 localStorage 폴백)
  let curriculum = await loadFromFirestore('data/curriculum');
  if (!curriculum) {
    const local = localStorage.getItem('curriculum');
    if (local) try { curriculum = JSON.parse(local); } catch(e) {}
  }
  if (curriculum) {
    state.curriculum = curriculum;
    applyTodayGoal();
    generateGoal();
  }

  updateHeaderBadge();
  updateHomeStats();
  updateStatsPage();
  restoreAnalysisResult();
}

async function saveProfileToFirestore() {
  await saveToFirestore('data/profile', {
    grade: state.currentGrade,
    score: state.currentScore,
    weakTypes: state.weakTypes,
    name: state.studentName,
    scoreHistory: state.scoreHistory,
    totalProblems: state.totalProblems,
    correctProblems: state.correctProblems,
    streak: state.streak,
    updatedAt: new Date().toISOString(),
  });
}

async function saveCurriculumToFirestore(curriculum) {
  // localStorage에 항상 저장 (오프라인 대비)
  try { localStorage.setItem('curriculum', JSON.stringify(curriculum)); } catch(e) {}
  // Firestore에도 저장
  await saveToFirestore('data/curriculum', curriculum);
}

// ============ STATE ============
const state = {
  apiKey: localStorage.getItem('gemini_api_key') || '',
  studentName: localStorage.getItem('student_name') || '학생',
  currentGrade: localStorage.getItem('current_grade') || '-',
  currentScore: localStorage.getItem('current_score') || '-',
  weakTypes: JSON.parse(localStorage.getItem('weak_types') || '[]'),
  scoreHistory: JSON.parse(localStorage.getItem('score_history') || '[]'),
  totalProblems: parseInt(localStorage.getItem('total_problems') || '0'),
  correctProblems: parseInt(localStorage.getItem('correct_problems') || '0'),
  streak: parseInt(localStorage.getItem('streak') || '0'),
  lastStudyDate: localStorage.getItem('last_study_date') || '',
  currentProblem: null,
  currentHint: null,
  curriculum: null,
};

// ============ GEMINI API ============
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt, maxTokens = 8000) {
  if (!state.apiKey) return null;
  const parts = [{ text: prompt }];
  const body = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
  };
  const res = await fetch(`${GEMINI_URL}?key=${state.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'API 오류');
  }

  const data = await res.json();
  const responseParts = data.candidates?.[0]?.content?.parts || [];
  return responseParts.filter(p => p.text && !p.thought).map(p => p.text).join('') || '';
}

// ============ SPLASH ============
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
      initApp();
    }, 600);
  }, 1800);
});

// ============ INIT ============
function initApp() {
  updateHeaderBadge();
  updateHomeStats();
  updateStatsPage();
  loadApiKeyInputs();
  updateStreak();
  updateDday();
  restoreAnalysisResult();

  // localStorage에서 커리큘럼 먼저 로드 후 목표 표시
  const localCurriculum = localStorage.getItem('curriculum');
  if (localCurriculum) {
    try {
      state.curriculum = JSON.parse(localCurriculum);
      applyTodayGoal();
    } catch(e) {}
  }
  // 커리큘럼 여부 상관없이 오늘의 목표 표시
  generateGoal();

  // 네비게이션 이벤트
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // 탭 이벤트
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 설정 버튼
  document.getElementById('settingsBtn').addEventListener('click', openSettings);

  // 파일 인풋 (이미지 다중, PDF)
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
  document.getElementById('pdfInput').addEventListener('change', handlePdfSelect);
}

// ============ 분석 결과 복원 ============
function restoreAnalysisResult() {
  const savedResult = localStorage.getItem('last_analysis_result');
  const savedTitle = localStorage.getItem('last_analysis_title');
  if (!savedResult) return;

  const resultBox = document.getElementById('analyzeResult');
  const titleEl = document.getElementById('analyzeResultTitle');
  const content = document.getElementById('resultContent');

  if (resultBox && content) {
    resultBox.classList.remove('hidden');
    if (titleEl && savedTitle) titleEl.textContent = savedTitle;
    content.innerHTML = savedResult;
  }
}

// ============ NAVIGATION ============
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${pageId}`)?.classList.add('active');
  document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'stats') updateStatsPage();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
}

// ============ HEADER / STATS UPDATE ============
function updateHeaderBadge() {
  document.getElementById('badgeName').textContent = state.studentName;
  document.getElementById('badgeGrade').textContent = state.currentGrade !== '-' ? `${state.currentGrade}등급` : '등급 -';
}

function updateHomeStats() {
  document.getElementById('homeGrade').textContent = state.currentGrade !== '-' ? `${state.currentGrade}등급` : '-';
  document.getElementById('homeScore').textContent = state.currentScore !== '-' ? `${state.currentScore}점` : '-점';
  const focus = state.weakTypes.length > 0 ? Math.min(state.weakTypes.length * 15, 75) : 0;
  document.getElementById('homeFocus').style.width = focus + '%';
}

// ============ API KEY ============
function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) { showInfoModal('🔑 API 키 필요', 'API 키를 입력해주세요.'); return; }
  state.apiKey = key;
  localStorage.setItem('gemini_api_key', key);
  const btn = document.getElementById('saveKeyBtn');
  btn.textContent = '✅ 저장됨';
  setTimeout(() => btn.textContent = '저장', 2000);
}

function loadApiKeyInputs() {
  if (state.apiKey) {
    document.getElementById('apiKeyInput').value = state.apiKey;
    document.getElementById('settingKey').value = state.apiKey;
  }
  document.getElementById('settingName').value = state.studentName;
}

// ============ SETTINGS ============
function openSettings() {
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
  const name = document.getElementById('settingName').value.trim();
  const key = document.getElementById('settingKey').value.trim();
  if (name) {
    state.studentName = name;
    localStorage.setItem('student_name', name);
  }
  if (key) {
    state.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    document.getElementById('apiKeyInput').value = key;
  }
  updateHeaderBadge();
  closeModal();
}

// ============ UPLOAD STATE ============
let uploadedImages = []; // [{base64, name, dataUrl}]
let uploadedPdf = null;  // {base64, name, size}
let currentUploadMode = 'image'; // 'image' | 'pdf'
let currentPdfAction = 'grade'; // 'grade' | 'score'

// ===== 모드 전환 =====
function switchUploadMode(mode) {
  currentUploadMode = mode;
  document.querySelectorAll('.umode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.getElementById('imageModeArea').classList.toggle('hidden', mode !== 'image');
  document.getElementById('pdfModeArea').classList.toggle('hidden', mode !== 'pdf');
  // 성적표 분석 버튼 텍스트 업데이트
  const btn = document.getElementById('analyzeBtn');
  if (mode === 'pdf') {
    btn.textContent = '🤖 AI 분석 시작';
    document.getElementById('examTypeWrap').classList.add('hidden');
  } else {
    btn.textContent = '🤖 AI 분석 시작';
    document.getElementById('examTypeWrap').classList.remove('hidden');
  }
}

function setPdfAction(action) {
  currentPdfAction = action;
  document.querySelectorAll('.pdf-action-btn').forEach(b => b.classList.toggle('active', b.dataset.paction === action));
  const missedWrap = document.getElementById('missedAnswerWrap');
  if (missedWrap) missedWrap.classList.toggle('hidden', action !== 'grade');
  const btn = document.getElementById('analyzeBtn');
  btn.textContent = action === 'grade' ? '✏️ 채점 + 약점 분석 시작' : '📊 성적표 분석 시작';
}

// ===== 이미지 파일 처리 =====
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  files.forEach(f => {
    if (f.type === 'application/pdf') {
      // PDF가 이미지 탭에서 올라오면 → PDF 모드로 자동 전환
      loadPdfFile(f);
      switchUploadMode('pdf');
    } else if (f.type.startsWith('image/')) {
      addImageFile(f);
    }
  });
  e.target.value = '';
}

function addImageFile(file) {
  const MAX_MB = 10;
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast(`⚠️ ${file.name} 파일이 ${MAX_MB}MB를 초과해요. 더 작은 이미지를 사용해주세요.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const base64 = dataUrl.split(',')[1];
    uploadedImages.push({ base64, name: file.name, dataUrl });
    renderImagePreviews();
  };
  reader.readAsDataURL(file);
}

// 수동 점수 입력 모달 (파싱 실패 시)
function showManualScoreInput() {
  const existing = document.getElementById('manualScoreModal');
  if (existing) return;
  const modal = document.createElement('div');
  modal.id = 'manualScoreModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:360px;width:90%;box-shadow:0 8px 32px rgba(74,144,226,0.18);">
      <div style="font-size:1.1rem;font-weight:800;color:#4A90E2;margin-bottom:8px;">📊 점수 직접 입력</div>
      <p style="font-size:0.88rem;color:var(--text2);margin-bottom:16px;">성적표에서 점수를 자동으로 읽지 못했어요.<br/>직접 입력해주시면 그래프에 반영돼요.</p>
      <input type="number" id="manualScoreInput" min="0" max="100" placeholder="수학 점수 입력 (0~100)" 
        style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:10px;font-size:1rem;margin-bottom:8px;"/>
      <input type="number" id="manualGradeInput" min="1" max="9" placeholder="등급 입력 (1~9)" 
        style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:10px;font-size:1rem;margin-bottom:16px;"/>
      <div style="display:flex;gap:8px;">
        <button onclick="saveManualScore()" style="flex:1;background:linear-gradient(135deg,#4A90E2,#6B7EC9);color:#fff;border:none;border-radius:10px;padding:11px;font-size:0.95rem;font-weight:700;cursor:pointer;">저장</button>
        <button onclick="document.getElementById('manualScoreModal').remove()" style="flex:1;background:#f0f6ff;color:var(--text2);border:none;border-radius:10px;padding:11px;font-size:0.95rem;font-weight:700;cursor:pointer;">건너뛰기</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

window.saveManualScore = function() {
  const score = parseInt(document.getElementById('manualScoreInput').value);
  const grade = parseInt(document.getElementById('manualGradeInput').value);
  if (score >= 0 && score <= 100) {
    state.currentScore = score;
    localStorage.setItem('current_score', score);
    const todayStr = new Date().toLocaleDateString('ko');
    const lastIdx = state.scoreHistory.findIndex(s => s.date === todayStr);
    if (lastIdx !== -1) { state.scoreHistory[lastIdx].score = score; }
    else { state.scoreHistory.push({ date: todayStr, score }); }
    localStorage.setItem('score_history', JSON.stringify(state.scoreHistory));
    try { saveToFirestore('data/score_history', { history: state.scoreHistory }); } catch(e) {}
  }
  if (grade >= 1 && grade <= 9) {
    state.currentGrade = grade;
    localStorage.setItem('current_grade', grade);
    try { saveToFirestore('data/grade', { grade }); } catch(e) {}
  }
  document.getElementById('manualScoreModal')?.remove();
  updateHeaderBadge();
  updateHomeStats();
  showToast('✅ 점수가 저장됐어요!');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a2340;color:#fff;padding:12px 20px;border-radius:12px;font-size:0.88rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);max-width:320px;text-align:center;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  const inner = document.getElementById('uploadInner');
  if (uploadedImages.length === 0) {
    grid.classList.add('hidden');
    grid.innerHTML = '';
    inner.style.display = '';
    return;
  }
  inner.style.display = 'none';
  grid.classList.remove('hidden');
  grid.innerHTML = uploadedImages.map((img, i) => `
    <div class="preview-thumb-wrap">
      <img src="${img.dataUrl}" alt="${img.name}" />
      <button class="preview-remove-btn" onclick="removeImage(${i})">✕</button>
    </div>
  `).join('') + `
    <div class="add-more-btn" onclick="document.getElementById('fileInput').click()">
      <span>＋</span>추가
    </div>`;
}

function removeImage(idx) {
  uploadedImages.splice(idx, 1);
  renderImagePreviews();
}

// ===== PDF 파일 처리 =====
function handlePdfSelect(e) {
  const file = e.target.files[0];
  if (file) loadPdfFile(file);
  e.target.value = '';
}

function loadPdfFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1];
    uploadedPdf = { base64, name: file.name, size: file.size };
    renderPdfInfo();
  };
  reader.readAsDataURL(file);
}

function renderPdfInfo() {
  const info = document.getElementById('pdfInfo');
  const actions = document.getElementById('pdfActions');
  const box = document.getElementById('pdfUploadBox');
  if (!uploadedPdf) {
    info.classList.add('hidden');
    actions.classList.add('hidden');
    box.style.display = '';
    return;
  }
  const sizeMB = (uploadedPdf.size / 1024 / 1024).toFixed(1);
  box.style.display = 'none';
  info.classList.remove('hidden');
  info.innerHTML = `
    <div class="pdf-info-icon">📄</div>
    <div>
      <div class="pdf-info-name">${uploadedPdf.name}</div>
      <div class="pdf-info-size">${sizeMB} MB</div>
    </div>
    <button class="pdf-remove-btn" onclick="removePdf()">✕ 제거</button>`;
  actions.classList.remove('hidden');
  setPdfAction('grade');
}

function removePdf() {
  uploadedPdf = null;
  document.getElementById('pdfUploadBox').style.display = '';
  document.getElementById('pdfInfo').classList.add('hidden');
  document.getElementById('pdfActions').classList.add('hidden');
  document.getElementById('pdfAskInput') && document.getElementById('pdfAskInput').classList.add('hidden');
  document.getElementById('pdfProblemsArea') && document.getElementById('pdfProblemsArea').classList.add('hidden');
  document.getElementById('analyzeBtn').textContent = '🤖 AI 분석 시작';
  // 분석 결과는 유지 (localStorage에 저장되어 있음)
}

// ===== 드래그 앤 드롭 =====
function handleDrop(e, type) {
  e.preventDefault();
  const target = type === 'pdf' ? document.getElementById('pdfUploadBox') : document.getElementById('uploadBox');
  target.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  if (type === 'pdf') {
    const pdf = files.find(f => f.type === 'application/pdf');
    if (pdf) loadPdfFile(pdf);
  } else {
    files.filter(f => f.type.startsWith('image/')).forEach(f => addImageFile(f));
  }
}

// ============ DESMOS GRAPH ============
const desmosInstances = {};

function renderDesmos(elId, wrapId, expressions) {
  if (!expressions || expressions.length === 0) {
    document.getElementById(wrapId).classList.add('hidden');
    return;
  }
  document.getElementById(wrapId).classList.remove('hidden');
  const el = document.getElementById(elId);
  if (!el || !window.Desmos) return;

  if (desmosInstances[elId]) {
    desmosInstances[elId].destroy();
    delete desmosInstances[elId];
  }
  el.innerHTML = '';

  const calculator = Desmos.GraphingCalculator(el, {
    expressions: false,
    settingsMenu: false,
    zoomButtons: true,
    lockViewport: false,
    border: false,
    keypad: false,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    xAxisLabel: 'x',
    yAxisLabel: 'y',
    xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
    yAxisArrowMode: Desmos.AxisArrowModes.BOTH,
  });
  desmosInstances[elId] = calculator;

  const colors = [
    Desmos.Colors.BLUE, Desmos.Colors.RED, Desmos.Colors.GREEN,
    Desmos.Colors.ORANGE, Desmos.Colors.PURPLE, Desmos.Colors.BLACK,
  ];

  expressions.forEach((expr, i) => {
    const latex = (expr.latex || '').trim();
    if (!latex) return;
    const expObj = { id: `expr_${i}`, latex, color: colors[i % colors.length] };
    if (expr.fillOpacity !== undefined) expObj.fillOpacity = expr.fillOpacity;
    calculator.setExpression(expObj);
  });

  setTimeout(() => { try { calculator.zoomFit(); } catch(e) {} }, 600);
}


function parseDesmosExpressions(text) {
  const match = text.match(/DESMOS_START([\s\S]*?)DESMOS_END/);
  if (!match) return [];
  const colors = ['#4A90E2', '#FF6B6B', '#34C759', '#FF9500', '#5856D6', '#FF2D55'];
  return match[1].trim().split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('//'))
    .map((line, i) => {
      // 점+레이블: (1,3)|A
      const labelMatch = line.match(/^(\([^)]+\))\|(.+)$/);
      if (labelMatch) {
        return { latex: labelMatch[1].trim(), label: labelMatch[2].trim(), color: colors[i % colors.length] };
      }
      // polygon 도형 → 채우기 색 연하게
      if (line.startsWith('polygon(')) {
        return { latex: line, color: colors[i % colors.length], fillOpacity: 0.15 };
      }
      return { latex: line, color: colors[i % colors.length] };
    });
}
function renderMath(el) {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([el]).catch(e => console.warn('MathJax 오류:', e));
  }
}

// 선택지 클릭 전역 상태
let selectedChoice = '';

// 문제 + 선택지 클릭 UI 렌더링
function renderProblemHTML(text) {
  // 힌트/정답 제거 후 마크다운 제거
  const clean = text
    .replace(/\n?힌트[：:][\s\S]*/g, '')
    .replace(/\n?정답[：:][^\n]*/g, '')
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/---+/g, '')
    .trim();

  // 선택지 파싱
  const choices = [];
  const choiceRegex = /([①②③④⑤])\s*([^\n①②③④⑤]+)/g;
  let m;
  while ((m = choiceRegex.exec(clean)) !== null) {
    choices.push({ num: m[1], text: m[2].trim() });
  }

  // 문제 본문 (선택지 제거)
  const problemText = clean.replace(/[①②③④⑤][^\n①②③④⑤]*/gs, '').trim();

  let html = `<div class="problem-text">${mathHtml(problemText)}</div>`;

  if (choices.length > 0) {
    selectedChoice = '';
    html += `<div class="choice-list">` +
      choices.map(c =>
        `<button class="choice-btn" data-val="${c.num}" onclick="selectChoice(this,'${c.num}')">
          <span class="choice-num">${c.num}</span>
          <span class="choice-text">${mathHtml(c.text)}</span>
        </button>`
      ).join('') +
      `</div>`;
  }
  return html;
}

window.selectChoice = function(btn, choice) {
  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedChoice = choice;
};

// 수식 포함 텍스트를 HTML로 변환 (줄바꿈 + $ 기호 보존, 마크다운 제거)
function mathHtml(text) {
  return text
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')  // **굵게**, *기울기* 제거
    .replace(/#{1,6}\s*/g, '')                    // ## 제목 제거
    .replace(/---+/g, '')                         // --- 구분선 제거
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
}
async function runAnalyze() {
  if (!state.apiKey) { showApiKeyWarning(); return; }

  if (currentUploadMode === 'pdf') {
    if (!uploadedPdf) { showInfoModal('📄 PDF 없음', 'PDF를 먼저 업로드해주세요!'); return; }
    if (currentPdfAction === 'grade') await gradeExamPdf();
    else await analyzeScoreFromPdf();
  } else {
    if (uploadedImages.length === 0) { showInfoModal('📸 사진 없음', '성적표 사진을 먼저 업로드해주세요!'); return; }
    await analyzeImages();
  }
}

// ===== 이미지(여러 장) 성적 분석 =====
async function analyzeImages() {
  const btn = document.getElementById('analyzeBtn');
  btn.innerHTML = '<span class="spinner"></span>AI 분석 중...';
  btn.disabled = true;
  document.getElementById('analyzeResult').classList.add('hidden');

  const examType = document.getElementById('examType').value || '수능/모의고사';
  const subjectType = document.getElementById('subjectType')?.value || '확률과통계';

  // 선택과목별 포함 유형 정의
  const subjectMap = {
    '확률과통계': { include: ['확률·통계'], exclude: ['미적분', '기하'] },
    '미적분': { include: ['미적분'], exclude: ['확률·통계', '기하'] },
    '기하': { include: ['기하'], exclude: ['확률·통계', '미적분'] },
  };
  const subject = subjectMap[subjectType] || subjectMap['확률과통계'];

  // 여러 이미지를 순서대로 parts에 넣기
  const parts = [];
  uploadedImages.forEach((img, i) => {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: img.base64 } });
    parts.push({ text: `[이미지 ${i+1}번]` });
  });
  let subjectItems = '';
  if (subjectType === '미적분') {
    subjectItems = '- 극한: 상/중/하\n- 미분: 상/중/하\n- 적분: 상/중/하';
  } else if (subjectType === '기하') {
    subjectItems = '- 이차곡선: 상/중/하\n- 벡터: 상/중/하\n- 공간도형: 상/중/하';
  } else {
    subjectItems = '- 경우의 수: 상/중/하\n- 확률: 상/중/하\n- 통계: 상/중/하';
  }

  const imagePrompt = `위 이미지는 ${examType} 수학 성적표입니다 (총 ${uploadedImages.length}장).
이 학생의 선택과목은 [${subjectType}]입니다.

수능 수학 구조:
- 공통과목 (모든 학생): 수와 연산, 방정식·부등식, 함수, 수열
- 선택과목 (이 학생): ${subjectType}

아래 형식으로 분석해주세요. 선택과목이 아닌 유형은 "해당없음"으로 표기:

【점수 분석】
- 총점: N점
- 등급: N등급
- 백분위: N%
- 원점수/표준점수 (있는 경우)

【유형별 수준】
공통과목:
- 수와 연산: 상/중/하 (파악 불가시 "정보 부족")
- 방정식·부등식: 상/중/하
- 함수: 상/중/하
- 수열: 상/중/하

선택과목 [${subjectType}]:
${subjectItems}

【약점 유형 TOP 3】
(성적표에서 가장 낮은 유형 3개를 직접 작성. "코멘트", "이미지" 같은 단어 사용 금지. 아래 형식으로만)
1. 유형명: 구체적으로 어떤 개념이 약한지 한 줄
2. 유형명: 구체적으로 어떤 개념이 약한지 한 줄
3. 유형명: 구체적으로 어떤 개념이 약한지 한 줄

【AI 한마디 조언】
학생 이름을 부르며 따뜻하게, 2문장으로만 작성`;

  parts.push({ text: imagePrompt });

  try {
    const result = await callGeminiWithParts(parts);
    document.getElementById('analyzeResultTitle').textContent = '📊 분석 결과';
    displayAnalysisResult(result);
  } catch (e) {
    showError('analyzeResult', 'resultContent', `분석 실패: ${e.message}`);
  } finally {
    btn.innerHTML = '🤖 AI 분석 시작';
    btn.disabled = false;
  }
}

// ===== PDF - 시험지 채점 + 약점 분석 (손글씨 자동 인식) =====
async function gradeExamPdf() {
  const btn = document.getElementById('analyzeBtn');
  btn.innerHTML = '<span class="spinner"></span>손글씨 읽는 중...';
  btn.disabled = true;
  document.getElementById('analyzeResult').classList.add('hidden');

  // 못 읽은 문제 보완 답안
  const missedEl = document.getElementById('missedAnswers');
  const missedAnswers = missedEl ? missedEl.value.trim() : '';
  const missedNote = missedAnswers
    ? `\n\n추가 보완 답안 (학생이 직접 입력): ${missedAnswers}\n위 보완 답안을 PDF에서 읽은 답과 합쳐서 채점해주세요.`
    : '';

  const subjectTypePdf = document.getElementById('subjectType')?.value || '확률과통계';
  let subjectItemsPdf = '';
  if (subjectTypePdf === '미적분') {
    subjectItemsPdf = '- 극한: 상/중/하 (이유 한 줄)\n- 미분: 상/중/하 (이유 한 줄)\n- 적분: 상/중/하 (이유 한 줄)';
  } else if (subjectTypePdf === '기하') {
    subjectItemsPdf = '- 이차곡선: 상/중/하 (이유 한 줄)\n- 벡터: 상/중/하 (이유 한 줄)\n- 공간도형: 상/중/하 (이유 한 줄)';
  } else {
    subjectItemsPdf = '- 경우의 수: 상/중/하 (이유 한 줄)\n- 확률: 상/중/하 (이유 한 줄)\n- 통계: 상/중/하 (이유 한 줄)';
  }

  const prompt = `이 PDF는 학생이 직접 답을 적은 수능/모의고사 수학 시험지입니다.
이 학생의 선택과목은 [${subjectTypePdf}]입니다.
시험지에 표시된 학생의 답을 모두 읽어서 정답과 비교 채점해주세요.
반드시 1번부터 마지막 문제까지 순서대로 모두 확인해주세요.
마크다운 기호(#, **, *) 절대 사용 금지.${missedNote}

아래 형식으로 작성해주세요:

【채점 결과】
- 총점: N점 (100점 만점, 각 문제 배점 반영)
- 등급: N등급
- 맞은 문제 (N개): 1번, 2번, 3번, ...
- 틀린 문제 (N개):
  • N번 [배점: N점] 정답: X, 학생답: Y → 왜 틀렸는지 한 줄 설명

【유형별 수준】
공통과목:
- 수와 연산: 상/중/하 (이유 한 줄)
- 방정식·부등식: 상/중/하 (이유 한 줄)
- 함수: 상/중/하 (이유 한 줄)
- 수열: 상/중/하 (이유 한 줄)

선택과목 [${subjectTypePdf}]:
${subjectItemsPdf}

【약점 유형 TOP 3】
(틀린 문제 기반으로 직접 작성. "코멘트", "이미지" 단어 사용 금지)
1. 유형명: 어떤 개념/계산에서 틀렸는지 한 줄
2. 유형명: 어떤 개념/계산에서 틀렸는지 한 줄
3. 유형명: 어떤 개념/계산에서 틀렸는지 한 줄

【이렇게 공부하세요】
틀린 문제 패턴을 분석해서 학생이 바로 실천할 수 있는 공부 방법 3가지를 친근하게 알려주세요.

【AI 한마디】
학생 이름을 부르며 따뜻하게, 2문장으로만 격려`;

  try {
    const result = await callGeminiWithPdf(prompt, 16000);
    document.getElementById('analyzeResultTitle').textContent = '📊 채점 + 약점 분석 결과';
    displayAnalysisResult(result);
  } catch (e) {
    showError('analyzeResult', 'resultContent', `분석 실패: ${e.message}`);
  } finally {
    btn.innerHTML = '✏️ 채점 + 약점 분석 시작';
    btn.disabled = false;
  }
}
// ===== PDF - 성적표 분석 =====
async function analyzeScoreFromPdf() {
  const btn = document.getElementById('analyzeBtn');
  btn.innerHTML = '<span class="spinner"></span>성적 분석 중...';
  btn.disabled = true;
  document.getElementById('analyzeResult').classList.add('hidden');

  const subjectType2 = document.getElementById('subjectType')?.value || '확률과통계';
  let subjectItems2 = '';
  if (subjectType2 === '미적분') {
    subjectItems2 = '- 극한: 상/중/하\n- 미분: 상/중/하\n- 적분: 상/중/하';
  } else if (subjectType2 === '기하') {
    subjectItems2 = '- 이차곡선: 상/중/하\n- 벡터: 상/중/하\n- 공간도형: 상/중/하';
  } else {
    subjectItems2 = '- 경우의 수: 상/중/하\n- 확률: 상/중/하\n- 통계: 상/중/하';
  }

  const prompt = `이 PDF는 수능/모의고사 수학 성적표입니다.
이 학생의 선택과목은 [${subjectType2}]입니다.

수능 수학 구조:
- 공통과목: 수와 연산, 방정식·부등식, 함수, 수열
- 선택과목 (이 학생): ${subjectType2}

아래 형식으로 분석해주세요:

【점수 분석】
- 총점: N점
- 등급: N등급
- 백분위: N%
- 표준점수 (있으면)

【유형별 수준】
공통과목:
- 수와 연산: 상/중/하
- 방정식·부등식: 상/중/하
- 함수: 상/중/하
- 수열: 상/중/하

선택과목 [${subjectType2}]:
${subjectItems2}

【약점 유형 TOP 3】
(성적표에서 가장 낮은 유형 3개 직접 작성. "코멘트", "이미지" 단어 사용 금지)
1. 유형명: 어떤 개념이 약한지 한 줄
2. 유형명: 어떤 개념이 약한지 한 줄
3. 유형명: 어떤 개념이 약한지 한 줄

【AI 한마디 조언】
학생 이름을 부르며 따뜻하게, 2문장으로만 작성`;

  try {
    const result = await callGeminiWithPdf(prompt);
    document.getElementById('analyzeResultTitle').textContent = '📊 성적 분석 결과';
    displayAnalysisResult(result);
  } catch (e) {
    showError('analyzeResult', 'resultContent', `분석 실패: ${e.message}`);
  } finally {
    btn.innerHTML = '📊 성적 분석 시작';
    btn.disabled = false;
  }
}

// ===== 문제 풀기 모달 =====
function openSolveModal(idx) {
  const p = window._extractedProblems[idx];
  const existing = document.getElementById('solveModalOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'solveModalOverlay';
  overlay.className = 'solve-modal';
  overlay.innerHTML = `
    <div class="solve-modal-box">
      <div class="solve-modal-header">
        <h3>✏️ ${p.num} 풀기</h3>
        <button class="modal-close-btn" onclick="document.getElementById('solveModalOverlay').remove()">✕</button>
      </div>
      <div class="solve-modal-problem">${escapeHtml(p.content)}${p.choices ? '\n\n' + escapeHtml(p.choices) : ''}</div>
      <textarea id="modalSolveTxt" class="solve-textarea" placeholder="풀이 과정을 단계별로 작성해주세요&#10;1단계:&#10;2단계:&#10;답:"></textarea>
      <button class="btn-primary" onclick="submitModalSolve(${idx})">제출 및 AI 채점</button>
      <div id="modalFeedback" class="solve-modal-feedback hidden"></div>
    </div>`;
  document.body.appendChild(overlay);
}

async function submitModalSolve(idx) {
  const p = window._extractedProblems[idx];
  const solve = document.getElementById('modalSolveTxt').value.trim();
  if (!solve) { showInfoModal('✏️ 풀이 입력', '풀이 과정을 입력해주세요!'); return; }

  const fb = document.getElementById('modalFeedback');
  fb.classList.remove('hidden');
  fb.innerHTML = '<span class="spinner"></span> AI가 채점 중...';

  const prompt = `수학 문제와 학생 풀이를 채점해주세요.
마크다운 기호(#, **, *) 절대 사용 금지.

문제 (${p.num}): ${p.content}
${p.choices ? '선택지: ' + p.choices : ''}

학생 풀이:
${solve}

아래 형식으로만 작성:

판정: ✅ 정답 / ❌ 오답 중 하나만
정답: (객관식이면 ①②③④⑤ 번호, 서술형이면 값)

✅ 잘한 점
(한 줄)

🔧 개선할 점
(한 줄)

📋 풀이
(단계별, 번호 사용. 각 단계 사이 빈 줄. 수식은 $...$ LaTeX 형식)

∴ 최종 답: (정답을 마지막에 한 번 더 강조)

💡 핵심 팁
(한 줄)`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = result.includes('✅') && !result.includes('❌');
    fb.innerHTML = renderFeedback(result, isCorrect);
    incrementProblems(isCorrect);
  } catch (e) {
    fb.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

async function askThisProblem(idx) {
  const p = window._extractedProblems[idx];
  openSolveModal(idx);
  const fb = document.getElementById('modalFeedback');
  fb.classList.remove('hidden');
  fb.innerHTML = '<span class="spinner"></span> AI 풀이 생성 중...';

  const prompt = `다음 수능 수학 문제의 풀이를 단계별로 자세히 설명해주세요.

문제 (${p.num}): ${p.content}
${p.choices ? '선택지: ' + p.choices : ''}

단계별 풀이와 핵심 개념을 친절하게 설명해주세요.`;

  try {
    const result = await callGemini(prompt);
    fb.innerHTML = `<h3 style="margin-bottom:12px">🤖 AI 풀이</h3><pre style="white-space:pre-wrap;font-family:'Pretendard',sans-serif;font-size:0.85rem;line-height:1.8">${escapeHtml(result)}</pre>`;
  } catch (e) {
    fb.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

// ===== Gemini API 호출 - 여러 parts =====
async function callGeminiWithParts(parts, maxTokens = 8000) {
  if (!state.apiKey) return null;
  const body = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
  };
  const res = await fetch(`${GEMINI_URL}?key=${state.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || 'API 오류'); }
  const data = await res.json();
  const responseParts = data.candidates?.[0]?.content?.parts || [];
  return responseParts.filter(p => p.text && !p.thought).map(p => p.text).join('') || '';
}

// ===== Gemini API 호출 - PDF =====
async function callGeminiWithPdf(prompt, maxTokens = 8000) {
  if (!state.apiKey || !uploadedPdf) return null;
  const parts = [
    { inline_data: { mime_type: 'application/pdf', data: uploadedPdf.base64 } },
    { text: prompt }
  ];
  return callGeminiWithParts(parts, maxTokens);
}

function displayAnalysisResult(text) {
  const resultBox = document.getElementById('analyzeResult');
  const content = document.getElementById('resultContent');
  resultBox.classList.remove('hidden');

  // 점수/등급 파싱 및 저장
  // 점수 파싱 - 다양한 AI 응답 형식 대응
  // 점수 파싱 - 수능 수학 점수는 0~100점
  const scoreRaw = text.match(/총점[：:\s]*(\d+)\s*점/)
    || text.match(/원점수[：:\s]*(\d+)\s*점/)
    || text.match(/(\d+)\s*점\s*\/\s*100/)
    || text.match(/점수[：:\s]*(\d+)\s*점/)
    || text.match(/수학[：:\s]*(\d+)\s*점/)
    || text.match(/-\s*(?:총점|점수)[：:\s]*(\d+)/)
    || text.match(/(\d{2,3})점\s*(?:\/|,|\s)/);
  // 0~100 범위 검증
  const scoreMatch = scoreRaw && parseInt(scoreRaw[2] || scoreRaw[1]) <= 100 ? scoreRaw : null;
  const gradeMatch = text.match(/(?:현재\s*)?등급[：:\s]*(\d+)\s*등급/)
    || text.match(/(\d+)\s*등급\s*(?:수준|예상|판정)/)
    || text.match(/-(\s*등급)[：:\s]*(\d+)/)
    || text.match(/등급:\s*(\d+)/);
  // 디버그: 파싱 결과 콘솔 출력
  console.log('[점수파싱]', scoreRaw ? `매칭: ${scoreRaw[0]}` : '실패');
  console.log('[등급파싱]', gradeMatch ? `매칭: ${gradeMatch[0]}` : '실패');

  if (scoreMatch) {
    state.currentScore = parseInt(scoreRaw[2] || scoreRaw[1]);
    localStorage.setItem('current_score', state.currentScore);
    const now = new Date();
    const todayStr = `${now.getMonth()+1}/${now.getDate()}`;
    // 같은 날짜면 업데이트, 아니면 새로 추가
    const lastIdx = state.scoreHistory.findIndex(s => s.date === todayStr);
    if (lastIdx !== -1) {
      state.scoreHistory[lastIdx].score = state.currentScore;
    } else {
      state.scoreHistory.push({ date: todayStr, score: state.currentScore });
    }
    localStorage.setItem('score_history', JSON.stringify(state.scoreHistory));
    try { saveToFirestore('data/score_history', { history: state.scoreHistory }); } catch(e) {}
    updateStatsPage();
  } else {
    // 점수 파싱 실패 시 수동 입력 UI 표시
    console.warn('[점수파싱 실패] AI 응답에서 점수를 찾을 수 없음');
    setTimeout(() => showManualScoreInput(), 500);
  }
  if (gradeMatch) {
    state.currentGrade = parseInt(gradeMatch[2] || gradeMatch[1]);
    localStorage.setItem('current_grade', state.currentGrade);
    try { saveToFirestore('data/grade', { grade: state.currentGrade }); } catch(e) {}
  }
  const weakSection = text.match(/약점 유형 TOP 3[\s\S]*?(?=\n【|$)/);
  if (weakSection) {
    const lines = weakSection[0].split('\n').filter(l => /^\d\./.test(l.trim()));
    state.weakTypes = lines.map(l =>
      l.replace(/^\d\.\s*/, '')
       .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
       .trim()
       .split(/[：:（(]/)[0]
       .trim()
    ).filter(Boolean);
    localStorage.setItem('weak_types', JSON.stringify(state.weakTypes));
  }
  updateHeaderBadge();
  updateHomeStats();

  // 섹션별 파싱해서 카드로 렌더링
  const sections = [
    { key: '채점 결과', icon: '📋', color: '#4A90E2' },
    { key: '유형별 수준', icon: '📊', color: '#6B7EC9' },
    { key: '약점 유형 TOP 3', icon: '⚠️', color: '#FF6B6B' },
    { key: '이렇게 공부하세요', icon: '📚', color: '#34C759' },
    { key: 'AI 한마디', icon: '💬', color: '#5856D6' },
  ];

  const lines = text.split('\n');
  let parsed = [];
  let current = null;
  let currentLines = [];

  const flush = () => {
    if (current) {
      parsed.push({ ...current, body: currentLines.filter(l => l.trim()).join('\n').trim() });
      currentLines = [];
    }
  };

  lines.forEach(line => {
    const matched = sections.find(s => line.includes('【' + s.key + '】'));
    if (matched) { flush(); current = matched; }
    else if (current) currentLines.push(line);
  });
  flush();

  if (parsed.length === 0) {
    content.innerHTML = `<pre style="white-space:pre-wrap;font-family:'Pretendard',sans-serif;font-size:0.88rem;line-height:1.8;color:var(--text)">${escapeHtml(text)}</pre>`;
    return;
  }

  let html = '<div class="analysis-cards">';
  parsed.forEach(sec => {
    const bodyHtml = mathHtml(sec.body);
    html += `
      <div class="analysis-card">
        <div class="analysis-card-title" style="color:${sec.color}">
          ${sec.icon} ${sec.key}
        </div>
        <div class="analysis-card-body">${bodyHtml}</div>
      </div>`;
  });
  html += '</div>';
  content.innerHTML = html;

  // 분석 결과 localStorage + Firestore에 저장
  try {
    const analysisTitle = document.getElementById('analyzeResultTitle').textContent;
    localStorage.setItem('last_analysis_result', html);
    localStorage.setItem('last_analysis_title', analysisTitle);
    saveToFirestore('data/analysis', { result: html, title: analysisTitle, savedAt: new Date().toISOString() });
  } catch(e) {}

  // Firestore에 프로필 저장
  saveProfileToFirestore();

  // 커리큘럼 자동 생성 (분석 결과 기반)
  generateCurriculum(text);
}

// ============ GENERATE GOAL ============
async function generateGoal() {
  const goalContent = document.getElementById('goalContent');

  // 커리큘럼 있으면 → 오늘 날짜 목표 표시 (변경 불가)
  if (state.curriculum?.daily) {
    const dayOfMonth = new Date().getDate();
    const startDay = state.curriculum.startDay || 1;
    const todayIndex = dayOfMonth - startDay;
    const todayPlan = state.curriculum.daily[todayIndex];

    if (todayPlan) {
      displayTodayGoal(todayPlan);
    } else {
      // 30일 초과 → 새 성적표 안내
      goalContent.innerHTML = `
        <div class="curriculum-end-notice">
          <div style="font-size:2rem;margin-bottom:12px">📋</div>
          <h3>이번 달 커리큘럼이 완료됐어요!</h3>
          <p>새 모의고사 성적표를 업로드하면<br/>다음 달 커리큘럼이 새로 시작돼요</p>
          <button class="btn-primary" onclick="navigateTo('analyze')" style="margin-top:16px">📸 성적표 업로드하기</button>
        </div>`;
    }
    return;
  }

  // 커리큘럼 없으면 → 성적표 먼저 올리라고 안내
  goalContent.innerHTML = `
    <div class="curriculum-end-notice">
      <div style="font-size:2rem;margin-bottom:12px">📸</div>
      <h3>먼저 모의고사 성적표를 올려주세요</h3>
      <p>성적표를 분석하면 이번 달 말까지<br/>맞춤 커리큘럼이 자동으로 생성돼요</p>
      <button class="btn-primary" onclick="navigateTo('analyze')" style="margin-top:16px">📸 성적표 업로드하러 가기</button>
    </div>`;
}

// 커리큘럼 기반 오늘의 목표 표시
function displayTodayGoal(todayPlan) {
  const goalContent = document.getElementById('goalContent');
  const dayOfMonth = new Date().getDate();
  const startDay = state.curriculum.startDay || 1;
  const totalDays = state.curriculum.daily.length;
  const currentIndex = dayOfMonth - startDay + 1; // 1일차, 2일차...
  const progressPct = Math.round((currentIndex / totalDays) * 100);
  const daysInThisMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  // 남은 수능까지 일수
  const suneung = new Date('2026-11-19');
  const today2 = new Date(); today2.setHours(0,0,0,0);
  const dday = Math.round((suneung - today2) / (1000 * 60 * 60 * 24));

  goalContent.innerHTML = `
    <div class="curriculum-info-bar">
      <span>📅 ${currentIndex}일차 · ${dayOfMonth}일 시작 ~ ${daysInThisMonth}일까지</span>
      <span class="curriculum-badge">${state.curriculum.summary || '맞춤 학습 중'}</span>
    </div>

    <div style="margin:0 0 16px;background:#f0f6ff;border-radius:10px;padding:10px 14px;">
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text2);margin-bottom:6px;">
        <span>커리큘럼 진행도</span>
        <span style="font-weight:700;color:var(--accent)">${progressPct}%</span>
      </div>
      <div style="background:#dde8f8;border-radius:99px;height:8px;">
        <div style="width:${progressPct}%;background:linear-gradient(90deg,#4A90E2,#6B7EC9);border-radius:99px;height:8px;transition:width 0.4s;"></div>
      </div>
      <div style="font-size:0.78rem;color:var(--text3);margin-top:6px;text-align:right;">수능까지 D-${dday}</div>
    </div>

    <div class="goal-card-single">
      <div class="goal-section">
        <div class="goal-section-header">
          <span class="goal-section-icon">✏️</span>
          <span class="goal-section-title" style="color:#4A90E2">오늘 풀 문제</span>
        </div>
        <div class="goal-section-body">
          <strong>${todayPlan.types?.join(', ')}</strong> 유형 · 총 <strong>${todayPlan.count}문제</strong>
        </div>
      </div>
      <div class="goal-section">
        <div class="goal-section-header">
          <span class="goal-section-icon">🔥</span>
          <span class="goal-section-title" style="color:#FF6B6B">약점 집중 훈련</span>
        </div>
        <div class="goal-section-body">
          <strong>${todayPlan.weakFocus}</strong> 유형 집중 — 이 유형에서 실수를 줄이는 게 오늘의 핵심이에요
        </div>
      </div>
      <div class="goal-section" style="border-bottom:none">
        <div class="goal-section-header">
          <span class="goal-section-icon">🎯</span>
          <span class="goal-section-title" style="color:#FF9500">오늘의 목표</span>
        </div>
        <div class="goal-section-body">${todayPlan.goal}</div>
      </div>
    </div>`;
}

function formatGoalHTML(raw) {
  // 마크다운 기호 제거
  const text = raw
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/---+/g, '')
    .trim();

  const sectionDefs = [
    { icon: '📚', key: '개념 학습', color: '#4A90E2' },
    { icon: '✏️', key: '기본 문제 풀이', color: '#6B7EC9' },
    { icon: '🔥', key: '약점 집중 훈련', color: '#FF6B6B' },
    { icon: '📝', key: '오늘의 핵심 포인트', color: '#34C759' },
    { icon: '🎯', key: '목표', color: '#FF9500' },
    { icon: '💬', key: '한마디', color: '#5856D6' },
  ];

  // 각 섹션 파싱
  const sections = [];
  sectionDefs.forEach((def, i) => {
    const nextKeys = sectionDefs.slice(i + 1).map(d => d.icon + '|' + d.icon.replace(/./g, c => `\\u${c.codePointAt(0).toString(16).padStart(4,'0')}`));
    // 이모지로 시작하는 줄 찾기
    const lines = text.split('\n');
    let startIdx = -1;
    lines.forEach((line, li) => {
      if (line.includes(def.icon) && startIdx === -1) startIdx = li;
    });
    if (startIdx === -1) return;

    // 다음 섹션 이모지까지 내용 수집
    const contentLines = [];
    for (let li = startIdx + 1; li < lines.length; li++) {
      const hasNextIcon = sectionDefs.some((d, di) => di > i && lines[li].includes(d.icon));
      if (hasNextIcon) break;
      if (lines[li].trim()) contentLines.push(lines[li].trim());
    }

    sections.push({
      ...def,
      title: lines[startIdx].replace(def.icon, '').replace(/[:\-\(]/g, '').trim(),
      content: contentLines.join(' ').trim()
    });
  });

  if (sections.length === 0) {
    return `<div class="goal-card-single"><p style="color:var(--text2);line-height:1.8;white-space:pre-wrap">${escapeHtml(text)}</p></div>`;
  }

  let html = '<div class="goal-card-single">';
  sections.forEach(sec => {
    html += `
      <div class="goal-section">
        <div class="goal-section-header">
          <span class="goal-section-icon">${sec.icon}</span>
          <span class="goal-section-title" style="color:${sec.color}">${escapeHtml(sec.title || sec.key)}</span>
        </div>
        <div class="goal-section-body">${escapeHtml(sec.content)}</div>
      </div>`;
  });
  html += '</div>';
  return html;
}

// ============ 수능 기출 문제 불러오기 ============

// ============ 풀이 트레이닝 - 시험지 업로드 ============
let solveImageBase64 = null;

window.handleSolveImage = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    solveImageBase64 = e.target.result.split(',')[1];
    document.getElementById('solvePreviewImg').src = e.target.result;
    document.getElementById('solvePreview').classList.remove('hidden');
    document.getElementById('solveUploadArea').classList.add('hidden');
  };
  reader.readAsDataURL(file);
};

window.resetSolveUpload = function() {
  solveImageBase64 = null;
  document.getElementById('solveImageInput').value = '';
  document.getElementById('solvePreview').classList.add('hidden');
  document.getElementById('solveUploadArea').classList.remove('hidden');
  document.getElementById('solveFeedback').classList.add('hidden');
};

window.analyzeSolveImage = async function() {
  if (!state.apiKey) { showApiKeyWarning(); return; }
  if (!solveImageBase64) { showInfoModal('📸 사진 없음', '풀이 사진을 먼저 올려주세요!'); return; }

  const feedback = document.getElementById('solveFeedback');
  feedback.classList.remove('hidden');
  feedback.innerHTML = '<span class="spinner"></span> AI가 풀이를 확인하고 있어요... (10~30초 소요)';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${state.apiKey}`;
    const body = {
      contents: [{
        parts: [
          { text: `이 사진은 수학 풀이 과정이에요. 마크다운 기호(#, **, *) 절대 사용 금지. 수식은 $...$ LaTeX 형식으로.

너는 단순히 맞다/틀리다를 판단하는 게 아니라, 학생이 수학적으로 사고하는 방법을 제대로 익힐 수 있도록 코칭하는 선생님이에요.

각 문제별로 아래 형식으로 분석해주세요:

[문제 N]
판정: ✅ 정답 / ❌ 오답 / ⚠️ 부분 정답 중 하나

📋 풀이 과정 분석
(단계별로 학생 풀이를 따라가며 각 단계가 논리적으로 맞는지 설명. 단순히 맞다/틀리다가 아니라 왜 그렇게 되는지 근거 설명. 논리가 생략된 부분은 "이 부분은 왜 그렇게 됐는지 써줘야 해요" 식으로 짚어줌)

✅ 더 좋은 풀이 방향
(답이 맞아도 더 체계적이거나 빠른 방법이 있으면 제안. 이 접근법이 왜 좋은지 이유도 설명. 학생 풀이가 이미 최선이면 "이 풀이 방식은 깔끔해요" 등 구체적 칭찬)

⚠️ 실수 포인트
(이 유형에서 자주 하는 실수, 수능 서술형에서 감점되는 포인트 한 줄)

💡 이 문제의 핵심 개념
(이 문제를 풀기 위해 반드시 이해해야 하는 개념 한 줄)` },
          { inline_data: { mime_type: 'image/jpeg', data: solveImageBase64 } }
        ]
      }],
      generationConfig: { maxOutputTokens: 4000 }
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '분석 실패';
    const hasCorrect = result.includes('✅');
    feedback.innerHTML = `<div style="font-weight:800;font-size:1rem;margin-bottom:16px;">📝 풀이 피드백</div>` + renderFeedback(result, hasCorrect);
    renderMath(feedback);
  } catch(e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
};


// ============ 기본 문제 - 다중 출제 ============
window.getBasicProblems = async function(mode) {
  if (mode === 'ai' && !state.apiKey) { showApiKeyWarning(); return; }
  const type = document.getElementById('mathType').value;
  const listWrap = document.getElementById('basicProblemList');
  listWrap.classList.remove('hidden');
  listWrap.innerHTML = '<span class="spinner"></span> 문제 불러오는 중...';
  document.getElementById('basicFeedback').classList.add('hidden');

  if (mode === 'db') {
    // 수능 DB에서 선택 과목 필터링 후 10개
    try {
      const db2 = getFirestore(undefined, 'math-study-app');
      const snap = await getDocs(collection(db2, 'questions'));
      const all = [];
      const targetSection = getSectionFromType(type);
      snap.forEach(d => {
        const item = d.data();
        if (!targetSection || item.section === targetSection || item.section === '공통') {
          all.push(item);
        }
      });
      if (all.length === 0) {
        listWrap.innerHTML = '<p style="color:var(--text2);padding:16px;">해당 과목의 기출 문제가 없어요.</p>';
        return;
      }
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 10);
      renderMultiProblems(shuffled, listWrap, 'basic', 'db');
    } catch(e) {
      listWrap.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
    }
  } else {
    // AI로 5개 순차 생성
    listWrap.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const itemEl = document.createElement('div');
      itemEl.className = 'multi-problem-item';
      itemEl.innerHTML = `<span class="spinner"></span> 문제 ${i+1}/5 생성 중...`;
      listWrap.appendChild(itemEl);

      const isMultiple = Math.random() < 0.5;
      const choiceStr = isMultiple ? '객관식 선택지 ①②③④⑤ 포함' : '서술형 선택지 없음';
      const prompt = '수능 수학 [' + type + '] 유형 문제 1개. 수식 LaTeX $..$ 형식. ' + choiceStr + '. 형식: 문제:(내용) 정답:(답) 힌트:(핵심개념+풀이방향 2~3줄)';
      try {
        const result = await callGemini(prompt, 3000);
        const hintMatch = result.match(/힌트[：:]\s*(.+)/);
        const hint = hintMatch ? hintMatch[1] : '';
        const visibleText = result.replace(/\n?정답[：:][\s\S]*?(?=\n힌트|$)/, '').replace(/\n?힌트[：:].+/, '').trim();
        const answerMatch = result.match(/정답[：:]\s*([^\n]+)/);
        const answer = answerMatch ? answerMatch[1].trim() : '';
        itemEl.innerHTML = renderMultiProblemItem(i+1, visibleText, hint, answer, 'basic', 'ai', type);
        renderMath(itemEl);
      } catch(e) {
        itemEl.innerHTML = `<div style="color:var(--red)">문제 ${i+1} 생성 실패 (잠시 후 다시 시도해주세요)</div>`;
      }
      if (i < 4) await new Promise(r => setTimeout(r, 1200));
    }
    attachChoiceListeners(listWrap);
  }
};


// ============ 유형 집중 - 다중 출제 ============
window.startIntensiveMulti = async function(mode) {
  if (mode === 'ai' && !state.apiKey) { showApiKeyWarning(); return; }
  const targetType = state.weakTypes[0] || '수열';
  const listWrap = document.getElementById('intensiveProblemList');
  listWrap.classList.remove('hidden');
  listWrap.innerHTML = '<span class="spinner"></span> 문제 불러오는 중...';
  document.getElementById('intensiveFeedback').classList.add('hidden');

  if (mode === 'db') {
    try {
      const db2 = getFirestore(undefined, 'math-study-app');
      const snap = await getDocs(collection(db2, 'questions'));
      const all = [];
      const targetSection = getSectionFromType(targetType);
      snap.forEach(d => {
        const item = d.data();
        if (!targetSection || item.section === targetSection || item.section === '공통') {
          all.push(item);
        }
      });
      if (all.length === 0) {
        listWrap.innerHTML = '<p style="color:var(--text2);padding:16px;">해당 유형의 기출 문제가 없어요.</p>';
        return;
      }
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 10);
      renderMultiProblems(shuffled, listWrap, 'intensive', 'db');
    } catch(e) {
      listWrap.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
    }
  } else {
    listWrap.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const itemEl = document.createElement('div');
      itemEl.className = 'multi-problem-item';
      itemEl.innerHTML = `<span class="spinner"></span> 문제 ${i+1}/5 생성 중...`;
      listWrap.appendChild(itemEl);

      const prompt = '수능 수학 [' + targetType + '] 집중 트레이닝 문제 1개. 수식: LaTeX $..$ 형식. 객관식 ①②③④⑤ 선택지 포함. 형식: 문제:(내용) 정답:(번호) 힌트:(핵심개념+풀이방향 2~3줄)';
      try {
        const result = await callGemini(prompt, 3000);
        const hintMatch = result.match(/힌트[：:]\s*(.+)/);
        const hint = hintMatch ? hintMatch[1] : '';
        const visibleText = result.replace(/\n?정답[：:][\s\S]*?(?=\n힌트|$)/, '').replace(/\n?힌트[：:].+/, '').trim();
        const answerMatch = result.match(/정답[：:]\s*([^\n]+)/);
        const answer = answerMatch ? answerMatch[1].trim() : '';
        itemEl.innerHTML = renderMultiProblemItem(i+1, visibleText, hint, answer, 'intensive', 'ai', targetType);
        renderMath(itemEl);
      } catch(e) {
        itemEl.innerHTML = `<div style="color:var(--red)">문제 ${i+1} 생성 실패 (잠시 후 다시 시도해주세요)</div>`;
      }
      if (i < 4) await new Promise(r => setTimeout(r, 1200));
    }
    attachChoiceListeners(listWrap);
  }
};

// ============ 다중 문제 공통 렌더러 ============
function renderMultiProblems(items, wrap, section, mode) {
  wrap.innerHTML = '';
  items.forEach((item, i) => {
    const nums = ['①','②','③','④','⑤'];
    let choicesText = '';
    if (item.choices && Array.isArray(item.choices)) {
      choicesText = '\n\n' + item.choices.map((c, ci) => `${nums[ci] || (ci+1)} ${c}`).join('  ');
    }
    const subject = item.section || item.subject || '수능 기출';
    const year = item.year || '';
    const form = item.form ? ` (${item.form})` : '';
    const num = item.number || item.번호 || (i+1);
    const question = item.question || item.문제 || '';
    const answer = String(item.answer_index || item.정답 || item.answer || '');
    const text = `${question}${choicesText}`;

    const el = document.createElement('div');
    el.className = 'multi-problem-item';
    el.innerHTML = renderMultiProblemItem(i+1, text, '', answer, section, mode, subject, year+form);
    wrap.appendChild(el);
    renderMath(el);
  });
  attachChoiceListeners(wrap);
}

function renderMultiProblemItem(idx, text, hint, answer, section, mode, type, extra) {
  const extraLabel = extra ? `<span style="font-size:0.8rem;color:var(--text3);margin-left:8px;">${extra}</span>` : '';
  return `
    <div class="multi-problem-card" data-answer="${answer}" data-hint="${hint.replace(/"/g,"'")}">
      <div class="multi-problem-header">
        <span class="multi-problem-num">문제 ${idx}</span>
        <span style="font-size:0.82rem;color:var(--text2);">${type || ''}${extraLabel}</span>
      </div>
      <div class="multi-problem-body">${renderProblemHTML(text)}</div>
      <div class="multi-answer-area" id="ans-area-${section}-${idx}">
        ${text.includes('①') ? '' : `<input type="text" class="text-input multi-ans-input" placeholder="답 입력" data-idx="${idx}" data-section="${section}" style="margin-top:8px;" />`}
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button class="btn-primary" style="padding:8px 16px;font-size:0.85rem;" onclick="checkMultiAnswer(this, '${section}', ${idx})">✅ 확인</button>
          ${hint ? `<button class="btn-ghost hint-btn" style="padding:8px 12px;font-size:0.85rem;" onclick="showMultiHint(this)">💡 힌트</button>` : ''}
        </div>
        <div class="multi-result-box hidden" id="result-${section}-${idx}"></div>
      </div>
    </div>`;
}

function attachChoiceListeners(wrap) {
  wrap.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.multi-problem-card');
      card.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

window.showMultiHint = function(btn) {
  const card = btn.closest('.multi-problem-card');
  const hint = card.dataset.hint;
  if (hint) showInfoModal('💡 힌트', hint);
};

window.checkMultiAnswer = async function(btn, section, idx) {
  if (!state.apiKey) { showApiKeyWarning(); return; }
  const card = btn.closest('.multi-problem-card');
  const correctAnswer = card.dataset.answer;
  const selectedBtn = card.querySelector('.choice-btn.selected');
  const textInput = card.querySelector('.multi-ans-input');
  const userAns = selectedBtn ? selectedBtn.dataset.val : (textInput ? textInput.value.trim() : '');
  
  if (!userAns) { showInfoModal('✏️ 입력 필요', '답을 선택하거나 입력해주세요!'); return; }

  const resultBox = document.getElementById(`result-${section}-${idx}`);
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = '<span class="spinner"></span> 채점 중...';
  btn.disabled = true;

  const problemText = card.querySelector('.multi-problem-body').innerText;
  const prompt = `문제: ${problemText}\n정답: ${correctAnswer}\n학생 답: ${userAns}\n\n마크다운 기호 금지. 수식은 $...$ 형식.\n\n판정: ✅ 정답 / ❌ 오답\n\n📋 풀이\n(단계별)\n\n∴ 최종 답: ${correctAnswer}\n\n💡 핵심 팁\n(한 줄)`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = result.includes('✅') && !result.includes('❌');
    resultBox.innerHTML = renderFeedback(result, isCorrect);
    renderMath(resultBox);
    const type = card.querySelector('[style*="text2"]')?.textContent || '기타';
    incrementProblems(isCorrect, problemText, userAns, correctAnswer, type);
  } catch(e) {
    resultBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
    btn.disabled = false;
  }
};

async function getSuneungProblem() {
  const problemBox = document.getElementById('solveProblem');
  problemBox.classList.remove('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 기출 문제 불러오는 중...';
  document.getElementById('solveInput').classList.add('hidden');
  document.getElementById('solveFeedback').classList.add('hidden');
  document.getElementById('solveGraph').classList.add('hidden');

  try {
    const db2 = getFirestore(undefined, 'math-study-app');
    const snap = await getDocs(collection(db2, 'questions'));
    const all = [];
    snap.forEach(d => all.push(d.data()));

    if (all.length === 0) { problemBox.innerHTML = '<span style="color:var(--red)">기출 문제가 없어요.</span>'; return; }

    const item = all[Math.floor(Math.random() * all.length)];

    // 선택지 파싱
    let choicesText = '';
    if (item.choices && Array.isArray(item.choices)) {
      const nums = ['①','②','③','④','⑤'];
      choicesText = '\n\n' + item.choices.map((c, i) => `${nums[i] || (i+1)} ${c}`).join('  ');
    }

    const subject = item.section || item.subject || item.과목 || '수능 기출';
    const year = item.year || item.학년도 || '';
    const form = item.form ? ` (${item.form})` : '';
    const num = item.number || item.번호 || '';
    const question = item.question || item.문제 || '';
    const score = item.score ? ` [${item.score}점]` : '';

    const text = `[유형: ${subject}${score}]\n문제 ${num}. ${question}${choicesText}`;
    state.currentProblem = text;
    state.currentAnswer = String(item.answer_index || item.정답 || item.answer || '');

    problemBox.innerHTML = `<strong>📝 수능 기출 (${year}${form})</strong><br/><br/>` + renderProblemHTML(text);
    renderMath(problemBox);
    showSolveInputType(text);
  } catch(e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}
window.getSuneungProblem = getSuneungProblem;

// ============ SOLVE TRAINING ============
async function getSolveProblem() {
  if (!state.apiKey) { showApiKeyWarning(); return; }

  const isMultipleChoice = Math.random() < 0.5;
  const problemBox = document.getElementById('solveProblem');
  problemBox.classList.remove('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 문제 생성 중...';
  document.getElementById('solveInput').classList.add('hidden');
  document.getElementById('solveFeedback').classList.add('hidden');
  document.getElementById('solveGraph').classList.add('hidden');

  const prompt = `수능 수학 문제를 1개 만들어주세요.
난이도: ${state.currentGrade !== '-' ? state.currentGrade + '등급 수준' : '중간 난이도'}
요구사항:
- 풀이 과정을 단계적으로 써야 하는 문제
- 문제만 제시 (정답, 풀이 불포함)
- 문제 번호와 유형 명시
- 수식은 $...$ LaTeX 형식으로
${isMultipleChoice ? '- 객관식: 선택지 ①②③④⑤ 포함' : '- 서술형: 선택지 없이 숫자/식으로 답'}

형식:
[유형: ___]
문제: ___

좌표, 원, 직선, 포물선, 벡터, 삼각형 등 그래프 표현 가능한 문제라면 반드시 DESMOS 블록 포함:
DESMOS_START
(Desmos LaTeX 수식 그대로 사용. 설명 금지)
y=2x-1
x^{2}+y^{2}=9
(x-1)^{2}+(y-3)^{2}=5
(1,3)|A
(5,1)|B
DESMOS_END

중요:
- 원: (x-a)^{2}+(y-b)^{2}=r^{2} 형식
- 직선: y=mx+b 또는 x=c 형식
- 포물선: y=ax^{2}+bx+c 형식
- 타원: \frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=1 형식
- 삼각형: 꼭짓점 점 3개 + polygon(x1,y1,x2,y2,x3,y3) 로 면 표시
- 벡터 조건 PA·PB=k: 원의 방정식으로 변환해서 표현
- 3D 문제(구, 공간벡터 등)는 DESMOS 블록 생략
- 그래프 불가능한 문제만 블록 생략`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;

    // Desmos 수식 파싱 후 문제 텍스트에서 제거
    const exprs = parseDesmosExpressions(result);
    const cleanResult = result.replace(/DESMOS_START[\s\S]*?DESMOS_END/, '').trim();

    problemBox.innerHTML = `<strong>📝 문제</strong><br/><br/>` + renderProblemHTML(cleanResult);
    renderMath(problemBox);

    // 기하 문제면 그래프 표시, 아니면 숨기기
    if (exprs.length > 0) {
      renderDesmos('solveGraphEl', 'solveGraph', exprs);
    } else {
      document.getElementById('solveGraph').classList.add('hidden');
    }

    // 객관식/서술형 분리
    showSolveInputType(cleanResult);
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

function showSolveInputType(problemText) {
  const isMultiple = /[①②③④⑤]/.test(problemText);
  const solveInput = document.getElementById('solveInput');
  const choiceInput = document.getElementById('solveChoiceInput');
  const textInput = document.getElementById('solveTextInput');
  solveInput.classList.remove('hidden');
  if (isMultiple) {
    choiceInput.classList.remove('hidden');
    textInput.classList.add('hidden');
    // 선택지 클릭 시 바로 제출
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => checkSolve(), 300);
      });
    });
  } else {
    choiceInput.classList.add('hidden');
    textInput.classList.remove('hidden');
    document.getElementById('solveTxt').value = '';
  }
  selectedChoice = '';
}

async function checkSolve() {
  if (!state.apiKey) { showApiKeyWarning(); return; }
  const solve = document.getElementById('solveTxt').value.trim();
  if (!solve && !selectedChoice) { showInfoModal('✏️ 풀이 입력', '서술형 문제는 풀이 과정을 입력해주세요!'); return; }

  const feedback = document.getElementById('solveFeedback');
  feedback.classList.remove('hidden');
  feedback.innerHTML = '<span class="spinner"></span> AI가 피드백 중...';

  const prompt = `수능 수학 문제와 학생의 풀이 과정을 평가해주세요.
마크다운 기호(#, **, *) 절대 사용 금지. 섹션 제목은 이모지로만 구분.

문제: ${state.currentProblem}

학생 풀이:
${solve}

아래 형식으로 정확히 작성:

판정: ✅ 정답 / ❌ 오답 중 하나만

✅ 잘한 점
(구체적으로 한 줄)

🔧 개선할 점
(구체적으로 한 줄)

📋 올바른 풀이
(단계별로, 번호 사용)

💡 핵심 팁
(이 유형 핵심 한 줄)`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = result.includes('✅') && !result.includes('❌');
    feedback.innerHTML = renderFeedback(result, isCorrect);
    renderMath(feedback);
    incrementProblems(isCorrect);
  } catch (e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

// ============ BASIC PROBLEM ============
async function getBasicProblem() {
  if (!state.apiKey) { showApiKeyWarning(); return; }

  const isMultipleChoice = Math.random() < 0.5;
  const type = document.getElementById('mathType').value;
  const problemBox = document.getElementById('basicProblem');
  problemBox.classList.remove('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 문제 생성 중...';
  document.getElementById('basicInput').classList.add('hidden');
  document.getElementById('basicFeedback').classList.add('hidden');
  state.currentHint = null;

  const gradeLevel = state.currentGrade !== '-' ? state.currentGrade + '등급 수준' : '중간';
  const choiceType = isMultipleChoice ? '선택지 ①②③④⑤ 포함한 객관식으로 출제' : '선택지 없이 서술형으로 출제 (정수나 식으로 답)';
  const prompt = `수능 수학 [${type}] 유형 문제 1개를 만들어주세요.
난이도: ${gradeLevel}
수식은 $...$ LaTeX 형식으로.

형식 (반드시 지켜주세요):
문제: (문제 내용)
${choiceType}
정답: (숫자나 간단한 답)
힌트: (핵심 개념 + 첫 번째 풀이 방향 2~3줄. 어떤 공식/개념을 쓰는지 명시)

좌표, 원, 직선, 포물선, 타원, 쌍곡선, 벡터, 삼각형 등 그래프 표현 가능한 문제라면 반드시 DESMOS 블록 포함:
DESMOS_START
(Desmos LaTeX 수식 그대로 사용. 설명 금지)
y=2x-1
x^{2}+y^{2}=9
(x-1)^{2}+(y-3)^{2}=5
\frac{x^{2}}{4}+\frac{y^{2}}{9}=1
y=x^{2}-2x+3
(1,3)|A
(5,1)|B
DESMOS_END

중요:
- 원: (x-a)^{2}+(y-b)^{2}=r^{2} 형식
- 직선: y=mx+b 또는 x=c 형식
- 포물선: y=ax^{2}+bx+c 형식
- 절댓값 함수: y=\left|2x-5\right| 형식 (\left| \right| 사용)
- 타원: \frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=1 형식
- 쌍곡선: \frac{x^{2}}{a^{2}}-\frac{y^{2}}{b^{2}}=1 형식
- 부등식 영역: y<2x+1 또는 y>x^{2} 형식으로 그리면 영역 색칠됨
- 삼각형: 꼭짓점 점 3개 + polygon(x1,y1,x2,y2,x3,y3) 로 면 표시
- 사각형: 꼭짓점 점 4개 + polygon(x1,y1,x2,y2,x3,y3,x4,y4) 로 면 표시
- 벡터 조건 PA·PB=k: 원의 방정식으로 변환해서 표현
- 3D 문제(구, 공간벡터 등)는 DESMOS 블록 생략
- 그래프 불가능한 문제만 블록 생략
중요: 정답 반드시 포함.`;

  try {
    const result = await callGemini(prompt, 6000);
    state.currentProblem = result;

    // Desmos 수식 파싱
    const exprs = parseDesmosExpressions(result);
    const cleanResult = result.replace(/DESMOS_START[\s\S]*?DESMOS_END/, '').trim();

    // 힌트와 정답 파싱
    const hintMatch = cleanResult.match(/힌트[：:]\s*(.+)/);
    state.currentHint = hintMatch ? hintMatch[1] : '풀이 과정을 단계별로 생각해보세요.';
    const visibleText = cleanResult.replace(/\n?정답[：:][\s\S]*?(?=\n힌트|$)/, '').replace(/\n?힌트[：:].+/, '');

    problemBox.innerHTML = `<strong>📝 문제 [${type}]</strong><br/><br/>` + renderProblemHTML(visibleText);
    renderMath(problemBox);

    // 기하 문제면 그래프 표시
    if (exprs.length > 0) {
      renderDesmos('basicGraphEl', 'basicGraph', exprs);
    } else {
      document.getElementById('basicGraph').classList.add('hidden');
      document.getElementById('basicGraphEl').innerHTML = '';
    }

    // 선택지 있으면 입력창 숨기기
    const hasChoices = visibleText.includes('①');
    document.getElementById('basicInput').classList.remove('hidden');
    document.getElementById('basicAns').style.display = hasChoices ? 'none' : '';
    document.getElementById('basicAns').value = '';
    selectedChoice = '';
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

async function checkBasic() {
  if (!state.apiKey) return;
  // 선택지 클릭 또는 텍스트 입력 둘 다 지원
  const ans = selectedChoice || document.getElementById('basicAns').value.trim();
  if (!ans) { showInfoModal('✏️ 입력 필요', '답을 선택하거나 입력해주세요!'); return; }

  const type = document.getElementById('mathType')?.value || '기타';
  const feedback = document.getElementById('basicFeedback');
  feedback.classList.remove('hidden');
  feedback.innerHTML = '<span class="spinner"></span> 채점 중...';

  const prompt = `문제: ${state.currentProblem}
학생 답: ${ans}

마크다운 기호(#, **, *) 절대 사용 금지. 수식은 반드시 $...$ LaTeX 형식으로. 아래 형식으로만 작성:

판정: ✅ 정답 / ❌ 오답 중 하나만
정답: (객관식이면 ①②③④⑤ 번호, 서술형이면 값)

📋 풀이
(단계별, 번호 사용. 각 단계 사이 빈 줄 추가. 수식은 $...$ 형식)

∴ 최종 답: (정답을 굵게 강조해서 마지막에 한 번 더)

💡 핵심 팁
(틀리지 않기 위한 핵심 한 줄)`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = result.includes('✅') && !result.includes('❌');
    // 정답 파싱
    const correctMatch = result.match(/정답[：:]\s*([^\n]+)/);
    const correctAns = correctMatch ? correctMatch[1].trim() : '?';
    feedback.innerHTML = renderFeedback(result, isCorrect);
    renderMath(feedback);
    incrementProblems(isCorrect, state.currentProblem, ans, correctAns, type);
  } catch (e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}
function showInfoModal(title, message) {
  const old = document.getElementById('infoModal');
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.id = 'infoModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(74,144,226,0.18);">
      <div style="font-size:1.05rem;font-weight:800;color:#4A90E2;margin-bottom:12px;">${title}</div>
      <div style="font-size:0.95rem;color:#1a2340;line-height:1.7;">${message}</div>
      <button onclick="document.getElementById('infoModal').remove()" style="margin-top:20px;width:100%;background:linear-gradient(135deg,#4A90E2,#6B7EC9);color:#fff;border:none;border-radius:10px;padding:11px;font-size:0.95rem;font-weight:700;cursor:pointer;">확인</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.showInfoModal = showInfoModal;

function getHint() {
  if (!state.currentHint) { showInfoModal('💡 힌트', '먼저 문제를 받아주세요!'); return; }
  const old = document.getElementById('hintModal');
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.id = 'hintModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:480px;width:90%;box-shadow:0 8px 32px rgba(74,144,226,0.18);position:relative;">
      <div style="font-size:1.1rem;font-weight:800;color:#4A90E2;margin-bottom:14px;">💡 힌트</div>
      <div id="hintModalBody" style="font-size:0.95rem;color:#1a2340;line-height:1.9;">${state.currentHint}</div>
      <button onclick="document.getElementById('hintModal').remove()" style="margin-top:20px;width:100%;background:linear-gradient(135deg,#4A90E2,#6B7EC9);color:#fff;border:none;border-radius:10px;padding:11px;font-size:0.95rem;font-weight:700;cursor:pointer;">확인</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  if (window.MathJax) MathJax.typesetPromise([document.getElementById('hintModalBody')]).catch(()=>{});
}

// ============ INTENSIVE TRAINING ============
async function startIntensive() {
  if (!state.apiKey) { showApiKeyWarning(); return; }

  const problemBox = document.getElementById('intensiveProblem');
  const feedback = document.getElementById('intensiveFeedback');
  problemBox.classList.remove('hidden');
  feedback.classList.add('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 집중 트레이닝 문제 생성 중...';

  const targetType = state.weakTypes[0] || '수열';

  const gradeStr = state.currentGrade !== '-' ? state.currentGrade + '등급' : '중간';
  const prompt = '수능 수학 [' + targetType + '] 유형 집중 트레이닝 문제 1개. 수준: ' + gradeStr + '. 수식 LaTeX $..$ 형식. 객관식 ①②③④⑤ 선택지 포함. 형식: 문제:(내용) 정답:(번호) 힌트:(핵심개념+풀이방향 2~3줄) 주의:(자주 틀리는 실수)';

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;

    const clean = result
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/---+/g, '')
      .trim();

    const hintMatch = clean.match(/힌트[：:]\s*(.+)/);
    const cautionMatch = clean.match(/주의[：:]\s*(.+)/);
    state.currentHint = hintMatch ? hintMatch[1] : '풀이 과정을 단계별로 생각해보세요.';

    const visibleText = clean
      .replace(/\n?정답[：:][\s\S]*?(?=\n힌트|\n주의|$)/, '')
      .replace(/\n?힌트[：:].+/, '')
      .replace(/\n?주의[：:].+/, '')
      .trim();

    const cautionBadge = cautionMatch
      ? `<div class="intensive-caution">⚠️ 주의: ${mathHtml(cautionMatch[1])}</div>`
      : '';

    problemBox.innerHTML = `
      <div class="intensive-problem-wrap">
        <strong>🔥 집중 트레이닝 [${targetType}]</strong>
        <div class="intensive-problem-body">${renderProblemHTML(visibleText)}</div>
        ${cautionBadge}
      </div>`;
    renderMath(problemBox);

    // 정답 입력 UI 표시
    const hasChoices = visibleText.includes('①');
    document.getElementById('intensiveFeedback').classList.add('hidden');
    let inputArea = document.getElementById('intensiveInput');
    if (!inputArea) {
      inputArea = document.createElement('div');
      inputArea.id = 'intensiveInput';
      problemBox.parentNode.insertBefore(inputArea, document.getElementById('intensiveFeedback'));
    }
    inputArea.innerHTML = hasChoices
      ? `<button class="btn-primary" onclick="checkIntensive()">✅ 정답 확인</button>`
      : `<div style="display:flex;gap:10px;margin-top:12px">
          <input type="text" id="intensiveAns" class="text-input" placeholder="답 입력" />
          <button class="btn-primary" onclick="checkIntensive()">확인</button>
        </div>`;
    selectedChoice = '';
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

// ============ FEEDBACK RENDERER ============
async function checkIntensive() {
  if (!state.apiKey) return;
  const ans = selectedChoice || document.getElementById('intensiveAns')?.value.trim() || '';
  if (!ans) { showInfoModal('✏️ 입력 필요', '답을 선택하거나 입력해주세요!'); return; }

  const targetType = state.weakTypes[0] || '기타';
  const feedback = document.getElementById('intensiveFeedback');
  feedback.classList.remove('hidden');
  feedback.innerHTML = '<span class="spinner"></span> 채점 중...';

  const prompt = `문제: ${state.currentProblem}
학생 답: ${ans}
마크다운 기호 절대 사용 금지. 아래 형식으로만:

판정: ✅ 정답 / ❌ 오답 중 하나만
정답: (객관식이면 ①②③④⑤ 번호, 서술형이면 값)

✅ 잘한 점
(한 줄)

🔧 개선할 점
(한 줄)

📋 풀이
(단계별, 번호 사용. 각 단계 사이 빈 줄. 수식은 $...$ LaTeX 형식)

∴ 최종 답: (정답을 마지막에 한 번 더 강조)

💡 핵심 팁
(한 줄)`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = result.includes('✅') && !result.includes('❌');
    const correctMatch = result.match(/정답[：:]\s*([^\n]+)/);
    const correctAns = correctMatch ? correctMatch[1].trim() : '?';
    feedback.innerHTML = renderFeedback(result, isCorrect);
    renderMath(feedback);
    incrementProblems(isCorrect, state.currentProblem, ans, correctAns, targetType);
  } catch (e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}
window.checkIntensive = checkIntensive;
function renderFeedback(raw, isCorrect) {
  // 마크다운 제거
  const text = raw
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .trim();

  // 정답 파싱
  const answerMatch = text.match(/^정답[：:]\s*(.+)$/m);
  const answerText = answerMatch ? answerMatch[1].trim() : '';
  const verdict = isCorrect
    ? `<div class="feedback-verdict correct">✅ 정답!${answerText ? ` <span style="font-size:0.9rem;opacity:0.85">(${answerText})</span>` : ''}</div>`
    : `<div class="feedback-verdict wrong">❌ 오답${answerText ? ` <span style="font-size:0.9rem;opacity:0.85">— 정답: ${answerText}</span>` : ''}</div>`;

  // 섹션 파싱
  const sectionMap = [
    { icon: '✅', label: '잘한 점', color: '#34C759' },
    { icon: '🔧', label: '개선할 점', color: '#FF9500' },
    { icon: '📋', label: '풀이', color: '#4A90E2' },
    { icon: '💡', label: '핵심 팁', color: '#5856D6' },
  ];

  const lines = text.split('\n');
  let sectionsHtml = '';
  let currentSection = null;
  let currentLines = [];

  const flush = () => {
    if (!currentSection) return;
    // ∴ 줄 분리해서 처리
    const plainLines = [];
    const finalLines = [];
    let hasFinal = false;
    currentLines.forEach(l => {
      if (l.startsWith('∴')) { hasFinal = true; finalLines.push(l); }
      else { plainLines.push(l); }
    });
    const body = plainLines.filter(l => l.trim()).join('\n').trim();
    const finalBody = finalLines.join(' ').trim();
    if (!body && !finalBody) return;
    let html = '';
    if (body) html += mathHtml(body);
    if (finalBody) html += `<div style="margin-top:12px;padding:10px 14px;background:rgba(74,144,226,0.1);border-left:3px solid #4A90E2;border-radius:6px;font-weight:700;color:#1a2340;">${mathHtml(finalBody)}</div>`;
    sectionsHtml += `
      <div class="feedback-section">
        <div class="feedback-section-title" style="color:${currentSection.color}">
          ${currentSection.icon} ${currentSection.label}
        </div>
        <div class="feedback-section-body" style="line-height:2;">${html}</div>
      </div>`;
    currentLines = [];
  };

  lines.forEach(line => {
    const matched = sectionMap.find(s => line.includes(s.icon) && line.includes(s.label));
    if (matched) {
      flush();
      currentSection = matched;
    } else if (currentSection && !line.match(/^판정:/) && !line.match(/^정답:/)) {
      currentLines.push(line);
    }
  });
  flush();

  if (!sectionsHtml) {
    sectionsHtml = `<div class="feedback-section-body" style="padding:0">${mathHtml(text)}</div>`;
  }

  return `<div class="feedback-wrap">${verdict}${sectionsHtml}</div>`;
}

// ============ 커리큘럼 → 오늘의 목표 연계 ============
function applyTodayGoal() {
  if (!state.curriculum) return;
  const dayOfMonth = new Date().getDate();
  const startDay = state.curriculum.startDay || 1;
  const todayPlan = state.curriculum.daily?.[dayOfMonth - startDay];
  if (!todayPlan) return;

  // 기본 문제 드롭다운 자동 설정
  const mathTypeEl = document.getElementById('mathType');
  if (mathTypeEl && todayPlan.types?.[0]) {
    const options = Array.from(mathTypeEl.options);
    const match = options.find(o => o.value.includes(todayPlan.types[0]) || todayPlan.types[0].includes(o.value));
    if (match) mathTypeEl.value = match.value;
  }

  // 유형 집중 약점 유형 자동 설정
  if (todayPlan.weakFocus) {
    state.weakTypes = [todayPlan.weakFocus, ...state.weakTypes.filter(t => t !== todayPlan.weakFocus)];
  }
}

// ============ GENERATE CURRICULUM ============
async function generateCurriculum(analysisText) {
  if (!state.apiKey) return;
  const now = new Date();

  // 이번 달 실제 일수 계산
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remaining = daysInMonth - now.getDate() + 1; // 오늘 포함 남은 날
  const curriculumDays = Math.max(remaining, 7); // 최소 7일

  const prompt = `수능 수학 성적 분석 결과를 바탕으로 오늘(${now.getDate()}일)부터 이번 달 말(${daysInMonth}일)까지 총 ${curriculumDays}일 학습 커리큘럼을 만들어주세요.
마크다운 기호 절대 사용 금지. 반드시 아래 JSON 형식으로만 응답하세요.

성적 분석:
${analysisText}

응답 형식 (JSON만, 다른 텍스트 없이):
{
  "month": "${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}",
  "startDay": ${now.getDate()},
  "totalDays": ${curriculumDays},
  "summary": "한 줄 요약",
  "daily": [
    {
      "day": ${now.getDate()},
      "types": ["유형1", "유형2"],
      "count": 8,
      "weakFocus": "집중할 약점 유형",
      "goal": "오늘의 목표 한 줄"
    }
  ]
}

규칙:
- 전체 ${curriculumDays}일을 균등하게 4구간으로 나눠서:
  1구간: 가장 약한 유형 집중
  2구간: 두 번째 약점 유형
  3구간: 전체 유형 균형
  4구간: 실전 대비 + 총정리
- daily 배열은 반드시 ${curriculumDays}개 (오늘부터 말일까지)
- count는 하루 풀 문제 수 (6~12개)`;

  try {
    const result = await callGemini(prompt);
    const clean = result.replace(/```json|```/g, '').trim();
    let curriculum;
    try {
      curriculum = JSON.parse(clean);
    } catch(parseErr) {
      // JSON 파싱 실패 시 재시도 없이 알림
      const goalContent = document.getElementById('goalContent');
      if (goalContent) goalContent.innerHTML = `
        <div style="padding:20px;text-align:center;color:var(--text2);">
          <div style="font-size:1.5rem;margin-bottom:8px">⚠️</div>
          <p>커리큘럼 생성에 실패했어요.<br/>성적표를 다시 업로드해주세요.</p>
          <button class="btn-primary" onclick="navigateTo('analyze')" style="margin-top:12px">📸 다시 시도</button>
        </div>`;
      return null;
    }
    state.curriculum = curriculum;
    localStorage.removeItem('curriculum');
    await saveCurriculumToFirestore(curriculum);
    applyTodayGoal();
    generateGoal();
    return curriculum;
  } catch (e) {
    console.error('커리큘럼 생성 오류:', e);
    return null;
  }
}

// ============ D-DAY 카운터 ============
function updateDday() {
  const el = document.getElementById('ddayCount');
  if (!el) return;
  // 2027학년도 수능: 2026년 11월 19일
  const suneung = new Date('2026-11-19');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.round((suneung - today) / (1000 * 60 * 60 * 24));
  el.textContent = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-Day! 🎉' : `D+${Math.abs(diff)}`;
}

// ============ 오답 노트 ============
function saveWrongNote(problem, myAnswer, correctAnswer, type) {
  const notes = JSON.parse(localStorage.getItem('wrong_notes') || '[]');
  const cleanProb = problem.replace(/DESMOS_START[\s\S]*?DESMOS_END/g, '').trim();
  notes.unshift({ id: Date.now(), problem: cleanProb.substring(0, 1000), myAnswer, correctAnswer, type: type || '기타', date: new Date().toLocaleDateString('ko'), retried: false });
  if (notes.length > 50) notes.pop();
  localStorage.setItem('wrong_notes', JSON.stringify(notes));
  try { saveToFirestore('data/wrong_notes', { notes }); } catch(e) {}
}

function renderWrongNotes() {
  const list = document.getElementById('wrongNoteList');
  const countEl = document.getElementById('wrongNoteCount');
  if (!list) return;
  const notes = JSON.parse(localStorage.getItem('wrong_notes') || '[]');
  if (countEl) countEl.textContent = notes.length + '문제';
  if (notes.length === 0) { list.innerHTML = '<p class="empty-hint">틀린 문제가 자동으로 저장돼요</p>'; return; }
  list.innerHTML = notes.map((n, i) => `
    <div class="wrong-note-item ${n.retried ? 'retried' : ''}">
      <div class="wrong-note-meta">
        <span class="wrong-note-type">${n.type}</span>
        <span class="wrong-note-date">${n.date}</span>
        ${n.retried ? '<span class="wrong-retried-badge">✅ 재도전 완료</span>' : ''}
      </div>
      <div class="wrong-note-problem math-problem">${mathHtml(n.problem.replace(/DESMOS_START[\s\S]*?DESMOS_END/g,"").trim().substring(0,120))}...</div>
      <div class="wrong-note-ans">
        <span style="color:var(--red)">내 답: ${escapeHtml(n.myAnswer)}</span>
        &nbsp;→&nbsp;
        <span style="color:var(--green)">정답: ${escapeHtml(n.correctAnswer)}</span>
      </div>
      <button class="btn-retry" onclick="retryWrongNote(${i})">🔄 다시 풀기</button>
    </div>`).join('');
  if (window.MathJax) MathJax.typesetPromise([list]).catch(()=>{});
}
window.retryWrongNote = function(idx) {
  const notes = JSON.parse(localStorage.getItem('wrong_notes') || '[]');
  const note = notes[idx];
  if (!note) return;
  navigateTo('training');
  switchTab('solve');
  const problemBox = document.getElementById('solveProblem');
  if (problemBox) {
    state.currentProblem = note.problem;
    const cleanProblem = note.problem.replace(/DESMOS_START[\s\S]*?DESMOS_END/g, '').trim();
    problemBox.innerHTML = `<strong>📝 오답 재도전 [${note.type}]</strong><br/><br/>${mathHtml(cleanProblem)}`;
    problemBox.classList.remove('hidden');
    renderMath(problemBox);
    // 그래프 다시 그리기
    const retryExprs = parseDesmosExpressions(note.problem);
    if (retryExprs.length > 0) {
      renderDesmos('solveGraphEl', 'solveGraph', retryExprs);
    } else {
      document.getElementById('solveGraph')?.classList.add('hidden');
    }
    document.getElementById('solveInput')?.classList.remove('hidden');
    notes[idx].retried = true;
    localStorage.setItem('wrong_notes', JSON.stringify(notes));
    try { saveToFirestore('data/wrong_notes', { notes }); } catch(e) {}
  }
};

// ============ 단원별 진도표 ============
const MATH_UNITS = [
  { subject: '📘 공통수학', units: ['수와 연산', '방정식과 부등식', '함수', '수열'] },
  { subject: '📙 수학 I', units: ['지수와 로그', '삼각함수'] },
  { subject: '📗 수학 II', units: ['함수의 극한과 연속', '미분', '적분'] },
  { subject: '📈 미적분 (선택)', units: ['수열의 극한', '미분법', '적분법'] },
  { subject: '📊 확률과 통계 (선택)', units: ['경우의 수', '확률', '통계'] },
  { subject: '📐 기하 (선택)', units: ['이차곡선', '평면벡터', '공간도형과 공간좌표'] },
];

function renderProgressTable() {
  const el = document.getElementById('progressTable');
  if (!el) return;
  const progress = JSON.parse(localStorage.getItem('unit_progress') || '{}');
  el.innerHTML = MATH_UNITS.map(subj => `
    <div class="progress-subject">
      <div class="progress-subject-name">${subj.subject}</div>
      <div class="progress-units">
        ${subj.units.map(unit => {
          const done = progress[unit] || 0;
          const pct = Math.min(done * 20, 100);
          const color = pct >= 80 ? 'var(--green)' : pct >= 40 ? 'var(--accent)' : '#FF9500';
          return `<div class="progress-unit">
            <span class="progress-unit-name">${unit}</span>
            <div class="progress-unit-bar"><div class="progress-unit-fill" style="width:${pct}%;background:${color}"></div></div>
            <span class="progress-unit-pct">${done}회</span>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function updateUnitProgress(unitName) {
  if (!unitName) return;
  const progress = JSON.parse(localStorage.getItem('unit_progress') || '{}');
  progress[unitName] = (progress[unitName] || 0) + 1;
  localStorage.setItem('unit_progress', JSON.stringify(progress));
  try { saveToFirestore('data/unit_progress', { progress }); } catch(e) {}
}

// ============ 성적 예측 ============
function renderScorePrediction() {
  const el = document.getElementById('scorePrediction');
  if (!el) return;
  if (state.scoreHistory.length < 2) { el.innerHTML = '<p class="empty-hint">성적 기록이 2개 이상 쌓이면 예측이 표시돼요</p>'; return; }
  const recent = state.scoreHistory.slice(-3);
  const avg = recent.reduce((s, h) => s + h.score, 0) / recent.length;
  const trend = recent.length >= 2 ? recent[recent.length-1].score - recent[0].score : 0;
  const predicted = Math.min(100, Math.max(0, Math.round(avg + trend * 0.5)));
  const predictedGrade = predicted >= 92 ? 1 : predicted >= 84 ? 2 : predicted >= 74 ? 3 : predicted >= 62 ? 4 : predicted >= 50 ? 5 : 6;
  const trendText = trend > 0 ? `📈 +${trend}점 상승 추세` : trend < 0 ? `📉 ${trend}점 하락 추세` : '➡️ 유지 추세';
  el.innerHTML = `<div class="prediction-content">
    <div class="prediction-main">
      <div class="prediction-score">${predicted}점</div>
      <div class="prediction-grade">${predictedGrade}등급 예상</div>
    </div>
    <div class="prediction-detail">
      <p>${trendText}</p>
      <p>최근 ${recent.length}회 평균: ${Math.round(avg)}점</p>
      <p style="color:var(--text3);font-size:0.78rem">* 참고용 예측입니다</p>
    </div>
  </div>`;
}

// ============ 틀린 문제 패턴 ============
function renderErrorPattern() {
  const el = document.getElementById('errorPattern');
  if (!el) return;
  const notes = JSON.parse(localStorage.getItem('wrong_notes') || '[]');
  if (notes.length < 3) { el.innerHTML = '<p class="empty-hint">틀린 문제 3개 이상 쌓이면 패턴이 분석돼요</p>'; return; }
  const typeCounts = {};
  notes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });
  const sorted = Object.entries(typeCounts).sort((a,b) => b[1]-a[1]);
  const total = notes.length;
  el.innerHTML = sorted.slice(0, 4).map(([type, count]) => {
    const pct = Math.round(count / total * 100);
    return `<div class="pattern-item">
      <div class="pattern-type">${type}</div>
      <div class="pattern-bar-wrap"><div class="pattern-bar" style="width:${pct}%"></div></div>
      <span class="pattern-pct">${count}회</span>
    </div>`;
  }).join('');
}

// ============ 배지 시스템 ============
const BADGES = [
  { id: 'first', icon: '🌱', name: '첫 걸음', desc: '첫 문제 풀기', check: (s) => s.totalProblems >= 1 },
  { id: 'ten', icon: '🔥', name: '열정', desc: '10문제 풀기', check: (s) => s.totalProblems >= 10 },
  { id: 'fifty', icon: '💪', name: '노력가', desc: '50문제 풀기', check: (s) => s.totalProblems >= 50 },
  { id: 'streak3', icon: '⚡', name: '3일 연속', desc: '3일 연속 학습', check: (s) => s.streak >= 3 },
  { id: 'streak7', icon: '🌟', name: '7일 연속', desc: '7일 연속 학습', check: (s) => s.streak >= 7 },
  { id: 'acc80', icon: '🎯', name: '정확도 마스터', desc: '정답률 80%+', check: (s) => s.totalProblems >= 5 && (s.correctProblems/s.totalProblems) >= 0.8 },
  { id: 'gradeup', icon: '📈', name: '등급 상승', desc: '등급 향상', check: (s) => s.scoreHistory?.length >= 2 && s.scoreHistory[s.scoreHistory.length-1]?.score > s.scoreHistory[0]?.score },
  { id: 'analyst', icon: '🔍', name: '분석가', desc: '성적 분석 완료', check: (s) => s.currentGrade !== '-' },
];

function checkAndAwardBadges() {
  const earned = JSON.parse(localStorage.getItem('earned_badges') || '[]');
  let changed = false;
  BADGES.forEach(b => {
    if (!earned.includes(b.id) && b.check(state)) {
      earned.push(b.id);
      changed = true;
      showBadgeToast(b);
    }
  });
  if (changed) {
    localStorage.setItem('earned_badges', JSON.stringify(earned));
    try { saveToFirestore('data/badges', { earned }); } catch(e) {}
  }
}

function showBadgeToast(badge) {
  const t = document.createElement('div');
  t.className = 'badge-toast';
  t.innerHTML = `${badge.icon} 배지 획득! <strong>${badge.name}</strong>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function renderBadges() {
  const el = document.getElementById('badgeList');
  if (!el) return;
  const earned = JSON.parse(localStorage.getItem('earned_badges') || '[]');
  el.innerHTML = BADGES.map(b => `
    <div class="badge-item ${earned.includes(b.id) ? 'earned' : 'locked'}" title="${b.desc}">
      <div class="badge-icon">${earned.includes(b.id) ? b.icon : '🔒'}</div>
      <div class="badge-name">${b.name}</div>
    </div>`).join('');
}

function updateStatsPage() {
  document.getElementById('totalProblems').textContent = state.totalProblems + '문제';
  const acc = state.totalProblems > 0 ? Math.round((state.correctProblems / state.totalProblems) * 100) : 0;
  document.getElementById('accuracy').textContent = acc + '%';
  document.getElementById('streak').textContent = state.streak + '일';
  document.getElementById('currentGrade').textContent = state.currentGrade !== '-' ? state.currentGrade + '등급' : '-';

  drawScoreChart();
  drawTypeChart();
  updateWeakTypesUI();
  renderWrongNotes();
  renderProgressTable();
  renderScorePrediction();
  renderErrorPattern();
  renderBadges();
  checkAndAwardBadges();
}

function drawScoreChart() {
  const canvas = document.getElementById('scoreChart');
  const empty = document.getElementById('scoreChartEmpty');
  if (!canvas || !empty) return;
  if (state.scoreHistory.length < 2) {
    empty.style.display = 'block';
    canvas.style.display = 'none';
    return;
  }
  canvas.style.display = 'block';
  empty.style.display = 'none';
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const scores = state.scoreHistory.map(s => s.score);
  const maxS = Math.max(...scores, 100);
  const minS = Math.min(...scores, 0);
  const pad = 40;
  const chartW = w - pad * 2, chartH = h - pad * 2;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '11px monospace';
    ctx.fillText(Math.round(maxS - (maxS - minS) / 4 * i), 2, y + 4);
  }

  // Line
  const pts = scores.map((s, i) => ({
    x: pad + (i / (scores.length - 1)) * chartW,
    y: pad + (1 - (s - minS) / (maxS - minS || 1)) * chartH
  }));

  const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
  grad.addColorStop(0, 'rgba(59,130,246,0.3)');
  grad.addColorStop(1, 'rgba(59,130,246,0)');

  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, h - pad);
  ctx.lineTo(pts[0].x, h - pad);
  ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5;
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Points
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6'; ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = 'bold 11px monospace';
    ctx.fillText(scores[i], p.x - 10, p.y - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px sans-serif';
    ctx.fillText(state.scoreHistory[i].date, p.x - 18, h - pad + 14);
  });
}

function drawTypeChart() {
  const container = document.getElementById('typeChart');
  if (!container) return;
  const types = [
    { name: '수와 연산', color: '#3b82f6' },
    { name: '방정식·부등식', color: '#06b6d4' },
    { name: '함수', color: '#8b5cf6' },
    { name: '수열', color: '#ec4899' },
    { name: '확률·통계', color: '#f59e0b' },
    { name: '미적분', color: '#22c55e' },
  ];
  const weakSet = new Set(state.weakTypes);
  container.innerHTML = types.map(t => {
    const isWeak = weakSet.has(t.name) || [...weakSet].some(w => w.includes(t.name) || t.name.includes(w));
    const pct = isWeak ? Math.floor(Math.random() * 30 + 20) : Math.floor(Math.random() * 40 + 55);
    return `<div class="type-bar-item">
      <div class="type-bar-label"><span>${t.name}</span><span>${isWeak ? '⚠️ 약점' : pct + '%'}</span></div>
      <div class="type-bar-bg"><div class="type-bar-fill" style="width:${pct}%;background:${t.color}"></div></div>
    </div>`;
  }).join('');
}

function updateWeakTypesUI() {
  const container = document.getElementById('weakTypes');
  if (state.weakTypes.length === 0) {
    container.innerHTML = '<p class="empty-hint">성적 분석 후 약점 유형이 표시돼요</p>';
    return;
  }
  container.innerHTML = state.weakTypes.map(t => {
    // **굵게** 같은 마크다운 제거
    const clean = t.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/^\d+\.\s*/, '').trim();
    return `<span style="display:inline-block;margin:4px;padding:6px 14px;background:rgba(239,68,68,0.15);color:#ef4444;border-radius:99px;font-size:0.82rem;font-weight:600;border:1px solid rgba(239,68,68,0.3)">⚠️ ${escapeHtml(clean)}</span>`;
  }).join('');
}

// ============ HELPERS ============
function incrementProblems(isCorrect, problem = '', myAnswer = '', correctAnswer = '', type = '') {
  state.totalProblems++;
  if (isCorrect) state.correctProblems++;
  else saveWrongNote(problem || state.currentProblem || '', myAnswer, correctAnswer, type);
  updateUnitProgress(type);
  localStorage.setItem('total_problems', state.totalProblems);
  localStorage.setItem('correct_problems', state.correctProblems);
  updateStatsPage();
  saveProfileToFirestore();
  checkAndAwardBadges();
}

function toDateKey(d) {
  // YYYY-MM-DD 형식으로 통일 (로케일 무관)
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function updateStreak() {
  const todayKey = toDateKey(new Date());
  // lastStudyDate가 구형식(toDateString)이면 초기화
  const storedDate = state.lastStudyDate || '';
  const isOldFormat = storedDate && !storedDate.includes('-');
  if (isOldFormat) { state.lastStudyDate = ''; }

  if (state.lastStudyDate !== todayKey) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);
    if (state.lastStudyDate === yesterdayKey) {
      state.streak++;
    } else {
      state.streak = 1;
    }
    state.lastStudyDate = todayKey;
    localStorage.setItem('streak', state.streak);
    localStorage.setItem('last_study_date', todayKey);
  }
}

function showError(boxId, contentId, msg) {
  document.getElementById(boxId).classList.remove('hidden');
  document.getElementById(contentId).innerHTML = `<p style="color:var(--red)">${escapeHtml(msg)}</p>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// API 키 없을 때 토스트 메시지
function showApiKeyWarning() {
  showToast('🔑 설정에서 Gemini API 키를 먼저 입력해주세요!');
  setTimeout(() => openSettings(), 500);
}
// ============ window 전역 등록 (type="module" 대응) ============
window.generateGoal = generateGoal;
window.getSolveProblem = getSolveProblem;
window.checkSolve = checkSolve;
window.getBasicProblem = getBasicProblem;
window.checkBasic = checkBasic;
window.getHint = getHint;
window.startIntensive = startIntensive;
window.runAnalyze = runAnalyze;
window.saveApiKey = saveApiKey;
window.openSettings = openSettings;
window.closeModal = closeModal;
window.saveSettings = saveSettings;
window.switchUploadMode = switchUploadMode;
window.setPdfAction = setPdfAction;
window.handleDrop = handleDrop;
window.removeImage = removeImage;
window.removePdf = removePdf;
window.openSolveModal = openSolveModal;
window.submitModalSolve = submitModalSolve;
window.askThisProblem = askThisProblem;
window.showForm = window.showForm || function(){};
window.doLogin = window.doLogin || function(){};
window.doSignup = window.doSignup || function(){};
window.doLogout = window.doLogout || function(){};
window.doResetPw = window.doResetPw || function(){};
window.navigateTo = navigateTo;