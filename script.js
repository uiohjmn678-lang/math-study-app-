// ===== 수학완성 - script.js =====
// Gemini API 연동 수능 수학 AI 학습 도우미

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
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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

  // 파일 인풋
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);

  // 드래그 앤 드롭
  const uploadBox = document.getElementById('uploadBox');
  uploadBox.addEventListener('dragover', e => { e.preventDefault(); uploadBox.style.borderColor = 'var(--accent)'; });
  uploadBox.addEventListener('dragleave', () => { uploadBox.style.borderColor = ''; });
  uploadBox.addEventListener('drop', e => {
    e.preventDefault(); uploadBox.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImageFile(file);
  });
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

// ============ IMAGE UPLOAD ============
let uploadedImageBase64 = null;

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) loadImageFile(file);
}

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Full = e.target.result;
    uploadedImageBase64 = base64Full.split(',')[1];
    const img = document.getElementById('previewImg');
    img.src = base64Full;
    img.classList.remove('hidden');
    document.getElementById('uploadInner').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ============ ANALYZE ============
async function analyzeImage() {
  if (!state.apiKey) {
    alert('먼저 Gemini API 키를 입력하고 저장해주세요!');
    return;
  }
  if (!uploadedImageBase64) {
    alert('성적표 사진을 먼저 업로드해주세요!');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.innerHTML = '<span class="spinner"></span>AI 분석 중...';
  btn.disabled = true;

  const examType = document.getElementById('examType').value || '수능/모의고사';

  const prompt = `당신은 수능 수학 전문 교육 AI입니다.
업로드된 ${examType} 성적표 이미지를 분석해주세요.

다음 형식으로 정확히 분석해주세요:

【점수 분석】
- 총점: N점 (100점 만점 기준)
- 등급: N등급
- 백분위: N%
- 원점수/표준점수 (있는 경우)

【유형별 수준】
각 수학 유형에 대해 (맞춤/틀림/시간초과 등 파악되는 정보 기반):
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
학생의 수준에 맞는 따뜻한 격려와 핵심 학습 방향 2~3문장`;

  try {
    const result = await callGemini(prompt, uploadedImageBase64);
    displayAnalysisResult(result);
  } catch (e) {
    showError('analyzeResult', 'resultContent', `분석 실패: ${e.message}`);
  } finally {
    btn.innerHTML = '🤖 AI 분석 시작';
    btn.disabled = false;
  }
}

function displayAnalysisResult(text) {
  const resultBox = document.getElementById('analyzeResult');
  const content = document.getElementById('resultContent');
  resultBox.classList.remove('hidden');

  // 점수 파싱
  const scoreMatch = text.match(/총점[：:]\s*(\d+)점/);
  const gradeMatch = text.match(/등급[：:]\s*(\d+)등급/);
  const weakMatches = text.match(/약점 유형 TOP[\s\S]*?1\.\s*(.+)/);

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

  // 약점 유형 파싱
  const weakSection = text.match(/약점 유형 TOP 3[\s\S]*?(?=\n【|$)/);
  if (weakSection) {
    const lines = weakSection[0].split('\n').filter(l => /^\d\./.test(l.trim()));
    state.weakTypes = lines.map(l => l.replace(/^\d\.\s*/, '').trim()).filter(Boolean);
    localStorage.setItem('weak_types', JSON.stringify(state.weakTypes));
  }

  content.innerHTML = `<pre style="white-space:pre-wrap;font-family:'Pretendard',sans-serif;font-size:0.88rem;line-height:1.8;color:var(--text)">${escapeHtml(text)}</pre>`;
  updateHeaderBadge();
  updateHomeStats();
}

// ============ GENERATE GOAL ============
async function generateGoal() {
  if (!state.apiKey) {
    alert('Gemini API 키를 먼저 설정해주세요! (설정 ⚙️ 버튼)');
    return;
  }

  const goalContent = document.getElementById('goalContent');
  goalContent.innerHTML = '<div style="text-align:center;padding:40px"><span class="spinner" style="border-top-color:var(--accent)"></span> AI가 오늘의 목표를 생성 중...</div>';

  const gradeInfo = state.currentGrade !== '-' ? `현재 ${state.currentGrade}등급, ${state.currentScore}점` : '등급 미설정';
  const weakInfo = state.weakTypes.length > 0 ? state.weakTypes.join(', ') : '없음';

  const prompt = `당신은 수능 수학 전문 학습 코치입니다.
학생 정보: ${gradeInfo} / 약점 유형: ${weakInfo}

오늘의 수학 학습 계획을 다음 형식으로 만들어주세요:

📚 개념 학습 (30분)
어떤 개념을 공부할지 + 교재/방법 추천

✏️ 기본 문제 풀이 (N문제)
어떤 유형 문제를 몇 개 풀어야 하는지

🔥 약점 집중 훈련 (N문제)
약점 유형 중심으로 몇 문제

📝 오늘의 핵심 포인트
오늘 반드시 익혀야 할 개념 1가지

🎯 목표 점수/등급
이 계획을 꾸준히 하면 N주 내에 달성 가능한 목표

따뜻하고 동기부여가 되는 말투로 작성해주세요.`;

  try {
    const result = await callGemini(prompt);
    goalContent.innerHTML = formatGoalHTML(result);
  } catch (e) {
    goalContent.innerHTML = `<p style="color:var(--red)">목표 생성 실패: ${e.message}</p>`;
  }
}

function formatGoalHTML(text) {
  const lines = text.split('\n').filter(l => l.trim());
  let html = '<div class="goal-list">';
  lines.forEach(line => {
    const icons = ['📚','✏️','🔥','📝','🎯','💡','⭐'];
    const hasIcon = icons.some(i => line.startsWith(i));
    if (hasIcon) {
      html += `<div class="goal-item"><div class="goal-item-text"><div class="goal-item-title">${escapeHtml(line)}</div></div></div>`;
    } else if (line.trim()) {
      html += `<div class="goal-item"><span class="goal-check">✓</span><div class="goal-item-text"><div class="goal-item-desc">${escapeHtml(line)}</div></div></div>`;
    }
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

  const prompt = `수능 수학 문제를 1개 만들어주세요.
난이도: ${state.currentGrade !== '-' ? state.currentGrade + '등급 수준' : '중간 난이도'}
요구사항:
- 풀이 과정을 단계적으로 써야 하는 문제
- 문제만 제시 (정답, 풀이 불포함)
- 문제 번호와 유형 명시

형식:
[유형: ___]
문제: ___`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;
    problemBox.innerHTML = `<strong>📝 문제</strong><br/><br/>${escapeHtml(result).replace(/\n/g, '<br/>')}`;
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

문제: ${state.currentProblem}

학생 풀이:
${solve}

다음을 평가해주세요:
1. 정답 여부 (O/X)
2. 풀이 과정의 논리적 흐름 (10점 만점)
3. 잘한 점 (구체적으로)
4. 개선할 점 (구체적으로)
5. 올바른 풀이 과정 제시
6. 이 유형 마스터 팁

따뜻하고 교육적인 톤으로 작성해주세요.`;

  try {
    const result = await callGemini(prompt);
    feedback.innerHTML = `<h3>🤖 AI 피드백</h3><pre style="white-space:pre-wrap;font-family:'Pretendard',sans-serif;font-size:0.88rem;line-height:1.8">${escapeHtml(result)}</pre>`;
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

형식 (반드시 지켜주세요):
문제: (문제 내용)
(선택지가 있으면 ①②③④⑤로)
정답: (숫자나 간단한 답)
힌트: (풀이 방향 한 줄)

중요: 정답은 반드시 포함시켜 주세요.`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;
    // 힌트와 정답 파싱
    const hintMatch = result.match(/힌트[：:]\s*(.+)/);
    state.currentHint = hintMatch ? hintMatch[1] : '풀이 과정을 단계별로 생각해보세요.';
    // 정답 숨기고 표시
    const visibleText = result.replace(/\n?정답[：:][\s\S]*?(?=\n힌트|$)/, '').replace(/\n?힌트[：:].+/, '');
    problemBox.innerHTML = `<strong>📝 문제 [${type}]</strong><br/><br/>${escapeHtml(visibleText).replace(/\n/g, '<br/>')}`;
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

채점 결과를 알려주세요:
1. 정답 여부 (✅ 정답 / ❌ 오답)
2. 실제 정답
3. 간단한 풀이 방법 (3~5줄)
4. 다음에 틀리지 않기 위한 팁`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = result.includes('✅') || result.toLowerCase().includes('정답입니다');
    feedback.innerHTML = `<h3>${isCorrect ? '✅ 정답!' : '❌ 오답'}</h3><pre style="white-space:pre-wrap;font-family:'Pretendard',sans-serif;font-size:0.88rem;line-height:1.8">${escapeHtml(result)}</pre>`;
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

  const prompt = `수능 수학 집중 트레이닝 문제입니다.
약점 유형: [${targetType}]
수준: ${state.currentGrade !== '-' ? state.currentGrade + '등급' : '중등'}

다음을 제공해주세요:
1. 개념 핵심 정리 (3줄 이내)
2. 유형 문제 1개
3. 단계별 풀이 가이드 (단계 제목만, 내용은 학생이 채워야 함)
4. 자주 하는 실수 주의사항`;

  try {
    const result = await callGemini(prompt);
    state.currentProblem = result;
    problemBox.innerHTML = `<strong>🔥 집중 트레이닝 [${targetType}]</strong><br/><br/><pre style="white-space:pre-wrap;font-family:'Pretendard',sans-serif;font-size:0.88rem;line-height:1.8">${escapeHtml(result)}</pre>`;
  } catch (e) {
    problemBox.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}

// ============ STATS PAGE ============
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