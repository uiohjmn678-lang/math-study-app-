// ===== 수학완성 - script.js =====
// Gemini API 연동 수능 수학 AI 학습 도우미

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

  // 커리큘럼 불러오기
  const curriculum = await loadFromFirestore('data/curriculum');
  if (curriculum) {
    state.curriculum = curriculum;
    applyTodayGoal();
    generateGoal(); // 커리큘럼 로드 후 오늘의 목표 표시
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

async function callGemini(prompt, imageBase64 = null) {
  if (!state.apiKey) {
    return null;
  }

  const parts = [];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }
  parts.push({ text: prompt });

  const body = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8000 }
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
  restoreAnalysisResult();
  generateGoal(); // 앱 시작 시 오늘의 목표 자동 표시

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
  if (!key) { alert('API 키를 입력해주세요.'); return; }
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
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const base64 = dataUrl.split(',')[1];
    uploadedImages.push({ base64, name: file.name, dataUrl });
    renderImagePreviews();
  };
  reader.readAsDataURL(file);
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

// 기하 문제 키워드 감지
function isGeometryProblem(text) {
  const keywords = ['원', '직선', '좌표', '벡터', '삼각형', '사각형', '점', '기울기', '포물선', '쌍곡선', '타원', '수직', '평행', '내접', '외접', '넓이', '둘레', '반지름', '중심', '꼭짓점'];
  return keywords.some(k => text.includes(k));
}

// Desmos 인스턴스 초기화
function initDesmos(elId) {
  if (desmosInstances[elId]) {
    desmosInstances[elId].destroy();
    delete desmosInstances[elId];
  }
  const el = document.getElementById(elId);
  if (!el || !window.Desmos) return null;
  const calc = Desmos.GraphingCalculator(el, {
    keypad: false,
    expressions: false,
    settingsMenu: false,
    zoomButtons: true,
    lockViewport: false,
    border: false,
    backgroundColor: '#F8FBFF',
    xAxisLabel: 'x',
    yAxisLabel: 'y',
    showGrid: true,
  });
  desmosInstances[elId] = calc;
  return calc;
}

// Desmos에 수식 목록 그리기
function renderDesmos(elId, wrapId, expressions) {
  if (!expressions || expressions.length === 0) {
    document.getElementById(wrapId).classList.add('hidden');
    return;
  }
  document.getElementById(wrapId).classList.remove('hidden');
  const calc = initDesmos(elId);
  if (!calc) return;

  // 기본 뷰포트 -8 ~ 8로 설정
  calc.setMathBounds({ left: -8, right: 8, bottom: -6, top: 6 });

  const colors = ['#4A90E2', '#FF6B6B', '#34C759', '#FF9500', '#5856D6', '#FF2D55'];

  expressions.forEach((expr, i) => {
    const color = expr.color || colors[i % colors.length];
    const isPoint = /^\s*\([^,)]+,[^,)]+\)\s*$/.test(expr.latex);

    calc.setExpression({
      id: 'expr' + i,
      latex: expr.latex,
      color,
      label: expr.label || '',
      showLabel: !!expr.label,
      pointSize: isPoint ? 12 : undefined,
      pointStyle: isPoint ? Desmos.Styles.POINT : undefined,
    });
  });

  // 점이 있으면 뷰포트 자동 맞춤
  setTimeout(() => {
    try { calc.zoomFit(); } catch(e) {}
  }, 400);
}

// AI 응답에서 Desmos 수식 파싱
function parseDesmosExpressions(text) {
  const match = text.match(/DESMOS_START([\s\S]*?)DESMOS_END/);
  if (!match) return [];
  const colors = ['#4A90E2', '#FF6B6B', '#34C759', '#FF9500', '#5856D6', '#FF2D55'];
  return match[1].trim().split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('(') || /^\([^|)]+,[^|)]+\)/.test(line))
    .filter(line => line)
    .map((line, i) => {
      // 레이블 파싱: "(2,4)|A" → latex: "(2,4)", label: "A"
      const labelMatch = line.match(/^(.+)\|(.+)$/);
      if (labelMatch) {
        return { latex: labelMatch[1].trim(), label: labelMatch[2].trim(), color: colors[i % colors.length] };
      }
      return { latex: line, color: colors[i % colors.length] };
    });
}
function renderMath(el) {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([el]).catch(e => console.warn('MathJax 오류:', e));
  }
}

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
  if (!state.apiKey) { alert('먼저 Gemini API 키를 입력하고 저장해주세요!'); return; }

  if (currentUploadMode === 'pdf') {
    if (!uploadedPdf) { alert('PDF를 먼저 업로드해주세요!'); return; }
    if (currentPdfAction === 'grade') await gradeExamPdf();
    else await analyzeScoreFromPdf();
  } else {
    if (uploadedImages.length === 0) { alert('성적표 사진을 먼저 업로드해주세요!'); return; }
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

  // 여러 이미지를 순서대로 parts에 넣기
  const parts = [];
  uploadedImages.forEach((img, i) => {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: img.base64 } });
    parts.push({ text: `[이미지 ${i+1}번]` });
  });
  parts.push({ text: `위 이미지는 ${examType} 성적표입니다 (총 ${uploadedImages.length}장). 모든 이미지를 함께 분석해주세요.

다음 형식으로 분석해주세요:

【점수 분석】
- 총점: N점 (100점 만점 기준)
- 등급: N등급
- 백분위: N%
- 원점수/표준점수 (있는 경우)

【유형별 수준】
- 수와 연산: 상/중/하
- 방정식·부등식: 상/중/하
- 함수: 상/중/하
- 삼각함수: 상/중/하
- 수열: 상/중/하
- 지수·로그: 상/중/하
- 확률·통계: 상/중/하
- 미적분: 상/중/하
(이미지에서 파악 불가한 항목은 "정보 부족"으로 표기)

【약점 유형 TOP 3】
1.
2.
3.

【AI 한마디 조언】
학생의 수준에 맞는 따뜻한 격려와 핵심 학습 방향 2~3문장` });

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

  const prompt = `이 PDF는 학생이 직접 답을 적은 수능/모의고사 수학 시험지입니다.
시험지에 표시된 학생의 답(체크, 동그라미, 밑줄 등)을 모두 읽어서 정답과 비교 채점해주세요.
반드시 1번부터 마지막 문제까지 순서대로 모두 확인해주세요.
마크다운 기호(#, **, *) 절대 사용 금지.${missedNote}

아래 형식으로 정확하고 자세하게 작성해주세요:

【채점 결과】
- 총점: N점 (100점 만점, 각 문제 배점 반영)
- 등급: N등급
- 맞은 문제 (N개): 1번, 2번, 3번, ...
- 틀린 문제 (N개):
  • N번 [배점: N점] 정답: X, 학생답: Y → 왜 틀렸는지 한 줄 설명
  • N번 [배점: N점] 정답: X, 학생답: Y → 왜 틀렸는지 한 줄 설명

【유형별 수준】
각 유형마다 수준과 이유를 함께:
- 수와 연산: 상/중/하 (이유 한 줄)
- 방정식·부등식: 상/중/하 (이유 한 줄)
- 함수: 상/중/하 (이유 한 줄)
- 삼각함수: 상/중/하 (이유 한 줄)
- 수열: 상/중/하 (이유 한 줄)
- 지수·로그: 상/중/하 (이유 한 줄)
- 확률·통계: 상/중/하 (이유 한 줄)
- 미적분: 상/중하 (이유 한 줄)

【약점 유형 TOP 3】
1. 유형명 - 구체적으로 어떤 부분이 약한지 설명
2. 유형명 - 구체적으로 어떤 부분이 약한지 설명
3. 유형명 - 구체적으로 어떤 부분이 약한지 설명

【이렇게 공부하세요】
틀린 문제 패턴을 분석해서 학생이 바로 실천할 수 있는 공부 방법 3가지를 친근하게 알려주세요.

【AI 한마디】
결과를 보고 학생에게 따뜻하고 솔직한 격려 2문장`;

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

  const prompt = `이 PDF는 수능/모의고사 성적표입니다.

다음 형식으로 분석해주세요:

【점수 분석】
- 총점: N점
- 등급: N등급
- 백분위: N%
- 표준점수 (있으면)

【유형별 수준】
- 수와 연산: 상/중/하
- 방정식·부등식: 상/중/하
- 함수: 상/중/하
- 수열: 상/중/하
- 확률·통계: 상/중/하
- 미적분: 상/중/하

【약점 유형 TOP 3】
1.
2.
3.

【AI 한마디 조언】
따뜻한 격려와 핵심 학습 방향`;

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
  if (!solve) { alert('풀이를 입력해주세요!'); return; }

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

✅ 잘한 점
(한 줄)

🔧 개선할 점
(한 줄)

📋 풀이
(단계별, 번호 사용)

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
  const scoreMatch = text.match(/총점[：:]\s*(\d+)점/);
  const gradeMatch = text.match(/등급[：:]\s*(\d+)등급/);
  if (scoreMatch) {
    state.currentScore = parseInt(scoreMatch[1]);
    localStorage.setItem('current_score', state.currentScore);
    state.scoreHistory.push({ date: new Date().toLocaleDateString('ko'), score: state.currentScore });
    localStorage.setItem('score_history', JSON.stringify(state.scoreHistory));
  }
  if (gradeMatch) {
    state.currentGrade = parseInt(gradeMatch[1]);
    localStorage.setItem('current_grade', state.currentGrade);
  }
  const weakSection = text.match(/약점 유형 TOP 3[\s\S]*?(?=\n【|$)/);
  if (weakSection) {
    const lines = weakSection[0].split('\n').filter(l => /^\d\./.test(l.trim()));
    state.weakTypes = lines.map(l => l.replace(/^\d\.\s*/, '').trim().split(' - ')[0]).filter(Boolean);
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
    const bodyHtml = escapeHtml(sec.body).replace(/\n/g, '<br/>');
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

  // 분석 결과 localStorage에 저장
  try {
    localStorage.setItem('last_analysis_result', html);
    localStorage.setItem('last_analysis_title', document.getElementById('analyzeResultTitle').textContent);
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
    const todayPlan = state.curriculum.daily[dayOfMonth - 1];

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
      <p>성적표를 분석하면 30일 맞춤 커리큘럼이<br/>자동으로 생성돼요</p>
      <button class="btn-primary" onclick="navigateTo('analyze')" style="margin-top:16px">📸 성적표 업로드하러 가기</button>
    </div>`;
}

// 커리큘럼 기반 오늘의 목표 표시
function displayTodayGoal(todayPlan) {
  const goalContent = document.getElementById('goalContent');
  const dayOfMonth = new Date().getDate();
  const totalDays = state.curriculum.daily.length;

  goalContent.innerHTML = `
    <div class="curriculum-info-bar">
      📅 ${dayOfMonth}일차 / ${totalDays}일 커리큘럼
      <span class="curriculum-badge">${state.curriculum.summary || '맞춤 학습 중'}</span>
    </div>
    <div class="goal-card-single">
      <div class="goal-section">
        <div class="goal-section-header">
          <span class="goal-section-icon">✏️</span>
          <span class="goal-section-title" style="color:#4A90E2">기본 문제 풀이</span>
        </div>
        <div class="goal-section-body">${todayPlan.types?.join(', ')} 유형 ${todayPlan.count}문제</div>
      </div>
      <div class="goal-section">
        <div class="goal-section-header">
          <span class="goal-section-icon">🔥</span>
          <span class="goal-section-title" style="color:#FF6B6B">약점 집중 훈련</span>
        </div>
        <div class="goal-section-body">${todayPlan.weakFocus} 집중 훈련</div>
      </div>
      <div class="goal-section">
        <div class="goal-section-header">
          <span class="goal-section-icon">🎯</span>
          <span class="goal-section-title" style="color:#FF9500">오늘의 목표</span>
        </div>
        <div class="goal-section-body">${todayPlan.goal}</div>
      </div>
      <div class="goal-section" style="border-bottom:none">
        <div class="goal-section-header">
          <span class="goal-section-icon">💬</span>
          <span class="goal-section-title" style="color:#5856D6">안내</span>
        </div>
        <div class="goal-section-body" style="color:var(--text3);font-size:0.82rem">
          새 성적표를 업로드하면 커리큘럼이 새로 생성돼요
        </div>
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

// ============ SOLVE TRAINING ============
async function getSolveProblem() {
  if (!state.apiKey) { alert('API 키를 설정해주세요!'); return; }

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

형식:
[유형: ___]
문제: ___

아래 조건을 모두 만족할 때만 DESMOS 블록 추가:
- 문제에 구체적인 숫자 좌표가 있는 경우 (예: 점 A(2,3), 원 x²+y²=4)
- 직선, 원, 포물선처럼 그래프로 표현 가능한 경우

조건 만족 시에만:
DESMOS_START
(Desmos LaTeX 수식, 한 줄에 하나씩)
(점은 반드시 레이블 포함: (2,4)|A 형식으로. 레이블 없으면 (2,4))
(원 예시: x^2+y^2=4)
(직선 예시: y=-x+3)
DESMOS_END

조건 불만족 시 DESMOS 블록 절대 생략.`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;

    // Desmos 수식 파싱 후 문제 텍스트에서 제거
    const exprs = parseDesmosExpressions(result);
    const cleanResult = result.replace(/DESMOS_START[\s\S]*?DESMOS_END/, '').trim();

    problemBox.innerHTML = `<strong>📝 문제</strong><br/><br/>${mathHtml(cleanResult)}`;
    renderMath(problemBox);

    // 기하 문제면 그래프 표시, 아니면 숨기기
    if (exprs.length > 0) {
      renderDesmos('solveGraphEl', 'solveGraph', exprs);
    } else {
      document.getElementById('solveGraph').classList.add('hidden');
    }

    document.getElementById('solveInput').classList.remove('hidden');
    document.getElementById('solveTxt').value = '';
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

async function checkSolve() {
  if (!state.apiKey) { alert('API 키를 설정해주세요!'); return; }
  const solve = document.getElementById('solveTxt').value.trim();
  if (!solve) { alert('풀이 과정을 입력해주세요!'); return; }

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
    incrementProblems(result.includes('O') || result.includes('정답'));
  } catch (e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

// ============ BASIC PROBLEM ============
async function getBasicProblem() {
  if (!state.apiKey) { alert('API 키를 설정해주세요!'); return; }

  const type = document.getElementById('mathType').value;
  const problemBox = document.getElementById('basicProblem');
  problemBox.classList.remove('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 문제 생성 중...';
  document.getElementById('basicInput').classList.add('hidden');
  document.getElementById('basicFeedback').classList.add('hidden');
  state.currentHint = null;

  const prompt = `수능 수학 [${type}] 유형 문제 1개를 만들어주세요.
난이도: ${state.currentGrade !== '-' ? state.currentGrade + '등급 수준' : '중간'}
수식은 $...$ LaTeX 형식으로.

형식 (반드시 지켜주세요):
문제: (문제 내용)
(선택지가 있으면 ①②③④⑤로)
정답: (숫자나 간단한 답)
힌트: (풀이 방향 한 줄)

아래 조건을 모두 만족할 때만 DESMOS 블록 추가:
- 문제에 구체적인 숫자 좌표가 있는 경우 (예: 점 A(2,3), 원 x²+y²=4)
- 직선, 원, 포물선처럼 그래프로 표현 가능한 경우

조건 만족 시에만:
DESMOS_START
(Desmos LaTeX 수식, 한 줄에 하나씩)
(점은 반드시 레이블 포함: (2,4)|A 형식으로. 레이블 없으면 (2,4))
(원 예시: x^2+y^2=4)
(직선 예시: y=-x+3)
DESMOS_END

조건 불만족 시 DESMOS 블록 절대 생략.
중요: 정답은 반드시 포함시켜 주세요.`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;

    // Desmos 수식 파싱
    const exprs = parseDesmosExpressions(result);
    const cleanResult = result.replace(/DESMOS_START[\s\S]*?DESMOS_END/, '').trim();

    // 힌트와 정답 파싱
    const hintMatch = cleanResult.match(/힌트[：:]\s*(.+)/);
    state.currentHint = hintMatch ? hintMatch[1] : '풀이 과정을 단계별로 생각해보세요.';
    const visibleText = cleanResult.replace(/\n?정답[：:][\s\S]*?(?=\n힌트|$)/, '').replace(/\n?힌트[：:].+/, '');

    problemBox.innerHTML = `<strong>📝 문제 [${type}]</strong><br/><br/>${mathHtml(visibleText)}`;
    renderMath(problemBox);

    // 기하 문제면 그래프 표시
    if (exprs.length > 0) {
      renderDesmos('basicGraphEl', 'basicGraph', exprs);
    } else {
      document.getElementById('basicGraph').classList.add('hidden');
    }

    document.getElementById('basicInput').classList.remove('hidden');
    document.getElementById('basicAns').value = '';
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

async function checkBasic() {
  if (!state.apiKey) return;
  const ans = document.getElementById('basicAns').value.trim();
  if (!ans) { alert('답을 입력해주세요!'); return; }

  const feedback = document.getElementById('basicFeedback');
  feedback.classList.remove('hidden');
  feedback.innerHTML = '<span class="spinner"></span> 채점 중...';

  const prompt = `문제: ${state.currentProblem}
학생 답: ${ans}

마크다운 기호(#, **, *) 절대 사용 금지. 아래 형식으로만 작성:

판정: ✅ 정답 / ❌ 오답 중 하나만

📋 풀이
(단계별로 간결하게, 번호 사용)

💡 핵심 팁
(틀리지 않기 위한 핵심 한 줄)`;

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

function getHint() {
  if (state.currentHint) {
    alert(`💡 힌트: ${state.currentHint}`);
  } else {
    alert('먼저 문제를 받아주세요!');
  }
}

// ============ INTENSIVE TRAINING ============
async function startIntensive() {
  if (!state.apiKey) { alert('API 키를 설정해주세요!'); return; }

  const problemBox = document.getElementById('intensiveProblem');
  const feedback = document.getElementById('intensiveFeedback');
  problemBox.classList.remove('hidden');
  feedback.classList.add('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 집중 트레이닝 문제 생성 중...';

  const targetType = state.weakTypes[0] || '수열';

  const prompt = `수능 수학 [${targetType}] 유형 집중 트레이닝 문제 1개를 만들어주세요.
수준: ${state.currentGrade !== '-' ? state.currentGrade + '등급' : '중간'}
마크다운 기호(#, ##, ###, **, *, ---, ---) 절대 사용 금지.

아래 형식으로만 작성하세요:

문제:
(문제 내용. 수식은 $...$ 형식으로)

①
②
③
④
⑤

정답: (번호)
힌트: (핵심 풀이 방향 한 줄)
주의: (이 유형에서 자주 틀리는 실수 한 줄)`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;

    // 마크다운 제거
    const clean = result
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/---+/g, '')
      .trim();

    // 정답/힌트 파싱
    const hintMatch = clean.match(/힌트[：:]\s*(.+)/);
    const cautionMatch = clean.match(/주의[：:]\s*(.+)/);
    state.currentHint = hintMatch ? hintMatch[1] : '풀이 과정을 단계별로 생각해보세요.';

    // 문제 부분만 추출 (정답/힌트/주의 제외)
    const visibleText = clean
      .replace(/\n?정답[：:][\s\S]*?(?=\n힌트|\n주의|$)/, '')
      .replace(/\n?힌트[：:].+/, '')
      .replace(/\n?주의[：:].+/, '')
      .trim();

    // 주의사항 배지
    const cautionBadge = cautionMatch
      ? `<div class="intensive-caution">⚠️ 주의: ${mathHtml(cautionMatch[1])}</div>`
      : '';

    problemBox.innerHTML = `
      <div class="intensive-problem-wrap">
        <strong>🔥 집중 트레이닝 [${targetType}]</strong>
        <div class="intensive-problem-body">${mathHtml(visibleText)}</div>
        ${cautionBadge}
      </div>`;
    renderMath(problemBox);
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

// ============ FEEDBACK RENDERER ============
function renderFeedback(raw, isCorrect) {
  // 마크다운 제거
  const text = raw
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .trim();

  const verdict = isCorrect
    ? `<div class="feedback-verdict correct">✅ 정답!</div>`
    : `<div class="feedback-verdict wrong">❌ 오답</div>`;

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
    const body = currentLines.filter(l => l.trim()).join('\n').trim();
    if (!body) return;
    sectionsHtml += `
      <div class="feedback-section">
        <div class="feedback-section-title" style="color:${currentSection.color}">
          ${currentSection.icon} ${currentSection.label}
        </div>
        <div class="feedback-section-body">${mathHtml(body)}</div>
      </div>`;
    currentLines = [];
  };

  lines.forEach(line => {
    const matched = sectionMap.find(s => line.includes(s.icon) && line.includes(s.label));
    if (matched) {
      flush();
      currentSection = matched;
    } else if (currentSection && !line.match(/^판정:/)) {
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
  const todayPlan = state.curriculum.daily?.[dayOfMonth - 1];
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

  const prompt = `수능 수학 성적 분석 결과를 바탕으로 한 달(30일) 학습 커리큘럼을 만들어주세요.
마크다운 기호 절대 사용 금지. 반드시 아래 JSON 형식으로만 응답하세요.

성적 분석:
${analysisText}

응답 형식 (JSON만, 다른 텍스트 없이):
{
  "month": "${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}",
  "summary": "한 줄 요약",
  "daily": [
    {
      "day": 1,
      "types": ["유형1", "유형2"],
      "count": 8,
      "weakFocus": "집중할 약점 유형",
      "goal": "오늘의 목표 한 줄"
    }
  ]
}

규칙:
- 1~7일: 가장 약한 유형 집중
- 8~14일: 두 번째 약점 유형
- 15~21일: 전체 유형 균형
- 22~28일: 실전 대비 복합 문제
- 29~30일: 모의고사 대비 총정리
- count는 하루 풀 문제 수 (6~12개)`;

  try {
    const result = await callGemini(prompt);
    const clean = result.replace(/```json|```/g, '').trim();
    const curriculum = JSON.parse(clean);
    state.curriculum = curriculum;
    await saveCurriculumToFirestore(curriculum);
    applyTodayGoal();
    return curriculum;
  } catch (e) {
    console.error('커리큘럼 생성 오류:', e);
    return null;
  }
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
}

function drawScoreChart() {
  const canvas = document.getElementById('scoreChart');
  const empty = document.getElementById('scoreChartEmpty');
  if (state.scoreHistory.length < 2) {
    empty.style.display = 'block';
    return;
  }
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
  container.innerHTML = state.weakTypes.map(t =>
    `<span style="display:inline-block;margin:4px;padding:6px 14px;background:rgba(239,68,68,0.15);color:#ef4444;border-radius:99px;font-size:0.82rem;font-weight:600;border:1px solid rgba(239,68,68,0.3)">⚠️ ${escapeHtml(t)}</span>`
  ).join('');
}

// ============ HELPERS ============
function incrementProblems(isCorrect) {
  state.totalProblems++;
  if (isCorrect) state.correctProblems++;
  localStorage.setItem('total_problems', state.totalProblems);
  localStorage.setItem('correct_problems', state.correctProblems);
  updateStatsPage();
  saveProfileToFirestore();
}

function updateStreak() {
  const today = new Date().toDateString();
  if (state.lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (state.lastStudyDate === yesterday.toDateString()) {
      state.streak++;
    } else if (state.lastStudyDate !== today) {
      state.streak = 1;
    }
    state.lastStudyDate = today;
    localStorage.setItem('streak', state.streak);
    localStorage.setItem('last_study_date', today);
  }
}

function showError(boxId, contentId, msg) {
  document.getElementById(boxId).classList.remove('hidden');
  document.getElementById(contentId).innerHTML = `<p style="color:var(--red)">${escapeHtml(msg)}</p>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
