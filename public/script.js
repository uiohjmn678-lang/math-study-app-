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

// ============ 유형별 세부 출제 주제 풀 ============
// 같은 단원 안에서 매번 똑같은 문제가 나오지 않도록 세부 주제를 랜덤으로 섞는다
const SUBTOPIC_POOL = {
  '수와 연산': ['거듭제곱근 계산', '지수법칙 활용', '로그의 정의와 계산', '로그의 성질', '상용로그', '거듭제곱근이 실수가 되는 조건', '지수·로그 대소 비교', '지수·로그 방정식', '지수·로그 부등식'],
  '지수와 로그': ['지수법칙', '로그의 성질', '상용로그의 활용', '지수함수 그래프', '로그함수 그래프', '지수·로그 방정식', '지수·로그 부등식', '대소 비교'],
  '방정식과 부등식': ['복소수의 연산', '이차방정식의 판별식', '근과 계수의 관계', '이차함수와 이차방정식', '이차부등식', '연립이차방정식', '부등식의 영역'],
  '함수': ['함수의 정의와 그래프', '합성함수', '역함수', '유리함수', '무리함수', '함수의 평행이동·대칭이동'],
  '수열': ['등차수열', '등비수열', '등차·등비 혼합', '시그마 합 공식', '계차수열', '수학적 귀납법', '점화식'],
  '삼각함수': ['삼각함수의 정의', '삼각함수의 그래프', '삼각함수 사이의 관계', '사인법칙', '코사인법칙', '삼각함수의 활용'],
  '함수의 극한과 연속': ['함수의 극한값 계산', '좌극한·우극한', '함수의 연속', '사잇값 정리'],
  '미분': ['미분계수와 도함수', '접선의 방정식', '함수의 증가·감소', '극대·극소', '최댓값·최솟값', '방정식·부등식에의 활용', '속도와 가속도'],
  '적분': ['부정적분', '정적분의 계산', '정적분으로 정의된 함수', '곡선과 x축 사이의 넓이', '두 곡선 사이의 넓이'],
  '수열의 극한': ['수열의 극한값', '등비수열의 극한', '급수의 합', '등비급수'],
  '미분법': ['여러 가지 함수의 미분', '합성함수의 미분', '음함수·매개변수 미분', '도함수의 활용', '변곡점'],
  '적분법': ['치환적분', '부분적분', '정적분의 활용', '입체도형의 부피'],
  '경우의 수': ['순열', '조합', '중복순열', '중복조합', '같은 것이 있는 순열', '이항정리'],
  '확률': ['확률의 덧셈정리', '조건부확률', '독립사건', '확률의 곱셈정리'],
  '통계': ['이산확률분포', '이항분포', '정규분포', '표본평균의 분포', '모평균의 추정'],
  '이차곡선': ['포물선', '타원', '쌍곡선', '이차곡선의 접선'],
  '평면벡터': ['벡터의 연산', '내적', '직선·원의 벡터방정식'],
  '공간도형과 공간좌표': ['공간에서의 위치 관계', '정사영', '두 점 사이의 거리', '구의 방정식'],
  // 누락된 유형 추가
  '도형의 성질': ['삼각형의 무게중심', '삼각형의 내심과 외심', '닮음비와 넓이비', '삼각형의 넓이(사인법칙 활용)', '원의 접선과 반지름', '원에서의 현과 호', '평행사변형의 성질', '직각삼각형의 성질'],
  '기대값': ['이산확률변수의 기댓값 계산', '확률분포표에서 평균·분산', '이항분포의 평균·표준편차', '확률변수의 선형변환'],
  '통계 그래프 해석': ['도수분포표와 상대도수', '히스토그램 해석', '줄기잎그림 해석', '산점도와 상관관계', '중앙값·최빈값·평균 비교'],
  '방정식·부등식': ['이차방정식의 근과 계수의 관계', '이차부등식의 풀이', '판별식 활용', '절댓값 방정식', '연립부등식'],
};

// 등급별 쉬운 서브토픽 (5~7등급용 - 공식 1개 직접 적용 수준)
const EASY_SUBTOPIC_POOL = {
  '도형의 성질': ['삼각형의 무게중심', '닮음비와 넓이비', '원의 접선과 반지름', '직각삼각형의 성질'],
  '수열': ['등차수열', '등비수열', '시그마 합 공식'],
  '함수': ['함수의 정의와 그래프', '합성함수', '함수의 평행이동·대칭이동'],
  '확률': ['확률의 덧셈정리', '조건부확률'],
  '통계': ['이산확률분포', '이항분포', '정규분포'],
  '경우의 수': ['순열', '조합'],
  '기대값': ['이산확률변수의 기댓값 계산', '확률분포표에서 평균·분산'],
  '통계 그래프 해석': ['도수분포표와 상대도수', '히스토그램 해석', '중앙값·최빈값·평균 비교'],
};

// 유형 안에서 세부 주제를 랜덤으로 뽑는다 (없으면 유형명 그대로 사용)
function pickSubtopic(type) {
  const grade = parseInt(state.currentGrade);
  // 5등급 이하면 쉬운 서브토픽 풀 우선 사용
  if (grade >= 5 && EASY_SUBTOPIC_POOL[type]) {
    const easy = EASY_SUBTOPIC_POOL[type];
    return easy[Math.floor(Math.random() * easy.length)];
  }
  const pool = SUBTOPIC_POOL[type];
  if (!pool || pool.length === 0) return type;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 강화된 문제 생성 프롬프트 빌더
// - 세부 주제를 지정해 유형 다양화
// - 답이 정수/간단한 분수/√형태로 깔끔하게 떨어지도록 제약
// - AI에게 출제 후 직접 검산하도록 명시
// ============ 등급별 난이도 지시문 ============
function getGradeDifficulty() {
  const g = parseInt(state.currentGrade);
  if (!g || isNaN(g)) return '수능 4점 표준 난이도';
  if (g <= 2) return '수능 킬러 수준 (4점 최고난도). 조건을 3개 이상 복합 적용하고, 중간에 경우의 수가 나뉘거나 역발상이 필요한 구조로 출제하라. 단순 공식 대입으로는 절대 풀리지 않게 설계하라.';
  if (g <= 4) return '수능 4점 표준 난이도. 핵심 개념 2~3개를 연결하는 2~3단계 풀이 구조로 출제하라.';
  if (g <= 6) return '수능 3점 난이도. 핵심 공식 1~2개를 직접 적용하는 구조로 출제하라. 계산이 복잡하지 않게 설계하라.';
  return '수능 2~3점 개념 확인 수준. 공식을 1~2단계 대입하면 풀리는 기본 문제로 출제하라. 처음 배우는 학생도 풀 수 있게 쉽게 설계하라.';
}

// ============ [v4] 약점 유형명 -> 문제 은행 단원명 매핑 ============
// AI가 성적표/시험지에서 뽑아낸 약점 유형은 "평면 벡터의 연산과 성분" 처럼
// 세부 주제명이라서 은행의 18개 단원명과 글자가 다르다.
// 그대로 조회하면 0건이 나와 매번 라이브 생성으로 빠지므로 여기서 단원명으로 바꿔준다.
const BANK_TYPES = [
  '수와 연산', '방정식과 부등식', '함수', '수열', '지수와 로그', '삼각함수',
  '함수의 극한과 연속', '미분', '적분', '수열의 극한', '미분법', '적분법',
  '경우의 수', '확률', '통계', '이차곡선', '평면벡터', '공간도형과 공간좌표',
];

// 포함 관계로 찾을 때의 검사 순서.
// 구체적/긴 이름이 먼저 와야 한다. ('함수'는 삼각함수·다항함수 등에 다 들어가므로 맨 뒤)
const BANK_MATCH_ORDER = [
  '함수의 극한과 연속', '공간도형과 공간좌표', '방정식과 부등식',
  '수열의 극한', '지수와 로그', '경우의 수', '수와 연산',
  '삼각함수', '이차곡선', '평면벡터', '미분법', '적분법',
  '미분', '적분', '통계', '확률',
];
// '수열'·'함수'는 삼각함수·지수함수·수열의 극한 등에 모두 포함되는 포괄어라
// 키워드 보정을 다 거친 뒤 맨 마지막에만 검사한다.
const BANK_GENERIC_LAST = ['수열', '함수'];

// 단원명이 직접 안 나오는 표현을 위한 키워드 보정
const BANK_KEYWORDS = [
  [['지수', '로그', '상용로그'], '지수와 로그'],
  [['삼각', '사인', '코사인', '탄젠트'], '삼각함수'],
  [['순열', '조합', '이항정리'], '경우의 수'],
  [['정규분포', '확률분포', '이항분포', '표본', '모평균'], '통계'],
  [['조건부', '독립사건', '덧셈정리', '곱셈정리'], '확률'],
  [['포물선', '타원', '쌍곡선', '초점', '이심률'], '이차곡선'],
  [['벡터', '내적'], '평면벡터'],
  [['정사영', '구의 방정식', '공간좌표'], '공간도형과 공간좌표'],
  [['극한', '연속', '사잇값'], '함수의 극한과 연속'],
  [['도함수', '접선', '극대', '극소', '미분계수', '변곡점'], '미분'],
  [['부정적분', '정적분', '넓이', '치환적분', '부분적분'], '적분'],
  [['급수', '등비급수'], '수열의 극한'],
  [['등차', '등비', '시그마', '점화식', '귀납법'], '수열'],
  [['복소수', '판별식', '근과 계수'], '방정식과 부등식'],
  [['역함수', '합성함수', '유리함수', '무리함수'], '함수'],
  [['거듭제곱근', '지수법칙'], '수와 연산'],
];

// 약점 유형명을 은행 단원명으로 변환. 못 찾으면 null (-> 라이브 생성으로 넘어감)
function mapToBankType(name) {
  if (!name) return null;
  const raw = String(name);
  const n = raw.replace(/\s+/g, '');

  // 1) 정확히 일치
  for (const t of BANK_TYPES) {
    if (t.replace(/\s+/g, '') === n) return t;
  }
  // 2) 단원명이 통째로 들어있는 경우 (구체적인 것 우선)
  for (const t of BANK_MATCH_ORDER) {
    if (n.includes(t.replace(/\s+/g, ''))) return t;
  }
  // 3) 키워드 보정
  for (const [keys, t] of BANK_KEYWORDS) {
    for (const k of keys) {
      if (n.includes(k.replace(/\s+/g, ''))) return t;
    }
  }
  // 4) 포괄어는 맨 마지막에
  for (const t of BANK_GENERIC_LAST) {
    if (n.includes(t)) return t;
  }
  return null;   // 은행에 없는 단원 (예: 집합과 명제) -> 기존대로 라이브 생성
}

// ============ [v3] 등급 -> 문제 은행 배점(level) 매핑 ============
// getGradeDifficulty()와 같은 기준으로 나눈다.
//   1~4등급 -> 4점 / 5~6등급 -> 3점 / 7~9등급 -> 2점 / 등급 미설정 -> 4점
// [v6] 등급별 배점 출제 비율 (%).
// 등급 하나에 배점 하나를 1:1로 고정하면 같은 배점만 끝없이 나와서 공부가 단조로워진다.
// 주력 배점을 위주로 내되, 아래위를 섞어서 복습과 도전이 같이 되게 한다.
const LEVEL_MIX = {
  high: { '4': 65, '3': 30, '2':  5 },   // 1~4등급: 4점 위주, 가끔 복습
  mid:  { '3': 55, '2': 25, '4': 20 },   // 5~6등급: 3점 위주 + 2점 복습 + 4점 도전
  low:  { '2': 60, '3': 35, '4':  5 },   // 7~9등급: 2점 위주로 기초 다지기
};

function getGradeBand() {
  const g = parseInt(state.currentGrade);
  if (!g || isNaN(g)) return 'high';
  if (g <= 4) return 'high';
  if (g <= 6) return 'mid';
  return 'low';
}

// 비율에 따라 배점을 하나 뽑는다. 문제를 넘길 때마다 다시 뽑히므로 섞여 나온다.
function getGradeLevel() {
  const mix = LEVEL_MIX[getGradeBand()] || LEVEL_MIX.high;
  const order = ['4', '3', '2'];
  const total = order.reduce((s, lv) => s + (mix[lv] || 0), 0);
  if (total <= 0) return '4';
  let r = Math.random() * total;
  for (const lv of order) {
    r -= (mix[lv] || 0);
    if (r < 0) return lv;
  }
  return order[order.length - 1];
}

// 요청한 배점이 은행에 없을 때 대신 쓸 순서 (쉬운 쪽을 우선 대체)
const LEVEL_FALLBACK = {
  '4': ['4', '3', '2'],
  '3': ['3', '2', '4'],
  '2': ['2', '3', '4'],
};

function buildProblemPrompt(type, opt = {}) {
  const subtopic = pickSubtopic(type);
  const useChoice = opt.forceChoice !== undefined ? opt.forceChoice : (Math.random() < 0.5);
  const choiceStr = useChoice
    ? '객관식으로 출제하고 선택지 ①②③④⑤를 본문에 포함하세요. 정답은 보기 번호(예: ③)로 적으세요.'
    : '단답형(서술형)으로 출제하고 선택지는 넣지 마세요. 정답은 값으로 적으세요.';
  const difficultyStr = getGradeDifficulty();

  return [
    `너는 한국 수능 수학 출제위원이다. [${type}] 단원의 "${subtopic}" 주제로 ${difficultyStr} 문제 1개를 출제하라.`,
    ``,
    `[필수 규칙]`,
    `1. 출제 후 반드시 네가 직접 처음부터 끝까지 풀어 최종 답을 구하라. 한 단계도 건너뛰지 말 것.`,
    `2. (객관식인 경우) 네가 구한 최종 값이 보기 ①~⑤ 중 하나와 "정확히" 일치하는지 확인하라. 일치하지 않으면 그 문제는 버리고, 숫자·설정을 바꿔 다시 출제하라. 절대로 답이 안 맞는 문제를 그대로 내지 마라.`,
    `3. 정답은 반드시 깔끔하게 떨어지는 값이어야 한다. 정수, 간단한 기약분수, 또는 √·로그가 깔끔히 정리된 형태만 허용. 2^(41/24)처럼 지저분하게 남는 답은 금지.`,
    `4. 문제에 조건 누락·모순·중복정의·불필요한 항(예: 8^(3/3))이 없는지, 답이 유일하게 하나로 결정되는지 다시 검토하라. 두 가지로 해석될 여지가 있으면 출제하지 마라.`,
    `4-1. [조건 개수 제한] (가)(나)(다)(라) 식의 이름 붙인 조건은 최대 2개까지만 허용. 3개 이상 조건을 나열하는 구조는 검증이 불가능하므로 절대 금지. 조건이 많이 필요하면 본문에 자연스럽게 녹여 서술하라.`,
    `4-2. [답 형태 제한] 정답은 반드시 한 자리~두 자리 정수, 또는 분모가 10 이하인 기약분수만 허용. $4\sqrt{5}+6$ 같은 무리수 합성형, 복잡한 분수, 소수는 금지. 깔끔한 정수 답이 나오도록 문제를 설계하라.`,
    `4-3. [고위험 조합 금지] 아래 조합은 조건 간 모순이 발생하기 쉬우므로 절대 출제 금지: ①역함수+교점개수+정의역 범위 조건 동시 사용 ②절댓값함수+교점개수 조건+점근선 조건 동시 사용 ③무리함수+역함수+x범위 제약 3개 이상 동시 사용. 이 조합이 필요하면 조건 하나를 제거하거나 단순화하라.`,
    `4-4. [객관식 자가검증 강화] 객관식 출제 시, 네가 구한 최종 답이 보기 ①~⑤ 중 정확히 하나와 일치하지 않으면 문제와 보기를 다시 설계하라. "답이 대략 ③과 비슷하다"는 허용 안 됨. 수치가 정확히 일치해야 한다.`,
    `5. 문제에서 언급하는 모든 조건·수치·관계는 반드시 본문에 그대로 명시하라. "조건을 만족시킨다", "주어진 조건에 따라"처럼 조건을 언급만 하고 실제 내용을 적지 않는 것은 절대 금지. 풀이에 필요한 값이 본문에 다 있어야 한다.`,
    `6. 같은 주제라도 매번 숫자와 설정을 바꿔 새롭게 출제하라.`,
    `7. 모든 수식은 LaTeX 형식으로 $...$ 안에 작성하라. 본문에 마크다운 기호(*, **, #)는 쓰지 마라.`,
    `8. ${choiceStr}`,
    ``,
    `[매우 중요] 출제 전 풀이·검산은 머릿속(추론)으로만 하고, 응답에는 아래 3줄 외에 풀이 과정·설명·검토 내용을 절대 출력하지 마라. 딱 3줄만 출력한다.`,
    ``,
    `[출력 형식 — 아래 3줄만 정확히 출력]`,
    `문제: (문제 내용)`,
    `정답: (검산을 마친 최종 답)`,
    `힌트: (딱 2~3줄. 어떤 개념·공식을 쓰는지와 첫 풀이 방향만. 풀이 전체나 정답·계산 과정은 절대 쓰지 말 것. \\sqrt, \\frac 같은 LaTeX 명령과 $ 기호 쓰지 말고 한글과 일반 기호(√, ², / 등)로만 적을 것.)`,
  ].join('\n');
}

// ============ 생성 결과 파싱 (정답/힌트/본문 분리) ============
function parseProblemResult(result) {
  const hintMatch = result.match(/힌트[：:]\s*([\s\S]+)/);
  let hint = hintMatch ? hintMatch[1].trim() : '';
  // 힌트가 풀이 전체로 새는 것 방지: 첫 문단 + 최대 3줄 + 길이 제한
  hint = hint.split(/\n\s*\n/)[0]
             .split('\n').map(s => s.trim()).filter(Boolean).slice(0, 3).join(' ');
  if (hint.length > 240) hint = hint.slice(0, 240).replace(/\s+\S*$/, '') + '…';
  const answerMatch = result.match(/정답[：:]\s*([^\n]+)/);
  const answer = answerMatch ? answerMatch[1].trim() : '';
  const visibleText = result
    .replace(/\n?정답[：:][\s\S]*?(?=\n힌트|$)/, '')
    .replace(/\n?힌트[：:][\s\S]+/, '')
    .trim();
  return { visibleText, answer, hint };
}

// ============ 객관식 코드 필터 (형식 무결성 검사) ============
// 객관식인데 정답 번호가 보기에 없거나, 보기가 5개 미만이거나 중복이면 형식 오류로 판단
const CIRCLED = ['①','②','③','④','⑤'];
function hasChoiceMarkers(text) {
  return CIRCLED.some(c => text.includes(c));
}
function checkChoiceFormat(visibleText, answer) {
  if (!hasChoiceMarkers(visibleText)) return { ok: true }; // 단답형은 통과
  // 본문에 등장한 보기 기호 수집
  const present = CIRCLED.filter(c => visibleText.includes(c));
  if (present.length < 2) return { ok: false, reason: '선택지 기호가 2개 미만입니다.' };
  // 정답이 보기 번호 형태인지 + 본문에 그 번호가 있는지
  const ansCircle = CIRCLED.find(c => answer.includes(c));
  const ansNumMatch = answer.match(/[1-5]/);
  if (ansCircle) {
    if (!visibleText.includes(ansCircle)) return { ok: false, reason: `정답 보기(${ansCircle})가 본문 선택지에 없습니다.` };
  } else if (ansNumMatch) {
    const idx = parseInt(ansNumMatch[0]) - 1;
    if (idx < 0 || idx >= CIRCLED.length || !visibleText.includes(CIRCLED[idx])) {
      return { ok: false, reason: `정답 번호(${ansNumMatch[0]})에 해당하는 선택지가 본문에 없습니다.` };
    }
  } else {
    return { ok: false, reason: '객관식인데 정답이 보기 번호(①~⑤) 형태가 아닙니다.' };
  }
  return { ok: true };
}

// ============ AI 검증 프롬프트 (채점관 역할) ============
function buildVerifyPrompt(visibleText, answer) {
  return [
    `너는 한국 수능 수학 검수관이다. 출제자가 적은 정답은 절대 믿지 말고, 네가 처음부터 끝까지 직접 풀어라.`,
    ``,
    `[검수할 문제]`,
    visibleText,
    ``,
    `[출제자가 적은 정답] ${answer}`,
    ``,
    `반드시 다음 순서로 하라:`,
    `(1) 문제를 네 힘으로 완전히 풀어 최종 답을 구한다. 계산을 한 단계도 건너뛰지 말 것.`,
    `(2) 객관식이면 네가 구한 값이 보기 ①~⑤ 중 정확히 어느 것과 같은지 확인한다.`,
    `(3) 네가 구한 답과 [출제자가 적은 정답]을 비교한다.`,
    ``,
    `판정 기준 (하나라도 어긋나면 FAIL):`,
    `- 네가 구한 답 ≠ 출제자 정답 → FAIL`,
    `- 객관식인데 네가 구한 값이 보기 ①~⑤ 안에 아예 없음 → FAIL`,
    `- 문제에 조건 누락·모순·중복정의·문장 잘림이 있어 답이 유일하게 결정되지 않음 → FAIL`,
    `- 확신이 안 서거나 두 가지로 해석됨 → FAIL (애매하면 무조건 FAIL)`,
    `- [모순 체크] 조건들이 동시에 성립 가능한지 반드시 확인하라. 예: 조건A에서 a<b, 조건B에서 a>b가 동시에 요구되면 FAIL. 조건 (가)(나)(다) 등을 조합했을 때 어떤 x범위 또는 값 범위 제약이 충돌하는지 명시적으로 점검하라.`,
    `- [범위 체크] 정의역·치역·x조건 등에서 구한 값이 해당 범위를 벗어나면 FAIL. 예: x≥a 조건인데 구한 교점의 x좌표가 a 미만이면 그 교점은 무효.`,
    `- 위 어디에도 해당 안 되고 답이 정확히 일치 → PASS`,
    ``,
    `출력 형식 (반드시 지킬 것):`,
    `먼저 너의 풀이 과정을 쓴다.`,
    `그 다음 줄에 "내가 구한 답: ___" 형식으로 네 최종 답을 명시한다.`,
    `맨 마지막 줄에는 "PASS" 또는 "FAIL" 한 단어만 단독으로 출력한다.`,
    `FAIL이면 마지막 줄 바로 윗줄에 무엇이 어떻게 틀렸는지 한국어로 한 줄 적는다.`,
  ].join('\n');
}

// ============ 검증된 문제 1개 생성 (자가수정 루프) ============
// 출제 → 형식 필터 → AI검증 → 반환
// 검증기가 "확실히 FAIL"한 경우에만 재시도하여 거른다.
// 판정이 불명확(잘림/모호)하면 생성기의 자가검증을 믿고 그대로 사용한다. (좋은 문제를 검증기 탓에 버리지 않음)
async function generateVerifiedProblem(type, opt = {}, maxTries = 2) {
  let lastFeedback = '';
  let fallbackParsed = null; // 형식은 통과한 마지막 문제 (최후의 빈 화면 방지용)

  for (let t = 0; t < maxTries; t++) {
    let prompt = buildProblemPrompt(type, opt);
    if (lastFeedback) {
      prompt += `\n\n[직전 시도가 아래 이유로 불합격했다. 반드시 이 점을 고쳐서 새로 출제하라]\n${lastFeedback}`;
    }
    let result;
    try {
      result = await callGemini(prompt, 14000, 4000);
    } catch (e) {
      if (e && e.isBusy) throw e;
      continue;
    }
    if (!result) continue;

    const parsed = parseProblemResult(result);
    if (!parsed.visibleText || !parsed.answer) {
      lastFeedback = '문제 또는 정답이 형식에 맞게 출력되지 않았습니다.';
      continue;
    }

    // 1) 객관식 형식 필터
    const fmt = checkChoiceFormat(parsed.visibleText, parsed.answer);
    if (!fmt.ok) { lastFeedback = fmt.reason; continue; }

    fallbackParsed = parsed; // 형식 통과 → 최후 보루로 보관

    // 2) AI 검증 (수학적 타당성) — 검수관이 직접 풀어 정답 대조
    try {
      const verdict = await callGeminiUrl(VERIFY_URL, buildVerifyPrompt(parsed.visibleText, parsed.answer), 5000);
      const v = (verdict || '').trim();
      const lines = v.split('\n').map(s => s.trim()).filter(Boolean);
      const lastLine = lines[lines.length - 1] || '';
      const lastIsPass = /^PASS\b/i.test(lastLine);
      const lastIsFail = /^FAIL\b/i.test(lastLine);

      if (lastIsPass) return parsed;          // 확실히 통과
      if (lastIsFail) {                         // 확실히 불합격 → 사유 기록 후 재시도
        lastFeedback = v.replace(/\bPASS\b|\bFAIL\b/gi, '').trim().split('\n').filter(Boolean).slice(-1)[0] || '검증 실패';
        continue;
      }
      // 마지막 줄에 명확한 판정이 없음(사고 길어져 잘림 등) → 생성기 자가검증을 믿고 사용
      const hasPassOnly = /\bPASS\b/i.test(v) && !/\bFAIL\b/i.test(v);
      if (hasPassOnly) return parsed;
      return parsed; // 판정 불명확 → 그대로 사용 (빈 화면 방지)
    } catch (e) {
      if (e && e.isBusy) throw e;
      return parsed; // 검증 API 자체 오류 → 형식 통과 문제 사용
    }
  }
  // 모든 시도가 "확실한 FAIL"이었던 경우에도 빈 화면 대신 마지막 문제를 보여준다.
  return fallbackParsed;
}

// ===== 수학완성 - script.js =====
// Gemini API 연동 수능 수학 AI 학습 도우미

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, limit, onSnapshot, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCf-4hUar_Ub7ukMkaHxFlvHyvnjulK5_g",  authDomain: "math-study-app-16f56.firebaseapp.com",
  projectId: "math-study-app-16f56",
  storageBucket: "math-study-app-16f56.firebasestorage.app",
  messagingSenderId: "68548072606",
  appId: "1:68548072606:web:36089e92e366174d06178f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// 이 프로젝트의 Firestore 데이터는 기본'(default)'이 아니라 이름있는 'math-study-app' DB에 있다.
// 기본 DB로 접근하면 "unavailable"(오프라인처럼 보임) 오류가 나므로 동일한 named DB를 사용한다.
const db = getFirestore(app, 'math-study-app');
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
  } catch (e) { console.warn('Firestore 불러오기 오류(오프라인 가능):', e.code || e.message); return null; }
}

async function loadUserDataFromFirestore() {
  // 프로필 불러오기
  const profile = await loadFromFirestore('data/profile');
  if (profile) {
    if (profile.grade) { state.currentGrade = profile.grade; localStorage.setItem('current_grade', profile.grade); }
    if (profile.score) { state.currentScore = profile.score; localStorage.setItem('current_score', profile.score); }
    if (profile.weakTypes && profile.weakTypes.length > 0) {
      // 마크다운 제거 후 정규화해서 저장 (Firestore 구버전 데이터 대응)
      state.weakTypes = profile.weakTypes.map(t =>
        t.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/^\d+\.\s*/, '').trim()
      ).filter(Boolean);
      localStorage.setItem('weak_types', JSON.stringify(state.weakTypes));
      updateWeakTypesUI(); // Firestore 데이터 받자마자 즉시 반영
    }
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

  // 단원별 성적 기록 불러오기
  const unitScoreData = await loadFromFirestore('data/unit_score_history');
  if (unitScoreData && unitScoreData.history) {
    state.unitScoreHistory = unitScoreData.history;
    localStorage.setItem('unit_score_history', JSON.stringify(unitScoreData.history));
  }

  // AI vs 기출 통계 불러오기
  const aiStatsData = await loadFromFirestore('data/ai_stats');
  if (aiStatsData) { state.aiStats = aiStatsData; localStorage.setItem('ai_stats', JSON.stringify(aiStatsData)); }
  const suneungStatsData = await loadFromFirestore('data/suneung_stats');
  if (suneungStatsData) { state.suneungStats = suneungStatsData; localStorage.setItem('suneung_stats', JSON.stringify(suneungStatsData)); }

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
// localStorage JSON 안전 파싱: 값이 깨져 있어도 앱 전체가 멈추지 않도록 fallback 반환
function lsJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch (e) { return fallback; }
}

const state = {
  apiKey: 'proxy',
  studentName: localStorage.getItem('student_name') || '학생',
  currentGrade: localStorage.getItem('current_grade') || '-',
  currentScore: localStorage.getItem('current_score') || '-',
  weakTypes: lsJSON('weak_types', []),
  selectedWeakType: null,
  scoreHistory: lsJSON('score_history', []),
  unitScoreHistory: lsJSON('unit_score_history', {}),
  aiStats: lsJSON('ai_stats', { total: 0, correct: 0, history: [] }),
  suneungStats: lsJSON('suneung_stats', { total: 0, correct: 0, history: [] }),
  totalProblems: parseInt(localStorage.getItem('total_problems') || '0'),
  correctProblems: parseInt(localStorage.getItem('correct_problems') || '0'),
  streak: parseInt(localStorage.getItem('streak') || '0'),
  lastStudyDate: localStorage.getItem('last_study_date') || '',
  currentProblem: null,
  currentHint: null,
  curriculum: null,
};

// ============ GEMINI API ============
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// 로컬에서 키를 직접 넣고 급히 테스트할 때만 쓴다. 커밋 전에 반드시 다시 비울 것.
// 배포된 사이트는 이 값을 쓰지 않는다 — 서버 함수가 키를 붙인다.
const LOCAL_API_KEY = '';

// 어디로 호출할지 결정한다.
//  - LOCAL_API_KEY 에 키가 들어 있고 로컬이면  → 구글로 바로 호출
//  - 비어 있으면(평소 상태)                   → 항상 서버 함수를 거친다
//    덕분에 로컬에서도 `netlify dev` 로 배포본과 똑같이 테스트할 수 있다.
const PROXY_URL  = '/.netlify/functions/gemini';
const DIRECT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const DIRECT = IS_LOCAL && LOCAL_API_KEY !== '';
function apiUrl() { return DIRECT ? `${DIRECT_URL}?key=${LOCAL_API_KEY}` : PROXY_URL; }

// 서버 함수를 쓸 때는 로그인 증표(토큰)를 같이 보낸다.
// 함수가 이걸로 "로그인했고 승인된 사람인지"를 확인한다.
// 구글로 직접 호출할 때(DIRECT)는 필요 없다.
async function aiHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (DIRECT) return h;
  try {
    const u = auth.currentUser;
    if (u) h['Authorization'] = 'Bearer ' + (await u.getIdToken());
  } catch (e) { console.warn('로그인 토큰을 가져오지 못했습니다:', e.message); }
  return h;
}

// ============ AI 호출 (백그라운드 작업 방식) ============
// 왜 이렇게 하나
//   일반 함수는 30초에 끊긴다. 그런데 시험지 읽기는 40~70초 걸린다.
//   그래서 백그라운드 함수에 "일을 맡기고", 결과는 Firestore 를 통해 받는다.
//
//   브라우저 → 함수            (즉시 202, 답 없음)
//                   함수 → Gemini → Firestore 에 결과 기록
//   브라우저 ← Firestore 실시간 수신
//
//   덤으로: 폰 화면이 꺼져 잠깐 끊겨도 작업은 서버에서 계속 돈다.
//   깨어나면 Firestore 가 알아서 다시 붙어 결과를 가져온다.
const BG_URL = '/.netlify/functions/gemini-background';
const JOB_TIMEOUT_MS = 3 * 60 * 1000;   // 3분 넘으면 포기
// 함수가 일을 받았으면 몇 초 안에 작업 문서를 만든다.
// 이 시간 안에 문서가 안 생기면 함수 쪽이 고장난 것이므로 빨리 알려준다.
// (3분짜리 스피너를 멍하니 보게 하지 않기 위한 장치)
const JOB_FIRST_SIGN_MS = 25 * 1000;

// ★ 비상 스위치
//   백그라운드 방식에 문제가 생기면 이 값을 false 로 바꿔라.
//   예전 방식(일반 함수 gemini.js, 30초 제한)으로 즉시 돌아간다.
//   파일을 되돌릴 필요 없이 이 한 줄만 고치면 된다.
const USE_BACKGROUND = true;

// 사진 요청은 일반 함수로 보낸다 (백그라운드는 256KB 제한이라 사진이 안 들어감).
// 일반 함수는 30초에 끊기므로 출력 토큰을 줄여 그 안에 끝나게 한다.
const IMG_SYNC_MAX_TOKENS = 8000;
const IMG_SYNC_THINK      = 2000;

// 요청 안에 사진이 들어 있는지 본다
function hasImage(body) {
  try {
    return (body.contents || []).some((c) =>
      (c.parts || []).some((p) => p && (p.inline_data || p.inlineData)));
  } catch (_) {
    return false;
  }
}

function newJobId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'j' + Date.now() + Math.random().toString(36).slice(2, 10);
}

// fetch() 의 응답과 똑같이 생긴 물건을 만든다.
// 덕분에 아래 호출부들이 res.ok / res.status / res.json() 을 그대로 쓸 수 있고,
// 기존 재시도·에러 처리 코드를 손대지 않아도 된다.
function jobRes(status, obj) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => obj,
    text: async () => JSON.stringify(obj),
  };
}

async function aiFetch(body) {
  // DIRECT        : 로컬에서 키를 직접 꽂고 급히 테스트할 때 → 구글로 바로 호출
  // USE_BACKGROUND: false 면 예전 방식(일반 함수 gemini.js, 30초 제한)
  if (DIRECT || !USE_BACKGROUND) {
    return fetch(apiUrl(), {
      method: 'POST', headers: await aiHeaders(), body: JSON.stringify(body)
    });
  }

  const u = auth.currentUser;
  if (!u) {
    return jobRes(401, { error: { message: '로그인이 필요합니다. 다시 로그인해 주세요.' } });
  }

  // ── 사진이 든 요청은 일반 함수로 보낸다 ──────────────────────
  // 두 함수의 한계가 정반대다.
  //   일반 함수   : 요청 6MB 까지  / 실행 30초 까지
  //   백그라운드  : 요청 256KB 까지 / 실행 15분 까지
  // 사진은 수백 KB라 백그라운드로 보내면 413 으로 거절당한다.
  // 대신 30초 안에 끝나야 하므로 출력 토큰을 줄여 시간을 맞춘다.
  // (성적표를 읽고 약점 단원을 뽑는 데 24000 토큰은 필요하지 않다)
  if (hasImage(body)) {
    const gc = { ...(body.generationConfig || {}) };
    gc.maxOutputTokens = Math.min(gc.maxOutputTokens || IMG_SYNC_MAX_TOKENS, IMG_SYNC_MAX_TOKENS);
    gc.thinkingConfig = { thinkingBudget: IMG_SYNC_THINK };
    // contents 는 참조로 그대로 둔다 (사진 base64 를 복사하지 않기 위해)
    const sendBody = { ...body, generationConfig: gc };

    const syncStr = JSON.stringify(sendBody);
    const syncMB = syncStr.length / (1024 * 1024);
    if (syncMB > 5) {
      return jobRes(413, { error: { message:
        `사진 용량이 너무 큽니다 (${syncMB.toFixed(1)}MB). 장수를 줄여 주세요.` } });
    }
    console.log(`[AI] 사진 요청 → 일반 함수 (${Math.round(syncStr.length / 1024)}KB, ` +
      `최대 ${gc.maxOutputTokens}토큰)`);

    try {
      return await fetch(PROXY_URL, {
        method: 'POST', headers: await aiHeaders(), body: syncStr
      });
    } catch (e) {
      return jobRes(502, { error: {
        message: '서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.' } });
    }
  }
  // ────────────────────────────────────────────────────────────

  const jobId = newJobId();
  const ref = doc(db, 'users', u.uid, 'jobs', jobId);

  // 백그라운드 함수는 요청을 256KB 까지만 받는다. 넘으면 413 이다.
  // 사진은 위에서 이미 갈라냈으므로 여기 오는 건 글자뿐이라 보통 수십 KB다.
  // 그래도 프롬프트가 길어질 수 있으니 한 번 막아 둔다.
  const reqBody = JSON.stringify({ jobId, payload: body });
  const reqKB = reqBody.length / 1024;
  if (reqKB > 240) {
    return jobRes(413, { error: { message:
      `보낼 내용이 너무 큽니다 (${Math.round(reqKB)}KB). ` +
      `문제 수를 줄여 다시 시도해 주세요.` } });
  }

  // 결과를 기다릴 준비를 먼저 해둔다. 작업을 던지기 전에 걸어야 놓치지 않는다.
  let settle;
  let settled = false;
  let seen = false;          // 작업 문서가 한 번이라도 보였는지
  let stop = () => {};
  let timer = null;
  let firstSign = null;
  const waiting = new Promise((r) => { settle = r; });
  const finish = (v) => {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    if (firstSign) clearTimeout(firstSign);
    try { stop(); } catch (_) {}
    settle(v);
  };

  timer = setTimeout(() => finish(jobRes(504, {
    error: { message: 'AI 응답이 너무 오래 걸립니다. 잠시 후 다시 시도해 주세요.' }
  })), JOB_TIMEOUT_MS);

  // 작업 문서가 아예 안 생기는 경우(함수 고장·보안 규칙 문제)를 빨리 잡는다.
  // 폰이 잠들어 타이머가 늦게 깨어날 수도 있으니, 바로 실패로 보지 않고
  // 문서를 직접 한 번 확인한 뒤에 판단한다.
  firstSign = setTimeout(async () => {
    if (settled || seen) return;
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) return;          // 돌고 있다 → 계속 기다린다
    } catch (_) { return; }               // 확인 자체가 실패 → 그냥 기다린다
    finish(jobRes(502, {
      error: { message: '서버가 작업을 받지 못했습니다. 잠시 후 다시 시도해 주세요.' }
    }));
  }, JOB_FIRST_SIGN_MS);

  stop = onSnapshot(ref,
    (snap) => {
      const d = snap.data();
      if (!d) return;                     // 아직 함수가 문서를 안 만들었다
      seen = true;
      if (d.status === 'done') {
        try { finish(jobRes(200, JSON.parse(d.result))); }
        catch (_) { finish(jobRes(502, { error: { message: 'AI 응답을 읽지 못했습니다.' } })); }
      } else if (d.status === 'error') {
        finish(jobRes(d.httpStatus || 502, {
          error: { message: d.error || 'AI 호출에 실패했습니다.' }
        }));
      }
    },
    (err) => finish(jobRes(502, {
      error: { message: '결과를 받아오지 못했습니다: ' + err.message }
    }))
  );

  // 작업을 던진다. 함수는 즉시 202 를 주고, 뒤에서 계속 돈다.
  try {
    const kick = await fetch(BG_URL, {
      method: 'POST',
      headers: await aiHeaders(),
      body: reqBody,
    });
    if (!kick.ok) {
      const err = await kick.json().catch(() => ({}));
      finish(jobRes(kick.status, err.error
        ? err
        : { error: { message: `요청을 보내지 못했습니다 (${kick.status})` } }));
    }
  } catch (e) {
    finish(jobRes(502, {
      error: { message: '서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.' }
    }));
  }

  const out = await waiting;
  deleteDoc(ref).catch(() => {});   // 다 쓴 작업 문서는 치운다. 실패해도 상관없다.
  return out;
}

const GEMINI_URL = DIRECT ? DIRECT_URL : PROXY_URL;
// 검증용: 출제와 동일한 2.5-flash(사고형)로 직접 풀어 정답을 깐깐하게 대조
const VERIFY_URL = GEMINI_URL;

// ============ 사고 과정이 본문으로 새어 나왔는지 가려낸다 ============
// gemini-2.5-flash 는 생각하는 모델이다. 사고 예산을 다 쓰고도 결론에 이르지
// 못하면, 생각하던 내용을 그대로 답변 본문에 이어서 써버린다. 사고는 영어로
// 하기 때문에 학생 화면에 영어 혼잣말이 쏟아진다.
//   "Ah, I must have made a mistake... Let's restart... This is the same issue."
// 문제가 모순이라 정답에 도달할 수 없을 때 특히 잘 생긴다.
// 이런 응답은 보여 주지 않고 실패로 처리한다.
const _SPILL_TELLS = [
  /\bI must have made a mistake\b/i,
  /\bThere must be a mistake\b/i,
  /\bLet'?s\s+(restart|re-?examine|re-?check|re-?calculate|try again|reconsider)\b/i,
  /\bLet me\s+(reconsider|re-?examine|re-?calculate|recompute|try again)\b/i,
  /\bThis is the same (issue|problem)\b/i,
  /\bprevious thought process\b/i,
  /\bWait,\s/,
  /\bHmm,\s/,
];
function looksLikeThoughtSpill(raw) {
  if (!raw) return false;
  const t = String(raw);
  if (_SPILL_TELLS.some((re) => re.test(t))) return true;

  // 수식을 빼고 남은 '말' 중 한국어 비율이 너무 낮으면 사고 유출로 본다.
  // 수식·LaTeX 명령에는 알파벳이 많아서, 빼고 세지 않으면 멀쩡한 해설도 걸린다.
  const prose = t
    .replace(/\$[^$]*\$/g, ' ')        // $...$ 수식
    .replace(/\\[a-zA-Z]+/g, ' ')      // \frac 같은 명령
    .replace(/[^A-Za-z가-힣]/g, '');
  if (prose.length < 200) return false;           // 짧은 답은 판단하지 않는다
  const ko = (prose.match(/[가-힣]/g) || []).length;
  return ko / prose.length < 0.12;
}

// 재시도할 때 덧붙이는 못박기 문구
const _KO_GUARD = `

★ 반드시 한국어로만 작성하라. 영어 문장 금지.
★ 생각하는 과정을 쓰지 말고, 정리된 결과만 위 형식 그대로 출력하라.
★ "다시 계산해보자", "틀린 것 같다", "Let's", "Wait" 같은 재검토 문구 금지.
★ 계산이 정답과 맞지 않아도 되돌아가지 말고 첫 번째 풀이를 그대로 제시하라.`;

async function callGemini(prompt, maxTokens = 24000, thinkOverride = null) {
  if (!state.apiKey) return null;
  const parts = [{ text: prompt }];
  // gemini-2.5-flash는 thinking 모델 → 사고 토큰도 maxOutputTokens에 포함됨.
  // 사고 예산을 전체의 40%로 제한 → 최소 60%는 항상 실제 출력용으로 확보.
  // (thinkOverride로 직접 지정 가능: 정답이 이미 주어진 채점은 사고를 적게 줘 빠르게)
  const thinkBudget = (thinkOverride != null)
    ? Math.min(thinkOverride, Math.max(0, maxTokens - 512))
    : Math.min(8000, Math.floor(maxTokens * 0.4));
  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: thinkBudget }
    }
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await aiFetch(body);

    if (res.ok) {
      const data = await res.json();
      const cand = data.candidates?.[0];
      if (cand?.finishReason === 'MAX_TOKENS') {
        console.warn('[Gemini] 출력이 토큰 한도로 잘렸습니다. maxOutputTokens를 더 늘리세요.');
      }
      const rparts = cand?.content?.parts || [];
      const text = rparts.filter(p => p.text && !p.thought).map(p => p.text).join('') || '';

      // ⭐ 사고 과정이 새어 나왔으면 보여 주지 않는다.
      //    생각할 자리와 쓸 자리를 함께 넓혀서 다시 시킨다.
      if (looksLikeThoughtSpill(text)) {
        console.warn(`[Gemini] 사고 과정이 본문으로 새어 나왔습니다. (시도 ${attempt})`);
        if (attempt < 3) {
          const gc = body.generationConfig;
          gc.maxOutputTokens = Math.min(maxTokens * 2, 24000);
          gc.thinkingConfig.thinkingBudget = Math.min(
            Math.max(gc.thinkingConfig.thinkingBudget * 2, 4000),
            Math.max(512, gc.maxOutputTokens - 1024)
          );
          body.contents[0].parts[0].text = prompt + _KO_GUARD;
          continue;
        }
        // 세 번 다 샜으면 문제 자체가 모순일 가능성이 높다.
        const spillErr = new Error('풀이를 제대로 만들지 못했어요. 이 문제가 잘못되었을 수 있어요.');
        spillErr.isBusy = true;   // 기존 "다시 시도" 버튼 흐름을 그대로 쓴다
        spillErr.isSpill = true;
        throw spillErr;
      }
      return text;
    }

    const status = res.status;
    if (status === 503 || status === 429) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }
      // 3번 재시도 후에도 혼잡하면 식별 가능한 에러로 표시
      const busyErr = new Error('서버가 혼잡합니다. 잠시 후 다시 시도해주세요.');
      busyErr.isBusy = true;
      throw busyErr;
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 오류 (${status})`);
  }
}

// URL을 직접 지정해서 호출 (검증용 빠른 모델에 사용)
async function callGeminiUrl(targetUrl, prompt, maxTokens = 2000) {
  if (!state.apiKey) return null;
  const thinkBudget = Math.min(8000, Math.floor(maxTokens * 0.4));
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: thinkBudget }
    }
  };
  // targetUrl 은 현재 GEMINI_URL 과 같아 분기할 필요가 없다
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await aiFetch(body);
    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const text = parts.filter(p => p.text && !p.thought).map(p => p.text).join('') || '';
      // 검증 응답에 사고 과정이 새어 나왔으면 빈 값으로 돌린다.
      // 빈 값 = 검증 실패 = 문항 폐기. 애매하면 버리는 쪽이 안전하다.
      if (looksLikeThoughtSpill(text)) {
        console.warn('[Gemini/검증] 사고 과정 유출 → 검증 실패로 처리합니다.');
        return '';
      }
      return text;
    }
    const status = res.status;
    if (status === 503 || status === 429) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }
      const busyErr = new Error('서버가 혼잡합니다. 잠시 후 다시 시도해주세요.');
      busyErr.isBusy = true;
      throw busyErr;
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 오류 (${status})`);
  }
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

  // 로고를 누르면 홈으로. 사람들이 배우지 않아도 이미 아는 규칙이라,
  // 눌리지 않으면 "눌러봤는데 아무 일도 안 일어나는" 경험이 된다.
  // HTML 의 <div> 를 그대로 두고 여기서 버튼처럼 만든다.
  // (div 는 Tab 으로 닿지도 않고 Enter 로 눌리지도 않아서 직접 달아 준다)
  const headerLogo = document.querySelector('.header-logo');
  if (headerLogo) {
    headerLogo.setAttribute('role', 'button');
    headerLogo.setAttribute('tabindex', '0');
    headerLogo.setAttribute('aria-label', '홈으로 이동');
    headerLogo.title = '홈으로';
    headerLogo.addEventListener('click', () => navigateTo('home'));
    headerLogo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();               // 스페이스로 화면이 내려가지 않게
        navigateTo('home');
      }
    });
  }

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
  if (tabId === 'intensive') updateWeakTypesUI(); // 탭 전환 시 최신 데이터 반영
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

// ============ API KEY ============
function saveApiKey() {
  // API 키는 코드에 내장되어 있으므로 별도 저장 불필요
}

function loadApiKeyInputs() {
  const nameEl = document.getElementById('settingName');
  if (nameEl) nameEl.value = state.studentName;
}

// ============ SETTINGS ============
function switchSettingsTab(tab) {
  document.getElementById('settingsTabConfig').classList.toggle('hidden', tab !== 'config');
  document.getElementById('settingsTabHelp').classList.toggle('hidden', tab !== 'help');
  document.querySelectorAll('.settings-tab').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'config') || (i === 1 && tab === 'help'));
  });
}

function openSettings() {
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
  const name = document.getElementById('settingName').value.trim();
  if (name) {
    state.studentName = name;
    localStorage.setItem('student_name', name);
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

  // [v8] 레벨 테스트는 업로드가 없는 세 번째 진단 경로.
  // 업로드 칸과 오른쪽 설정 칸을 통째로 숨기고 테스트 화면만 보여준다.
  const isLevel = (mode === 'level');
  document.getElementById('imageModeArea')?.classList.toggle('hidden', isLevel || mode !== 'image');
  document.getElementById('pdfModeArea')?.classList.toggle('hidden', isLevel || mode !== 'pdf');
  document.querySelector('.analyze-layout .upload-col')?.classList.toggle('hidden', isLevel);
  document.querySelector('.analyze-layout .analyze-right')?.classList.toggle('hidden', isLevel);
  document.getElementById('levelModeArea')?.classList.toggle('hidden', !isLevel);

  if (isLevel) {
    // 이전 분석 결과가 떠 있으면 같이 치운다
    document.getElementById('analyzeResult')?.classList.add('hidden');
    document.getElementById('pdfProblemsArea')?.classList.add('hidden');
    if (typeof renderLevelTestIntro === 'function') renderLevelTestIntro();
    return;
  }

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

// ===== 사진 줄이기 =====
// 보내기 전에 반드시 줄인다. 이유가 셋이다.
//  1) netlify dev 는 요청이 크면 "Stream body too big" 으로 통째로 죽는다.
//  2) 배포 환경(함수)에도 요청 크기 한도가 있다.
//  3) 이미지가 작을수록 입력 토큰이 줄어 비용과 응답 시간이 같이 준다.
// 성적표 글씨가 읽혀야 하므로 너무 줄이면 안 된다. 긴 변 1600px 가 타협점.
// 이 두 값이 품질과 용량을 정한다. 실측값 (4032×3024 사진 기준):
//   1600 / 0.85  →  198KB     가장 가벼움
//   2000 / 0.92  →  493KB     현재 설정. 사진 8장 올려도 여유
//   2400 / 0.92  →  1.08MB    사진을 1~2장만 올릴 때
//   4032 / 0.95  →  5.36MB    함수 한도 6MB에 너무 가까움. 쓰지 말 것
const IMG_MAX_SIDE = 2000;
const IMG_QUALITY  = 0.92;

function shrinkImage(file, maxSide = IMG_MAX_SIDE, quality = IMG_QUALITY) {
  return new Promise((resolve) => {
    // 줄이기에 실패하면(HEIC 등 브라우저가 못 여는 형식) 원본이라도 쓴다
    const fallback = (why) => {
      console.warn('[사진] 축소 실패, 원본을 사용합니다:', why);
      const r = new FileReader();
      r.onload = (e) => {
        const dataUrl = e.target.result;
        resolve({ dataUrl, base64: dataUrl.split(',')[1], shrunk: false });
      };
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    };

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        URL.revokeObjectURL(url);

        const base64 = dataUrl.split(',')[1];
        if (!base64) return fallback('빈 결과');

        console.log(`[사진] ${img.width}×${img.height} → ${w}×${h}, ` +
          `${Math.round(file.size / 1024)}KB → ${Math.round(base64.length * 0.75 / 1024)}KB`);
        resolve({ dataUrl, base64, shrunk: true });
      } catch (e) {
        URL.revokeObjectURL(url);
        fallback(e.message);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      fallback('브라우저가 열 수 없는 형식 (HEIC 등)');
    };

    img.src = url;
  });
}

async function addImageFile(file) {
  const MAX_MB = 20;
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast(`⚠️ ${file.name} 파일이 ${MAX_MB}MB를 초과해요. 더 작은 이미지를 사용해주세요.`);
    return;
  }
  const out = await shrinkImage(file);
  if (!out) {
    showToast(`⚠️ ${file.name} 을(를) 읽지 못했어요. 다른 사진으로 시도해주세요.`);
    return;
  }
  uploadedImages.push({ base64: out.base64, name: file.name, dataUrl: out.dataUrl });
  renderImagePreviews();
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
  // [v5] wrap 요소가 없는 화면에서도 터지지 않게 방어 (예전엔 null 에러가 났다)
  const wrap = wrapId ? document.getElementById(wrapId) : null;
  if (!expressions || expressions.length === 0) {
    if (wrap) wrap.classList.add('hidden');
    return;
  }
  if (wrap) wrap.classList.remove('hidden');
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
    const latex = normalizeDesmosLatex((expr.latex || '').trim());
    if (!latex) return;
    const expObj = { id: `expr_${i}`, latex, color: expr.color || colors[i % colors.length] };
    if (expr.fillOpacity !== undefined) expObj.fillOpacity = expr.fillOpacity;
    // [v5] 점 이름표. 예전엔 label 을 파싱만 하고 Desmos 에 안 넘겨서 아예 안 보였다.
    if (expr.label) {
      expObj.label = expr.label;
      expObj.showLabel = true;
      if (window.Desmos && Desmos.LabelOrientations) {
        expObj.labelOrientation = Desmos.LabelOrientations.ABOVE;
      }
      // 학생이 점을 끌어서 그림을 망가뜨리지 못하게 고정
      if (window.Desmos && Desmos.DragModes) {
        expObj.dragMode = Desmos.DragModes.NONE;
      }
    }
    try {
      calculator.setExpression(expObj);
    } catch (e) {
      console.warn('[Desmos] 수식 무시됨:', latex, e && e.message);
    }
  });

  setTimeout(() => { try { calculator.zoomFit(); } catch(e) {} }, 600);
}


// [v5] Desmos 는 여러 글자짜리 기호에 백슬래시를 요구한다.
// 백슬래시가 없으면 sin(x) 를 s*i*n*(x) 처럼 한 글자 변수들의 곱으로 읽어버린다.
// AI 가 맨 이름으로 적어 보내도 여기서 바로잡는다.
const DESMOS_OPNAMES = ['polygon','distance','midpoint','abs','mean','median','stdev',
  'total','length','join','sort','min','max','mod','floor','ceil','round','sign',
  'gcd','lcm','nCr','nPr'];
const DESMOS_CMDNAMES = ['sin','cos','tan','csc','sec','cot',
  'arcsin','arccos','arctan','sinh','cosh','tanh','log','ln','exp','sqrt','pi','theta'];

function normalizeDesmosLatex(s) {
  if (!s) return '';
  let out = String(s).replace(/\$/g, '');          // $ 로 감싼 경우 제거
  // 함수 이름 뒤에 '(' 가 오는 경우만 변환한다
  DESMOS_OPNAMES.forEach(name => {
    const re = new RegExp('(^|[^\\\\A-Za-z{])' + name + '(?=\\s*\\()', 'g');
    out = out.replace(re, '$1\\operatorname{' + name + '}');
  });
  DESMOS_CMDNAMES.forEach(name => {
    const re = new RegExp('(^|[^\\\\A-Za-z{])' + name + '(?![A-Za-z])', 'g');
    out = out.replace(re, '$1\\' + name);
  });
  return out.trim();
}

// [v5] "y=x^2", "(1,3)|A", "polygon(...)" 형태의 줄 배열 -> Desmos 표현식 객체 배열
function buildDesmosExprs(lines) {
  if (!Array.isArray(lines)) return [];
  const colors = ['#4A90E2', '#FF6B6B', '#34C759', '#FF9500', '#5856D6', '#FF2D55'];
  return lines
    .map(l => String(l || '').trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('//'))
    .map((line, i) => {
      // 점+이름표: (1,3)|A
      const labelMatch = line.match(/^(\([^)]+\))\|(.+)$/);
      if (labelMatch) {
        return { latex: labelMatch[1].trim(), label: labelMatch[2].trim(), color: colors[i % colors.length] };
      }
      // 도형은 채우기를 연하게
      if (/^(\\operatorname\{)?polygon/.test(line)) {
        return { latex: line, color: colors[i % colors.length], fillOpacity: 0.15 };
      }
      return { latex: line, color: colors[i % colors.length] };
    });
}

// 라이브 생성 쪽에서 쓰는 DESMOS_START/END 블록 파서 (위 함수로 위임)
function parseDesmosExpressions(text) {
  const match = String(text || '').match(/DESMOS_START([\s\S]*?)DESMOS_END/);
  if (!match) return [];
  return buildDesmosExprs(match[1].trim().split('\n'));
}

// [v5] 화면에서 사라진 Desmos 인스턴스 정리 (문제를 계속 넘기면 메모리가 쌓인다)
function cleanupDesmos() {
  Object.keys(desmosInstances).forEach(id => {
    if (!document.getElementById(id)) {
      try { desmosInstances[id].destroy(); } catch (e) {}
      delete desmosInstances[id];
    }
  });
}

// [v5] 문제 카드 안의 그래프를 모두 렌더. attachChoiceListeners 와 같은 방식으로 쓴다.
function renderCardGraphs(wrap) {
  if (!wrap) return;
  cleanupDesmos();
  wrap.querySelectorAll('[data-desmos]').forEach(holder => {
    let lines = [];
    try {
      lines = JSON.parse(decodeURIComponent(holder.getAttribute('data-desmos') || '[]'));
    } catch (e) { return; }
    const target = holder.querySelector('.problem-graph');
    if (!target || !lines.length) return;
    if (!window.Desmos) {           // 라이브러리 로드 실패 -> 그래프 영역만 숨김
      holder.classList.add('hidden');
      return;
    }
    renderDesmos(target.id, null, buildDesmosExprs(lines));
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
function renderProblemHTML(text, midHtml) {
  // 힌트/정답 제거 후 마크다운 제거
  const clean = text
    .replace(/DESMOS_START[\s\S]*?DESMOS_END/g, '')   // [v5] 날것으로 찍히는 것 방지
    .replace(/^[ \t]*그래프[：:].*$/gm, '')
    // [v9] 맨 앞의 "문제:" 는 생성 출력 형식이 새어나온 것.
    // 카드 헤더에 이미 "문제 1" 이 있어서 두 번 적히므로 지운다.
    .replace(/^\s*문제\s*[：:]\s*/, '')
    .replace(/\n?힌트[：:][\s\S]*/g, '')
    .replace(/\n?정답[：:][^\n]*/g, '')
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    .replace(/\*{2,}/g, '')
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

  // [v6] 본문과 보기 사이에 끼워 넣을 내용 (그래프).
  // 실제 수능 시험지도 그림이 보기 위에 오므로 순서를 맞춘다.
  if (midHtml) html += midHtml;

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
  const card = btn.closest('.multi-problem-card');
  if (card) {
    card.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  }
  btn.classList.add('selected');
  selectedChoice = choice;
};

// 수식 포함 텍스트를 HTML로 변환 (줄바꿈 + $ 기호 보존, 마크다운 제거)
function mathHtml(text) {
  return fixVectors(text)
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')  // **굵게**, *기울기* 제거
    .replace(/\*{2,}/g, '')                       // 짝 안 맞는 잔여 ** 제거
    .replace(/#{1,6}\s*/g, '')                    // ## 제목 제거
    .replace(/---+/g, '')                         // --- 구분선 제거
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
}

// 풀이/분석 본문 전용: 번호 단계·수식·하위항목을 줄 단위로 분리해 간격을 줌
// 깨진 벡터 표기 복구: 글자 뒤에 결합형 화살표(⃗ ⃖ ⃡ 등)가 붙어 두부박스(⊠)로
// 보이는 것을 MathJax 벡터 표기로 변환. 수식 밖 \vec{}, \overrightarrow{} 도 감쌈.
function fixVectors(text) {
  if (text == null) return '';
  text = String(text);
  var A = '[\\u20D7\\u20D6\\u20E1\\u20EE\\u20EF\\u034A]'; // 결합형 화살표류
  // 수식 밖: 구분자($)까지 새로 붙여서 변환
  var outside = function(s) {
    return s
      .replace(new RegExp('([A-Za-z]{2,3})' + A, 'g'), '$\\overrightarrow{$1}$')
      .replace(new RegExp('([A-Za-z])' + A, 'g'), '$\\vec{$1}$');
  };
  // 수식 안: 이미 $...$ 안이므로 구분자 없이 화살표만 변환 (중첩 $ 방지)
  var inside = function(s) {
    return s
      .replace(new RegExp('([A-Za-z]{2,3})' + A, 'g'), '\\overrightarrow{$1}')
      .replace(new RegExp('([A-Za-z])' + A, 'g'), '\\vec{$1}');
  };
  // 수식 구간: $$...$$, \[...\], $...$, \(...\)  (긴 것 먼저)
  var mathRe = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]*?\$|\\\([\s\S]*?\\\))/g;
  var result = '', last = 0, m;
  while ((m = mathRe.exec(text)) !== null) {
    result += outside(text.slice(last, m.index));
    result += inside(m[0]);
    last = m.index + m[0].length;
  }
  result += outside(text.slice(last));
  return result;
}

// 힌트 표시용: 이스케이프·벡터 변환 후, 짝이 안 맞는 $(깨진 수식) 정리
// 날LaTeX 명령을 읽을 수 있는 일반 기호로 변환 (힌트는 평문이라 MathJax에 의존하지 않음)
function latexToText(s) {
  return String(s)
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)')
    .replace(/\\sqrt\s*([0-9a-zA-Z])/g, '√$1')
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\times/g, '×').replace(/\\cdot/g, '·').replace(/\\div/g, '÷')
    .replace(/\\le(?:q)?\b/g, '≤').replace(/\\ge(?:q)?\b/g, '≥')
    .replace(/\\neq\b/g, '≠').replace(/\\pm\b/g, '±')
    .replace(/\\(?:implies|Rightarrow|rightarrow|to)\b/g, '→')
    .replace(/\\(?:left|right)\b/g, '')
    .replace(/\\[a-zA-Z]+\b/g, '')   // 남은 LaTeX 명령 제거
    .replace(/[{}]/g, '')            // 남은 중괄호 제거
    .replace(/\$/g, '');             // $ 구분자 제거
}

function cleanHint(text) {
  if (!text) return '';
  return mathHtml(latexToText(String(text)));
}

function richBody(text) {
  text = fixVectors(text);
  const esc = (s) => s
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/---+/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return text.split('\n').map((line) => {
    const t = line.trim();
    if (t === '') return '<div style="height:10px"></div>';
    // 1. 2. 3. 또는 "N단계" 처럼 단계 머리줄 → 구분선 + 강조
    if (/^\d+[.)]\s/.test(t) || /^\d+\s*단계/.test(t)) {
      return `<div style="margin:16px 0 4px;padding-top:12px;border-top:1px solid var(--border);font-weight:700;color:#2b3a67;line-height:1.6;">${esc(line)}</div>`;
    }
    // ▸ ㄴ - • 로 시작하는 하위 항목 → 카드형 블록
    if (/^[▸ㄴ•·\-]/.test(t)) {
      return `<div style="margin:8px 0;padding:6px 10px 6px 14px;background:rgba(74,144,226,0.05);border-left:2px solid rgba(74,144,226,0.25);border-radius:4px;color:var(--text);line-height:1.65;">${esc(line)}</div>`;
    }
    // 일반 줄
    return `<div style="margin:6px 0;line-height:1.65;">${esc(line)}</div>`;
  }).join('');
}

// 풀이 본문을 "N단계"/번호 기준으로 잘라 단계별 아코디언으로 렌더 (풀이 연습 = 자세히)
function stepsAccordion(text) {
  const lines = String(text).split('\n');
  const headRe = /^\s*(?:\d+\s*단계|\d+[.)]\s)/;
  const steps = [];
  let cur = null;
  lines.forEach(line => {
    const t = line.trim();
    if (headRe.test(t)) { cur = { head: t, body: [] }; steps.push(cur); }
    else if (cur) { cur.body.push(line); }
    else { cur = { head: null, body: [line] }; steps.push(cur); }
  });
  const stepCount = steps.filter(s => s.head !== null).length;
  if (stepCount < 2) return richBody(text); // 단계 구분이 없으면 일반 렌더로 폴백

  let firstStep = true;
  return steps.map(s => {
    const inner = richBody(s.body.join('\n').trim());
    if (s.head === null) return inner ? `<div style="margin:2px 0 8px;">${inner}</div>` : '';
    const open = firstStep ? ' open' : ''; firstStep = false;
    return `<details class="step-acc"${open} style="border:1.5px solid var(--border);border-radius:10px;margin:8px 0;background:var(--card);overflow:hidden;">
      <summary style="cursor:pointer;list-style:none;padding:11px 14px;font-weight:700;color:#2b3a67;display:flex;align-items:center;gap:8px;">
        <span style="color:var(--accent);flex:none;">▸</span><span>${mathHtml(s.head)}</span>
      </summary>
      <div style="padding:4px 14px 12px;line-height:2;border-top:1px solid var(--border);">${inner}</div>
    </details>`;
  }).join('');
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
  btn.innerHTML = `<span class="spinner"></span>AI가 이미지 ${uploadedImages.length}장을 분석하고 있어요... (${uploadedImages.length > 8 ? '50~80' : '30~50'}초 소요)`;
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
  } else if (subjectType === '없음') {
    subjectItems = '(선택과목 없음 - 학교 내신 시험이라 공통과목만 분석)';
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
(가장 약한 유형 3개를 골라 아주 구체적으로 작성. "코멘트","이미지" 같은 단어 금지. 각 항목을 아래 형식 그대로, 줄바꿈까지 포함해서 자세히 작성)
1. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 이 학생이 정확히 어느 지점에서 막히는지 2~3문장으로 구체적으로
   ▸ 실수 원인: 왜 자꾸 틀리는지(개념 구멍 / 계산 습관 / 조건 해석 / 시간 부족 등) 1~2문장
2. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 위와 같은 형식으로 구체적으로
   ▸ 실수 원인: 1~2문장
3. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 위와 같은 형식으로 구체적으로
   ▸ 실수 원인: 1~2문장

【이렇게 공부하세요】
위에서 짚은 약점 3가지 각각에 대해, 오늘부터 바로 실천할 수 있는 해결법을 구체적으로 작성. 두루뭉술하지 말고 실제로 따라할 수 있게:
1. (위 1번 약점) 극복법
   ▸ 먼저 잡을 개념: 어떤 기초 개념·공식부터 다시 정리해야 하는지
   ▸ 연습 방법: 어떤 유형을 며칠 동안 하루 몇 문제씩, 어떤 순서로 풀지 구체적으로
   ▸ 실수 방지 팁: 문제 풀 때 체크할 점 1~2가지
2. (위 2번 약점) 극복법
   ▸ 먼저 잡을 개념: ...
   ▸ 연습 방법: ...
   ▸ 실수 방지 팁: ...
3. (위 3번 약점) 극복법
   ▸ 먼저 잡을 개념: ...
   ▸ 연습 방법: ...
   ▸ 실수 방지 팁: ...

【AI 한마디 조언】
학생 이름을 부르며 따뜻하게, 2~3문장으로 격려`;

  parts.push({ text: imagePrompt });

  try {
    const result = await callGeminiWithParts(parts, 16000);
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
  btn.innerHTML = '<span class="spinner"></span>AI가 시험지를 읽고 있어요... (40~70초 소요)';
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
  } else if (subjectTypePdf === '없음') {
    subjectItemsPdf = '(선택과목 없음 - 학교 내신 시험이라 공통과목만 분석)';
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
(틀린 문제들을 근거로, 가장 약한 유형 3개를 아주 구체적으로 작성. "코멘트","이미지" 단어 금지. 각 항목을 아래 형식 그대로, 줄바꿈까지 포함해서 자세히)
1. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 어떤 문제의 어느 단계에서 틀렸는지 2~3문장으로 구체적으로 (틀린 문제 번호 언급 가능)
   ▸ 실수 원인: 왜 틀렸는지(개념 구멍 / 계산 실수 / 조건 누락 등) 1~2문장
2. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 위와 같은 형식으로 구체적으로
   ▸ 실수 원인: 1~2문장
3. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 위와 같은 형식으로 구체적으로
   ▸ 실수 원인: 1~2문장

【이렇게 공부하세요】
위에서 짚은 약점 3가지 각각에 대해, 오늘부터 바로 실천할 수 있는 해결법을 구체적으로 작성. 두루뭉술하지 말고 실제로 따라할 수 있게:
1. (위 1번 약점) 극복법
   ▸ 먼저 잡을 개념: 어떤 기초 개념·공식부터 다시 정리해야 하는지
   ▸ 연습 방법: 어떤 유형을 며칠 동안 하루 몇 문제씩, 어떤 순서로 풀지 구체적으로
   ▸ 실수 방지 팁: 문제 풀 때 체크할 점 1~2가지
2. (위 2번 약점) 극복법
   ▸ 먼저 잡을 개념: ...
   ▸ 연습 방법: ...
   ▸ 실수 방지 팁: ...
3. (위 3번 약점) 극복법
   ▸ 먼저 잡을 개념: ...
   ▸ 연습 방법: ...
   ▸ 실수 방지 팁: ...

【AI 한마디】
학생 이름을 부르며 따뜻하게, 2~3문장으로 격려`;

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
  btn.innerHTML = '<span class="spinner"></span>AI가 성적을 분석하고 있어요... (30~50초 소요)';
  btn.disabled = true;
  document.getElementById('analyzeResult').classList.add('hidden');

  const subjectType2 = document.getElementById('subjectType')?.value || '확률과통계';
  let subjectItems2 = '';
  if (subjectType2 === '미적분') {
    subjectItems2 = '- 극한: 상/중/하\n- 미분: 상/중/하\n- 적분: 상/중/하';
  } else if (subjectType2 === '기하') {
    subjectItems2 = '- 이차곡선: 상/중/하\n- 벡터: 상/중/하\n- 공간도형: 상/중/하';
  } else if (subjectType2 === '없음') {
    subjectItems2 = '(선택과목 없음 - 학교 내신 시험이라 공통과목만 분석)';
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
(성적표에서 가장 낮은 유형 3개를 아주 구체적으로 작성. "코멘트","이미지" 단어 금지. 각 항목을 아래 형식 그대로, 줄바꿈까지 포함해서 자세히)
1. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 이 학생이 정확히 어느 지점에서 약한지 2~3문장으로 구체적으로
   ▸ 실수 원인: 왜 점수가 낮은지(개념 구멍 / 계산 습관 / 조건 해석 / 시간 부족 등) 1~2문장
2. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 위와 같은 형식으로 구체적으로
   ▸ 실수 원인: 1~2문장
3. 유형명 (구체적인 세부 개념까지)
   ▸ 약점 진단: 위와 같은 형식으로 구체적으로
   ▸ 실수 원인: 1~2문장

【이렇게 공부하세요】
위에서 짚은 약점 3가지 각각에 대해, 오늘부터 바로 실천할 수 있는 해결법을 구체적으로 작성. 두루뭉술하지 말고 실제로 따라할 수 있게:
1. (위 1번 약점) 극복법
   ▸ 먼저 잡을 개념: 어떤 기초 개념·공식부터 다시 정리해야 하는지
   ▸ 연습 방법: 어떤 유형을 며칠 동안 하루 몇 문제씩, 어떤 순서로 풀지 구체적으로
   ▸ 실수 방지 팁: 문제 풀 때 체크할 점 1~2가지
2. (위 2번 약점) 극복법
   ▸ 먼저 잡을 개념: ...
   ▸ 연습 방법: ...
   ▸ 실수 방지 팁: ...
3. (위 3번 약점) 극복법
   ▸ 먼저 잡을 개념: ...
   ▸ 연습 방법: ...
   ▸ 실수 방지 팁: ...

【AI 한마디 조언】
학생 이름을 부르며 따뜻하게, 2~3문장으로 작성`;

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
(반드시 "1단계:", "2단계:" 형식으로 시작. 전체 4단계 이내. 각 단계 한 문장. ★(가)(나)(다) 조건은 조건명 재나열 금지, 결과값만 바로 사용. 케이스 1개만, 나머지는 "같은 방식으로" 한 줄 처리. 수식은 $...$ LaTeX 형식)

∴ 최종 답: (정답을 마지막에 한 번 더 강조)

💡 핵심 팁
(한 줄)`;

  try {
    const result = await callGemini(prompt, 5500, 2000);
    const isCorrect = parseAiVerdict(result);
    fb.innerHTML = renderFeedback(result, isCorrect);
    incrementProblems(isCorrect, p.content, solve, '', '', 'suneung');
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
async function callGeminiWithParts(parts, maxTokens = 24000) {
  if (!state.apiKey) return null;
  const thinkBudget = Math.min(8000, Math.floor(maxTokens * 0.4));
  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: thinkBudget }
    }
  };
  const res = await aiFetch(body);
  if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || 'API 오류'); }
  const data = await res.json();
  const responseParts = data.candidates?.[0]?.content?.parts || [];
  return responseParts.filter(p => p.text && !p.thought).map(p => p.text).join('') || '';
}

// ===== Gemini API 호출 - PDF =====
async function callGeminiWithPdf(prompt, maxTokens = 24000) {
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
    const todayStr = toDateKey(new Date());
    // 같은 날짜면 업데이트, 아니면 새로 추가
    const lastIdx = state.scoreHistory.findIndex(s => s.date === todayStr);
    const examLabel = document.getElementById('examType')?.value || '모의고사';
    const examGrade = gradeMatch ? parseInt(gradeMatch[2] || gradeMatch[1]) : null;
    if (lastIdx !== -1) {
      state.scoreHistory[lastIdx].score = state.currentScore;
      state.scoreHistory[lastIdx].label = examLabel;
      if (examGrade) state.scoreHistory[lastIdx].grade = examGrade;
    } else {
      state.scoreHistory.push({ date: todayStr, score: state.currentScore, label: examLabel, grade: examGrade });
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
    const bodyHtml = richBody(sec.body);
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

// 풀이 사진 파일 1개 처리 (파일 선택 + 드래그앤드롭 공용)
function readSolveFile(file) {
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) {
    showInfoModal('📷 이미지만 가능', 'JPG, PNG 같은 이미지 파일을 올려주세요!');
    return;
  }
  shrinkImage(file).then((out) => {
    if (!out) {
      showInfoModal('📷 읽기 실패', '사진을 읽지 못했어요. 다른 사진으로 시도해주세요.');
      return;
    }
    solveImageBase64 = out.base64;
    document.getElementById('solvePreviewImg').src = out.dataUrl;
    document.getElementById('solvePreview').classList.remove('hidden');
    document.getElementById('solveUploadArea').classList.add('hidden');
  });
}

window.handleSolveImage = function(event) {
  readSolveFile(event.target.files[0]);
};

// 풀이 연습 업로드 영역 드래그앤드롭 연결
(function setupSolveDnD() {
  const area = document.getElementById('solveUploadArea');
  if (!area) return;
  ['dragenter', 'dragover'].forEach(ev => area.addEventListener(ev, (e) => {
    e.preventDefault(); e.stopPropagation();
    area.classList.add('drag-over');
  }));
  ['dragleave', 'dragend'].forEach(ev => area.addEventListener(ev, (e) => {
    e.preventDefault(); e.stopPropagation();
    area.classList.remove('drag-over');
  }));
  area.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    area.classList.remove('drag-over');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) readSolveFile(file);
  });
})();

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
      generationConfig: { maxOutputTokens: 24000, thinkingConfig: { thinkingBudget: 8000 } }
    };
    const res = await aiFetch(body);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `AI 호출 실패 (${res.status})`);
    const rparts = data.candidates?.[0]?.content?.parts || [];
    const result = rparts.filter(p => p.text && !p.thought).map(p => p.text).join('') || '분석 실패';
    const hasCorrect = result.includes('✅');
    feedback.innerHTML = `<div style="font-weight:800;font-size:1rem;margin-bottom:16px;">📝 풀이 피드백</div>` + renderFeedback(result, hasCorrect);
    renderMath(feedback);
  } catch(e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
};


// ============ 단원 선택 칩 피커 (드롭다운 대체 UI) ============
function selectMathType(value) {
  const sel = document.getElementById('mathType');
  if (sel) sel.value = value;
  syncMathPicker();
}
function syncMathPicker() {
  const sel = document.getElementById('mathType');
  const picker = document.getElementById('mathTypePicker');
  if (!sel || !picker) return;
  picker.querySelectorAll('.tp-chip').forEach(chip => {
    chip.classList.toggle('selected', chip.dataset.value === sel.value);
  });
}
function buildMathPicker() {
  const sel = document.getElementById('mathType');
  const picker = document.getElementById('mathTypePicker');
  if (!sel || !picker) return;
  picker.innerHTML = '';
  Array.from(sel.children).forEach(group => {
    if (group.tagName !== 'OPTGROUP') return;
    const g = document.createElement('div');
    g.className = 'tp-group';
    const label = document.createElement('div');
    label.className = 'tp-group-label';
    label.textContent = group.label;
    const chips = document.createElement('div');
    chips.className = 'tp-chips';
    Array.from(group.children).forEach(opt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tp-chip';
      chip.dataset.value = opt.value;
      chip.textContent = opt.textContent;
      chip.onclick = () => selectMathType(opt.value);
      chips.appendChild(chip);
    });
    g.appendChild(label);
    g.appendChild(chips);
    picker.appendChild(g);
  });
  syncMathPicker();
}
(function initMathPicker() {
  if (document.getElementById('mathTypePicker')) buildMathPicker();
})();

// ============ AI 문제 은행 (Firestore ai_problems) 조회 ============
// 단원별로 처음 한 번만 Firestore에서 받아 메모리에 캐시한다.
// - 읽기 비용: 단원당 첫 조회 때만 문서 수만큼(약 20회), 이후 0회
// - 다양성: 캐시를 섞어 순서대로 내보내므로 전부 볼 때까지 같은 문제가 안 나옴
const BANK_DEBUG = false;          // true로 바꾸면 조회 로그 출력
// [v3] 캐시 구조: type -> { all: [], byLevel: { '2': {all,queue}, '3': {...}, '4': {...} } }
// Firestore 조회는 단원당 한 번 그대로. 배점 분류는 메모리에서 하므로 읽기 비용이 늘지 않는다.
const _bankCache = {};
function _shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// 배점 하나에서 한 문제 꺼내기 (다 돌면 다시 섞어서 순환)
function _takeFromLevel(entry, lv) {
  const slot = entry.byLevel[lv];
  if (!slot || slot.all.length === 0) return null;
  if (slot.queue.length === 0) slot.queue = _shuffle(slot.all);
  return slot.queue.shift();
}
// opt.levels 로 대체 배점 범위를 직접 지정할 수 있다.
// 레벨 테스트처럼 "2·3점만" 써야 할 때 4점으로 빠지는 걸 막는다.
async function fetchFromBank(type, level, opt = {}) {
  const want = level || getGradeLevel();
  try {
    let entry = _bankCache[type];
    if (!entry) {
      const snap = await getDocs(query(collection(db, 'ai_problems'), where('type', '==', type), limit(100)));
      const all = [];
      snap.forEach(d => all.push(d.data()));
      // 배점별로 쪼개서 각각 섞어둔다. level 필드가 없는 옛 문제는 4점으로 본다.
      const byLevel = {};
      ['2', '3', '4'].forEach(lv => {
        const items = all.filter(p => String(p.level || '4') === lv);
        byLevel[lv] = { all: items, queue: _shuffle(items) };
      });
      entry = _bankCache[type] = { all, byLevel };
      if (BANK_DEBUG) {
        console.log('[fetchFromBank] 캐시 적재:', type, all.length + '개',
          '(2점 ' + byLevel['2'].all.length + ' / 3점 ' + byLevel['3'].all.length + ' / 4점 ' + byLevel['4'].all.length + ')');
      }
    }
    if (entry.all.length === 0) return null;          // 은행에 이 단원 없음 -> 라이브 fallback

    // 요청 배점 -> 없으면 대체 배점 순서대로
    let picked = null, usedLevel = null;
    for (const lv of (opt.levels || LEVEL_FALLBACK[want] || ['4', '3', '2'])) {
      picked = _takeFromLevel(entry, lv);
      if (picked) { usedLevel = lv; break; }
    }
    if (!picked) return null;

    if (BANK_DEBUG) {
      console.log('[fetchFromBank] 출제:', type,
        usedLevel === want ? `${usedLevel}점` : `${usedLevel}점 (요청 ${want}점 없어 대체)`,
        `(남은 ${entry.byLevel[usedLevel].queue.length}개)`);
    }
    return { visibleText: picked.visibleText, answer: picked.answer, hint: picked.hint || '', level: usedLevel, desmos: picked.desmos || [] };
  } catch (err) {
    console.warn('[fetchFromBank] 은행 조회 실패:', err.code || '', err.message);
    return null;
  }
}

// ============ 기본 문제 - 다중 출제 ============
window.getBasicProblems = async function(mode) {
  state.lastBasicMode = mode;
  const type = document.getElementById('mathType').value;
  const listWrap = document.getElementById('basicProblemList');
  listWrap.classList.remove('hidden');
  listWrap.innerHTML = '<span class="spinner"></span> 문제 불러오는 중...';
  document.getElementById('basicFeedback').classList.add('hidden');

  if (mode === 'db') {
    // 수능 DB에서 선택 과목 필터링 후 10개
    try {
      const db2 = db; // 동일 named DB 재사용
      const snap = await getDocs(collection(db2, 'questions'));
      const all = [];
      const targetSection = getSectionFromType(type);
      snap.forEach(d => {
        const item = d.data();
        // 선택한 단원이 속한 과목(section)의 문제만 출제. 공통은 공통 단원 선택 시에만 나옴.
        if (!targetSection || item.section === targetSection) {
          all.push(item);
        }
      });
      if (all.length === 0) {
        listWrap.innerHTML = '<p style="color:var(--text2);padding:16px;">해당 과목의 기출 문제가 없어요.</p>';
        return;
      }
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 1);
      renderMultiProblems(shuffled, listWrap, 'basic', 'db');
      renderBasicButtonRow();
    } catch(e) {
      listWrap.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
      renderBasicButtonRow();
    }
  } else {
    // AI: 먼저 은행(ai_problems)에서 즉시 조회, 없으면 라이브 생성으로 fallback
    listWrap.innerHTML = '';
    const itemEl = document.createElement('div');
    itemEl.className = 'multi-problem-item';
    itemEl.innerHTML = `<span class="spinner"></span> 문제 불러오는 중...`;
    listWrap.appendChild(itemEl);

    let parsed = await fetchFromBank(type);

    if (!parsed) {
      // 은행에 없으면 라이브 생성 (apiKey 필요)
      if (!state.apiKey) {
        itemEl.innerHTML = `<div style="color:var(--text2);padding:8px;">이 단원 은행이 아직 비어있어요. API 키를 등록하면 즉석에서 만들어드릴 수 있어요. 🔑</div>`;
        renderBasicButtonRow();
        return;
      }
      itemEl.innerHTML = `<span class="spinner"></span> AI가 문제를 만들고 있어요... (20~40초 소요)`;
      try {
        parsed = await generateVerifiedProblem(type);
      } catch (e) {
        const msg = (e && e.isBusy) ? '서버가 혼잡해요. 잠시 후 다시 시도해주세요. ⏳' : `출제 실패: ${e.message}`;
        itemEl.innerHTML = `<div style="color:var(--red);padding:8px;">${msg}</div>`;
        renderBasicButtonRow();
        return;
      }
    }

    if (!parsed) {
      itemEl.innerHTML = `<div style="color:var(--text2);padding:8px;">문제를 불러오지 못했어요. 다시 시도해주세요. 🔄</div>`;
    } else {
      itemEl.innerHTML = renderMultiProblemItem(1, parsed.visibleText, parsed.hint, parsed.answer, 'basic', 'ai', type, '', parsed.level, parsed.desmos);
      renderMath(itemEl);
      renderCardGraphs(itemEl);
    }
    attachChoiceListeners(listWrap);
    renderBasicButtonRow();
  }
};

// 기본 문제 하단 버튼 행 (채점하기 + 다른 문제) — AI·수능 두 경로 공용
function renderBasicButtonRow() {
  const listWrap = document.getElementById('basicProblemList');
  if (!listWrap) return;
  // 문제 카드가 실제로 있으면 채점 버튼 표시
  const problemLoaded = !!listWrap.querySelector('.multi-problem-card');
  const oldRow = document.getElementById('basicBtnRow');
  if (oldRow) oldRow.remove();
  const row = document.createElement('div');
  row.id = 'basicBtnRow';
  row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;';
  if (problemLoaded) {
    const checkAllBtn = document.createElement('button');
    checkAllBtn.id = 'checkAllBtn-basic';
    checkAllBtn.className = 'btn-primary check-all-btn';
    checkAllBtn.innerHTML = '✅ 채점하기';
    checkAllBtn.onclick = () => checkAllAnswers('basic');
    row.appendChild(checkAllBtn);
  }
  const moreBtn = document.createElement('button');
  moreBtn.className = 'btn-ghost';
  moreBtn.style.cssText = 'padding:12px 20px;border:1.5px solid var(--border);border-radius:12px;background:var(--card);color:var(--accent);font-weight:700;cursor:pointer;';
  moreBtn.innerHTML = '🔄 다른 문제';
  moreBtn.onclick = () => getBasicProblems(state.lastBasicMode || 'ai');
  row.appendChild(moreBtn);
  listWrap.appendChild(row);
}


// ============ 유형 집중 - 다중 출제 ============
window.startIntensiveMulti = async function(mode) {
  if (mode === 'ai' && !state.apiKey) { showApiKeyWarning(); return; }
  const listWrap = document.getElementById('intensiveProblemList');
  document.getElementById('intensiveFeedback').classList.add('hidden');

  // 약점 분석이 없으면 → 성적분석으로 유도
  if (!state.weakTypes || state.weakTypes.length === 0) {
    listWrap.classList.remove('hidden');
    listWrap.innerHTML = `<div style="text-align:center;padding:28px 16px;">
      <div style="font-size:2.2rem;margin-bottom:10px;">🧭</div>
      <p style="font-weight:700;color:var(--text);font-size:1.05rem;margin-bottom:8px;">아직 약점 분석이 없어요</p>
      <p style="color:var(--text2);font-size:0.9rem;line-height:1.6;margin-bottom:18px;">성적표 사진을 분석하면 네 약점 유형을 찾아드려요.<br/>그 약점에 딱 맞는 문제로 집중 훈련할 수 있어요!</p>
      <button class="btn-primary" onclick="navigateTo('analyze')">📸 성적분석 하러 가기</button>
    </div>`;
    return;
  }

  // [v4] 약점 유형명을 은행 단원명으로 변환 (은행 조회 + 기출 과목 필터 둘 다에 쓰임)
  const rawWeakType = state.selectedWeakType || state.weakTypes[0];
  const mappedType = mapToBankType(rawWeakType);
  const targetType = mappedType || rawWeakType;
  if (BANK_DEBUG) {
    console.log('[유형집중] 약점 유형:', rawWeakType, '->',
      mappedType ? `단원 '${mappedType}'` : '매칭 실패 (라이브 생성으로 진행)');
  }
  listWrap.classList.remove('hidden');
  listWrap.innerHTML = '<span class="spinner"></span> 문제 불러오는 중...';

  // 유형 집중: 3문제를 하나씩 순차 출제
  state.intensive = { mode, type: targetType, total: 3, idx: 0, pool: [] };

  if (mode === 'db') {
    try {
      const db2 = db; // 동일 named DB 재사용
      const snap = await getDocs(collection(db2, 'questions'));
      const all = [];
      const targetSection = getSectionFromType(targetType);
      snap.forEach(d => {
        const item = d.data();
        if (!targetSection || item.section === targetSection) all.push(item);
      });
      if (all.length === 0) {
        listWrap.innerHTML = '<p style="color:var(--text2);padding:16px;">해당 유형의 기출 문제가 없어요.</p>';
        return;
      }
      state.intensive.pool = all.sort(() => Math.random() - 0.5).slice(0, 3);
      state.intensive.total = state.intensive.pool.length; // 3개 미만이면 그만큼만
    } catch (e) {
      listWrap.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
      return;
    }
  }
  await showIntensiveProblem();
};

// 유형 집중: 현재 순서의 문제 한 개를 렌더
async function showIntensiveProblem() {
  const S = state.intensive;
  const listWrap = document.getElementById('intensiveProblemList');
  S.idx += 1;
  listWrap.innerHTML = `<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:10px 14px;margin-bottom:12px;">
    <span style="font-weight:700;color:#ef4444;font-size:0.9rem;">🔥 네 약점 「${S.type}」 집중 공략 중</span>
    <span style="color:var(--text2);font-size:0.82rem;margin-left:8px;">${S.idx}/${S.total}문제</span>
  </div>`;

  const itemEl = document.createElement('div');
  itemEl.className = 'multi-problem-item';
  listWrap.appendChild(itemEl);

  let ok = true;

  if (S.mode === 'db') {
    const item = S.pool[S.idx - 1];
    const nums = ['①','②','③','④','⑤'];
    let choicesText = '';
    if (item.choices && Array.isArray(item.choices)) {
      choicesText = '\n\n' + item.choices.map((c, ci) => `${nums[ci] || (ci+1)} ${c}`).join('  ');
    }
    const subject = item.section || item.subject || '수능 기출';
    const year = item.year || '';
    const form = item.form ? ` (${item.form})` : '';
    const question = item.question || item.문제 || '';
    const answer = String(item.answer_index || item.정답 || item.answer || '');
    const text = `${question}${choicesText}`;
    itemEl.innerHTML = renderMultiProblemItem(S.idx, text, '', answer, 'intensive', 'db', subject, year + form);
    renderMath(itemEl);
    attachChoiceListeners(listWrap);
  } else {
    // AI: 먼저 은행(ai_problems)에서 즉시 조회, 없으면 라이브 생성으로 fallback
    itemEl.innerHTML = `<span class="spinner"></span> 문제 불러오는 중...`;
    let parsed = await fetchFromBank(S.type);

    if (!parsed) {
      if (!state.apiKey) {
        ok = false;
        itemEl.innerHTML = `<div style="color:var(--text2);padding:8px;">이 단원 은행이 아직 비어있어요. API 키를 등록하거나 수능 기출로 풀어보세요. 🔑</div>`;
      } else {
        itemEl.innerHTML = `<span class="spinner"></span> AI가 문제를 만들고 있어요... (20~40초 소요)`;
        try {
          parsed = await generateVerifiedProblem(S.type, { forceChoice: true });
        } catch (e) {
          ok = false;
          const msg = (e && e.isBusy) ? '서버가 혼잡해요. 잠시 후 다시 시도해주세요. ⏳' : `출제 실패: ${e.message}`;
          itemEl.innerHTML = `<div style="color:var(--red);padding:8px;">${msg}</div>`;
        }
      }
    }

    if (ok) {
      if (!parsed) {
        ok = false;
        itemEl.innerHTML = `<div style="color:var(--text2);padding:8px;">검증을 통과하는 문제를 만들지 못했어요. 다시 시도하거나, 수능 기출로 풀어보세요. 🔄</div>`;
      } else {
        itemEl.innerHTML = renderMultiProblemItem(S.idx, parsed.visibleText, parsed.hint, parsed.answer, 'intensive', 'ai', S.type, '', parsed.level, parsed.desmos);
        renderMath(itemEl);
        renderCardGraphs(itemEl);
      }
    }
    attachChoiceListeners(listWrap);
  }

  const btn = document.createElement('button');
  btn.id = 'intensiveStepBtn';
  btn.className = 'btn-primary check-all-btn';
  if (ok) {
    btn.innerHTML = '✅ 채점하기';
    btn.onclick = () => gradeIntensiveStep(btn);
  } else {
    // 출제 실패 → 같은 순서 다시 출제 (idx 되돌림)
    btn.innerHTML = '🔄 다시 출제';
    btn.onclick = () => { S.idx -= 1; showIntensiveProblem(); };
  }
  listWrap.appendChild(btn);
}

// 유형 집중: 현재 문제 채점 → 다음 문제 / 완료
async function gradeIntensiveStep(btn) {
  const S = state.intensive;
  const listWrap = document.getElementById('intensiveProblemList');
  const card = listWrap.querySelector('.multi-problem-card');
  if (!card) return;
  const selected = card.querySelector('.choice-btn.selected');
  const textInput = card.querySelector('.multi-ans-input');
  if (!selected && !(textInput && textInput.value.trim())) {
    showInfoModal('✏️ 미입력', '답을 먼저 입력해주세요!');
    return;
  }
  if (!state.apiKey) { showApiKeyWarning(); return; }
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> AI가 채점하고 있어요... (10~30초 소요)';
  await doCheckAnswer(card, 'intensive');
  btn.disabled = false;

  if (S.idx < S.total) {
    btn.innerHTML = '다음 문제 →';
    btn.onclick = () => showIntensiveProblem();
  } else {
    btn.innerHTML = `🎉 ${S.type} 3문제 완료!`;
    btn.disabled = true;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:12px;text-align:center;';
    wrap.innerHTML = `<p style="color:var(--text2);font-size:0.9rem;margin-bottom:12px;">약점 「${S.type}」 집중 훈련을 마쳤어요. 약점을 한 번 더 측정해볼까요?</p>`;

    const again = document.createElement('button');
    again.style.cssText = 'margin:4px;padding:12px 18px;border:1.5px solid var(--border);border-radius:12px;background:var(--card);color:var(--accent);font-weight:700;cursor:pointer;';
    again.innerHTML = '🔄 다시 풀기';
    again.onclick = () => startIntensiveMulti(S.mode);

    const remeasure = document.createElement('button');
    remeasure.style.cssText = 'margin:4px;padding:12px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-weight:700;cursor:pointer;';
    remeasure.innerHTML = '📊 약점 다시 측정하기';
    remeasure.onclick = () => navigateTo('analyze');

    wrap.appendChild(again);
    wrap.appendChild(remeasure);
    listWrap.appendChild(wrap);
  }
}

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

function renderMultiProblemItem(idx, text, hint, answer, section, mode, type, extra, level, desmos) {
  hint = hint || '';
  text = text || '';
  const extraLabel = extra ? `<span style="font-size:0.8rem;color:var(--text3);margin-left:8px;">${extra}</span>` : '';
  // [v5] 배점 배지 — 실제 수능 시험지처럼 문제 번호 옆에 [3점] 표기.
  // 문제 은행에서 꺼낸 문제만 level 값이 있고, 즉석 생성·기출은 없으니 그때는 표시하지 않는다.
  const lv = level ? String(level) : '';
  const levelBadge = ['2','3','4'].includes(lv)
    ? `<span style="font-size:0.78rem;color:var(--text2);margin-left:6px;font-weight:600;">[${lv}점]</span>`
    : '';
  // [v5] 그래프 영역. 수식은 data 속성에 실어두고 renderCardGraphs 가 나중에 그린다.
  const graphId = `pgraph-${section}-${idx}`;
  const graphHtml = (Array.isArray(desmos) && desmos.length)
    ? `<div class="problem-graph-wrap" data-desmos="${encodeURIComponent(JSON.stringify(desmos))}" style="margin-top:12px;">
         <div class="problem-graph" id="${graphId}" style="width:100%;height:280px;border:1px solid var(--border,#e3e6ea);border-radius:10px;overflow:hidden;"></div>
         <div style="font-size:0.72rem;color:var(--text3);margin-top:4px;">그래프는 이해를 돕기 위한 참고용이에요. 문제는 글만 읽고도 풀 수 있어요.</div>
       </div>`
    : '';
  return `
    <div class="multi-problem-card" data-answer="${answer}" data-hint="${hint.replace(/"/g,"'")}" data-problem="${encodeURIComponent(text || '')}" data-source="${mode}" data-idx="${idx}" data-type="${type || ''}">
      <div class="multi-problem-header">
        <span class="multi-problem-num">문제 ${idx}${levelBadge}</span>
        <span style="font-size:0.82rem;color:var(--text2);">${type || ''}${extraLabel}</span>
      </div>
      <div class="multi-problem-body">${renderProblemHTML(text, graphHtml)}</div>
      <div class="multi-answer-area" id="ans-area-${section}-${idx}">
        ${hasChoiceMarkers(text) ? '' : `<input type="text" inputmode="text" class="text-input multi-ans-input" placeholder="답 입력" data-idx="${idx}" data-section="${section}" style="margin-top:8px;" />`}
        ${hint ? `<div style="margin-top:8px;"><button class="btn-ghost hint-btn" style="padding:8px 12px;font-size:0.85rem;" onclick="showMultiHint(this)">💡 힌트</button></div>` : ''}
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
  // 주관식 입력칸에만 손글씨 UI를 붙인다.
  // (객관식 카드는 입력칸 자체가 만들어지지 않으므로 자연히 제외된다)
  wrap.querySelectorAll('.multi-ans-input').forEach((el) => attachHandwriting(el));
  // 신고 버튼은 객관식·주관식 모두에 붙인다
  attachReportToCards(wrap);
}

window.showMultiHint = function(btn) {
  const card = btn.closest('.multi-problem-card');
  const hint = card.dataset.hint;
  if (hint) showInfoModal('💡 힌트', cleanHint(hint));
};

// 공용 채점 함수 (카드 하나)
// ============ AI 판정 파싱 (정답을 코드가 모르는 경우: 손풀이 채점 등) ============
// "판정:" 라인만 정확히 읽는다. 풀이 본문에 나오는 "✅ 정답" 문구에 속지 않음.
function parseAiVerdict(raw) {
  if (!raw) return false;
  // 1순위: "판정:" 으로 시작하는 라인
  const verdictLine = raw.split('\n').find(l => /^\s*판정\s*[：:]/.test(l));
  if (verdictLine) {
    if (/❌|오답|틀렸|incorrect/i.test(verdictLine)) return false;
    if (/✅|정답|맞았|correct/i.test(verdictLine)) return true;
  }
  // 2순위: 앞쪽 3줄 안에서만 판정 문구 탐색 (풀이 본문 오탐 방지)
  const head = raw.split('\n').slice(0, 3).join('\n');
  if (/❌/.test(head)) return false;
  if (/✅/.test(head)) return true;
  return false; // 판정 불명 → 안전하게 오답 처리
}

// ============ 정답 비교 (코드가 직접 판정 — AI 판정 신뢰 안 함) ============
// 객관식 기호 ①②③④⑤ ↔ 숫자 1~5 상호 변환
const _CIRCLED_NUMS = ['①','②','③','④','⑤'];

// ============ 눈에는 같아 보이는 다른 글자들을 하나로 맞춘다 ============
// 손글씨 판독 AI는 '/' 대신 분수선 '⁄'(U+2044), '-' 대신 빼기표 '−'(U+2212) 를
// 돌려줄 때가 있다. 화면에는 똑같이 보이지만 코드에는 다른 글자다.
// 아래에서 맞춰 주지 않으면 정리 단계에서 소리 없이 지워져서
//   2⁄3  →  "23"      (맞는 답이 오답이 되고)
//   −1/4 →  "1/4"     (틀린 답이 정답이 된다 ← 이쪽이 더 위험)
const _VULGAR = {
  '½':'(1/2)','⅓':'(1/3)','⅔':'(2/3)','¼':'(1/4)','¾':'(3/4)',
  '⅕':'(1/5)','⅖':'(2/5)','⅗':'(3/5)','⅘':'(4/5)','⅙':'(1/6)','⅚':'(5/6)',
  '⅐':'(1/7)','⅛':'(1/8)','⅜':'(3/8)','⅝':'(5/8)','⅞':'(7/8)',
  '⅑':'(1/9)','⅒':'(1/10)',
};
// ※ 아래 정규식은 \u 이스케이프로 적는다. 눈에 안 보이거나 서로 비슷하게 생긴
//    글자들이라, 실제 글자로 적어 두면 편집기나 복붙 과정에서 조용히 깨진다.
//    깨져도 문법 오류가 나지 않아서 아무도 모르는 채 무력화된다.
function unifySymbols(src) {
  let s = String(src == null ? '' : src);
  s = s.replace(/[⁄∕／÷∶]/g, '/');                     // 분수선·나눗셈 → /
  s = s.replace(/[−－‐‑‒–—―➖]/g, '-'); // 빼기표·대시 → -
  s = s.replace(/[＋➕]/g, '+');                                      // 전각 플러스 → +
  s = s.replace(/[   　]/g, ' ');                          // 각종 공백 → 보통 공백
  s = s.replace(/[０-９]/g, (c) =>                                    // ０-９ → 0-9
        String.fromCharCode(c.charCodeAt(0) - 0xFF10 + 0x30));
  s = s.replace(/[¼-¾⅐-⅞]/g, (c) => _VULGAR[c] || c);     // ½ ⅔ ¼ … → 1/2 2/3 1/4
  return s;
}

// {...} 한 덩어리를 중괄호 짝을 맞춰 읽는다. s[i] 가 '{' 일 때 호출.
// 반환 { body: 중괄호 안, end: 닫는 '}' 다음 위치 }
// \frac12 처럼 중괄호 없이 한 글자만 오는 표기도 받아 준다.
function _readGroup(s, i) {
  if (s[i] !== '{') return { body: s[i] || '', end: i + 1 };
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') {
      depth--;
      if (depth === 0) return { body: s.slice(i + 1, j), end: j + 1 };
    }
  }
  return { body: s.slice(i + 1), end: s.length };   // 안 닫힌 경우
}

// LaTeX → 평문.  \frac{1}{4} → (1)/(4),  \sqrt{3} → √(3),  \pi → π
//
// ★ 이 단계가 없으면 안 된다:
//   중괄호를 먼저 지우면 \frac{1}{4} 가 "14" 가 돼서 1/4 과 영영 달라진다.
//   분수·근호 정답이 전부 오답 처리되던 원인이 이것이었다.
function latexToPlain(src) {
  let s = String(src);

  // 보기용으로만 붙은 것들 먼저 제거
  s = s.replace(/\$+/g, '');
  s = s.replace(/\\(?:left|right|displaystyle|quad|qquad)\b/g, '');
  s = s.replace(/\\[,;:!]/g, '');
  s = s.replace(/\\(?:text|mathrm|mathbf|operatorname)\s*\{/g, '{');

  let out = '';
  for (let i = 0; i < s.length; ) {
    const rest = s.slice(i);

    // \frac{a}{b} · \dfrac · \tfrac · \cfrac
    let m = rest.match(/^\\[dtc]?frac\s*/);
    if (m) {
      const a = _readGroup(s, i + m[0].length);
      const b = _readGroup(s, a.end);
      out += '(' + latexToPlain(a.body) + ')/(' + latexToPlain(b.body) + ')';
      i = b.end;
      continue;
    }

    // \sqrt{a} · \sqrt[n]{a}  (n제곱근은 비교 대상이 거의 없어 √ 로만 적는다)
    m = rest.match(/^\\sqrt\s*(?:\[[^\]]*\]\s*)?/);
    if (m) {
      const a = _readGroup(s, i + m[0].length);
      out += '√(' + latexToPlain(a.body) + ')';
      i = a.end;
      continue;
    }

    out += s[i];
    i++;
  }
  s = out;

  // 남은 기호 명령·유니코드 기호 치환
  s = s.replace(/\\pi\b/g, 'π');
  s = s.replace(/\\(?:times|cdot)\b/g, '*');
  s = s.replace(/\\div\b/g, '/');
  s = s.replace(/[×·]/g, '*').replace(/÷/g, '/');
  s = s.replace(/\\%/g, '%');
  s = s.replace(/\\[a-zA-Z]+/g, '');   // 그래도 남은 \명령 제거
  return s;
}

function normalizeAnswer(ans) {
  if (ans === null || ans === undefined) return '';
  let s = String(ans).trim();
  // 객관식 기호 → 숫자
  _CIRCLED_NUMS.forEach((c, i) => {
    s = s.replace(new RegExp(c, 'g'), String(i + 1));
  });
  // 눈에는 같아 보이는 다른 글자(⁄ − ０ ½ …)를 먼저 맞춘다
  s = unifySymbols(s);
  // LaTeX 를 평문으로 (분수·근호를 푼 뒤에 중괄호를 지워야 안전하다)
  s = latexToPlain(s);
  // 공백·쉼표 제거, 소문자화
  s = s.replace(/[\s,]/g, '').toLowerCase();
  // 흔한 수식 표기 정리
  s = s.replace(/^\+/, '');                  // 앞 + 제거
  s = s.replace(/[{}\[\]]/g, '');             // 중괄호·대괄호 제거
  s = s.replace(/[^\d\-\/.a-z√π()*]/g, '');   // 나머지 기호 정리
  // 없어도 되는 괄호는 푼다: (1)/(4) → 1/4,  (√(3))/(2) → √3/2
  let prev;
  do {
    prev = s;
    s = s.replace(/\(([^()]*)\)/g, (whole, inner) =>
      /^[\d.a-z√π]*$/.test(inner) ? inner : whole);
  } while (s !== prev);
  s = s.replace(/^\((.*)\)$/, '$1');          // 전체를 감싼 괄호 제거
  return s;
}
// 분수 문자열 → 숫자 (a/b 형태 지원)
function _toNum(s) {
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  const frac = s.match(/^(-?\d+)\/(\d+)$/);
  if (frac) {
    const d = parseInt(frac[2], 10);
    if (d !== 0) return parseInt(frac[1], 10) / d;
  }
  return null;
}
function isAnswerCorrect(userAns, correctAns) {
  const u = normalizeAnswer(userAns);
  const c = normalizeAnswer(correctAns);
  if (!u || !c) return false;
  if (u === c) return true;
  // 수치 비교 (정수·소수·분수)
  const un = _toNum(u), cn = _toNum(c);
  if (un !== null && cn !== null) {
    return Math.abs(un - cn) < 1e-9;
  }
  return false;
}

async function doCheckAnswer(card, section) {
  if (!state.apiKey) { showApiKeyWarning(); return null; }
  const idx = card.dataset.idx;
  const correctAnswer = card.dataset.answer;
  const selectedBtn = card.querySelector('.choice-btn.selected');
  const textInput = card.querySelector('.multi-ans-input');
  const userAns = selectedBtn ? selectedBtn.dataset.val : (textInput ? textInput.value.trim() : '');
  if (!userAns) return null; // 미입력 → 스킵

  // ⭐ 같은 카드를 두 번 채점하지 않는다.
  //   카드마다 채점 버튼이 있고 아래에 "전체 정답 확인" 버튼이 또 있다.
  //   개별로 채점한 뒤 전체 채점을 누르면 그 카드가 한 번 더 들어가서
  //     · 푼 문제 수와 정답 수가 부풀고
  //     · 단원별 정답률이 어긋나고
  //     · 오답노트에 같은 문제가 두 번 쌓이고
  //     · AI 호출이 한 번 더 나가 돈이 더 든다.
  //   "다시 채점하기" 를 누르면 그 화면의 모든 문제가 통째로 또 들어갔다.
  const alreadyGraded = card.dataset.graded === '1';
  if (alreadyGraded && card.dataset.gradeOk === '1') {
    return card.dataset.gradedCorrect === '1';   // 풀이까지 받아 둔 카드는 그대로 둔다
  }

  const resultBox = document.getElementById(`result-${section}-${idx}`);
  if (!resultBox) return null;
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = '<span class="spinner"></span> AI가 채점하고 있어요... (10~30초 소요)';

  const problemText = card.dataset.problem
    ? decodeURIComponent(card.dataset.problem)
    : card.querySelector('.multi-problem-body').innerText;
  const prompt = `문제: ${problemText}\n정답: ${correctAnswer}\n학생 답: ${userAns}\n\n★ 이 문제의 정답은 [${correctAnswer}]로 확정되어 있다. 정답이 [${correctAnswer}]가 되는 가장 매끄러운 풀이 "한 가지"만 제시하라.\n★ 절대 금지: 풀이를 두 번 쓰기, 🎯핵심/📋자세한 풀이 등 섹션 헤더를 두 번 출력하기, "이 해석으로는 답이 안 나온다"는 검토 반복, 같은 계산을 두 번 풀기. 계산 결과가 정답과 달라도 재시도하지 말고 첫 번째 계산을 그대로 제시하라. 각 섹션 헤더는 딱 한 번만 출력하라.\n\n반드시 한국어로만 작성. 영어 문장 금지. 마크다운 기호(#, * 등) 금지. 모든 수식은 $...$ LaTeX 형식. 벡터는 \\overrightarrow{} 사용.\n\n🎯 핵심\n(이 문제를 푸는 핵심 아이디어·개념을 1~2문장으로 짧게. 풀이의 열쇠만.)\n\n📋 자세한 풀이\n(반드시 "1단계:", "2단계:" 형식으로 시작하는 단계별 풀이. 전체 5단계 이내. 각 단계는 1~2문장으로 간결하게, 핵심 계산만. ★경우의 수를 셀 때 모든 경우를 일일이 나열하지 말 것 — 대표 1~2개만 보이고 나머지는 "같은 방식으로 ○가지"처럼 한 줄로 줄여라. 동일 케이스 반복·전수나열·표 금지. 정답 [${correctAnswer}]에 이르는 한 줄기 풀이만 쓰고 다른 해석·재검토는 쓰지 말 것.)\n\n💡 핵심 팁\n(핵심과 겹치지 말 것. 이 유형에서 자주 하는 실수 1~2줄만.)\n\n∴ 최종 답: ${correctAnswer}`;

  // ⭐ 정답 판정은 코드가 직접 한다 (AI 텍스트 파싱 신뢰 안 함)
  const isCorrect = isAnswerCorrect(userAns, correctAnswer);

  // 집계는 카드당 한 번만. 풀이를 다시 받아 오는 경우에도 중복으로 세지 않는다.
  card.dataset.graded = '1';
  card.dataset.gradedCorrect = isCorrect ? '1' : '0';
  const countOnce = (type, source) => {
    if (alreadyGraded) return;
    incrementProblems(isCorrect, problemText, userAns, correctAnswer, type, source);
  };

  try {
    const result = await callGemini(prompt, 5500, 2000);
    resultBox.innerHTML = renderFeedback(result, isCorrect, true, correctAnswer);
    renderMath(resultBox);
    card.dataset.gradeOk = '1';   // 풀이까지 받았으니 이 카드는 끝
    const type = card.dataset.type || card.querySelector('[style*="text2"]')?.textContent || '';
    const source = card.dataset.source === 'db' ? 'suneung' : 'ai';
    countOnce(type, source);
    return isCorrect;
  } catch(e) {
    const isBusy = e && e.isBusy;
    const retryBtn = isBusy
      ? `<button onclick="this.closest('.result-box').dataset.retry='1';checkAllAnswers('${section}')"
           style="margin-top:8px;padding:8px 18px;background:#4A90E2;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.88rem;">
           🔄 다시 채점하기
         </button>` : '';
    // ⭐ 설명 생성이 실패해도 판정은 코드가 이미 알고 있으니 먼저 보여주고 기록한다
    const verdictHtml = isCorrect
      ? `<div class="feedback-verdict correct">✅ 정답! <span style="font-size:0.9rem;opacity:0.85">(${correctAnswer})</span></div>`
      : `<div class="feedback-verdict wrong">❌ 오답 <span style="font-size:0.9rem;opacity:0.85">— 정답: ${correctAnswer}</span></div>`;
    const why = isBusy ? 'AI 서버가 혼잡해서 풀이 설명을 불러오지 못했어요.' : `풀이 설명을 불러오지 못했어요. (${e.message})`;
    resultBox.innerHTML = `${verdictHtml}<div style="color:var(--text2);font-size:0.85rem;margin-top:8px;">${why}</div>${retryBtn}`;
    renderMath(resultBox);
    // gradeOk 는 세우지 않는다 → 풀이는 나중에 다시 받아 올 수 있다.
    const type = card.dataset.type || '';
    const source = card.dataset.source === 'db' ? 'suneung' : 'ai';
    countOnce(type, source);
    return isCorrect;
  }
}

window.checkMultiAnswer = async function(btn, section, idx) {
  const card = btn.closest('.multi-problem-card');
  btn.disabled = true;
  await doCheckAnswer(card, section);
  btn.disabled = false;
};

// 전체 정답 확인
window.checkAllAnswers = async function(section) {
  if (!state.apiKey) { showApiKeyWarning(); return; }
  const listWrap = document.getElementById(section + 'ProblemList');
  if (!listWrap) return;
  const cards = [...listWrap.querySelectorAll('.multi-problem-card')];

  const answeredCards = cards.filter(card => {
    const selectedBtn = card.querySelector('.choice-btn.selected');
    const textInput = card.querySelector('.multi-ans-input');
    return selectedBtn || (textInput && textInput.value.trim());
  });

  if (answeredCards.length === 0) {
    showInfoModal('✏️ 미입력', '답을 먼저 입력해주세요!');
    return;
  }

  const btn = document.getElementById('checkAllBtn-' + section);
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> AI가 전체 채점 중이에요... (20~50초 소요)'; }

  let correct = 0, total = 0, hasBusy = false;
  for (let i = 0; i < cards.length; i++) {
    const result = await doCheckAnswer(cards[i], section);
    if (result !== null) { total++; if (result) correct++; }
    // result-box에 retry 표시된 게 있으면 서버 혼잡 발생
    const resultBox = cards[i].querySelector('.result-box');
    if (resultBox && resultBox.dataset.retry) hasBusy = true;
    if (i < cards.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  const pct = total > 0 ? Math.round(correct / total * 100) : 0;
  const summary = document.createElement('div');
  summary.className = 'check-all-summary';
  summary.innerHTML = `🎯 채점 완료 · ${total}문제 중 <strong>${correct}문제 정답</strong> · 정답률 ${pct}%`;

  // 서버 혼잡으로 일부 채점 실패 시 다시 채점하기 버튼 추가
  if (hasBusy && btn) {
    const retryAll = document.createElement('button');
    retryAll.innerHTML = '🔄 다시 채점하기';
    retryAll.style.cssText = 'margin-left:8px;padding:8px 18px;background:#4A90E2;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.88rem;';
    retryAll.onclick = () => checkAllAnswers(section);
    summary.appendChild(retryAll);
  }

  if (btn) { btn.replaceWith(summary); } else { listWrap.appendChild(summary); }
};

async function getSuneungProblem() {
  const problemBox = document.getElementById('solveProblem');
  problemBox.classList.remove('hidden');
  problemBox.innerHTML = '<span class="spinner"></span> 기출 문제 불러오는 중...';
  document.getElementById('solveInput').classList.add('hidden');
  document.getElementById('solveFeedback').classList.add('hidden');
  document.getElementById('solveGraph').classList.add('hidden');

  try {
    const db2 = db; // 동일 named DB 재사용
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
  problemBox.innerHTML = '<span class="spinner"></span> AI가 문제를 출제하고 있어요... (15~30초 소요)';
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
  feedback.innerHTML = '<span class="spinner"></span> AI가 풀이를 분석하고 있어요... (10~30초 소요)';

  const prompt = `너는 수능 수학 전문 강사다. 아래 문제와 학생 풀이를 분석하라.
마크다운 기호(#, **, *) 절대 사용 금지. 섹션 제목은 이모지로만 구분. 수식은 $...$ LaTeX.

문제: ${state.currentProblem}

학생 풀이:
${solve}

★ 핵심 원칙:
- 정답이어도 칭찬 일색 금지. 교육적으로 가르쳐라.
- 더 빠른 풀이법이 있으면 반드시 언급하라.
- 잘한 점은 구체적 수식·단계 지목. "정확하게", "인상적" 같은 막연한 칭찬 금지.
- 개선할 점은 정답이어도 반드시 작성. 없으면 "이 유형에서 자주 실수하는 부분"을 적어라.

아래 형식으로 정확히 작성:

판정: ✅ 정답 / ❌ 오답 중 하나만

🎯 핵심
(이 문제가 테스트하는 핵심 개념·공식을 1~2문장. 학생 풀이와 무관하게 문제 자체 기준으로.)

✅ 잘한 점
(학생이 쓴 풀이에서 구체적으로 어느 단계·수식이 정확했는지. "정답을 맞혔다"는 설명 금지.)

🔧 개선할 점
(정답이어도 작성 필수. 더 빠른 풀이법 / 계산 단계 줄이는 법 / 이 유형의 함정 / 실수 포인트 중 하나 이상 구체적으로.)

📋 올바른 풀이
(반드시 "1단계:", "2단계:" 형식. 전체 5단계 이내. 각 단계 1~2문장, 핵심 계산만. 학생 풀이와 다른 더 나은 접근법이 있으면 그걸로 제시해도 됨.)

💡 핵심 팁
(이 유형에서 수험생이 자주 틀리는 실수 1~2줄. 핵심과 겹치지 말 것.)`;

  try {
    const result = await callGemini(prompt);
    const isCorrect = parseAiVerdict(result);
    feedback.innerHTML = renderFeedback(result, isCorrect);
    renderMath(feedback);
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
  problemBox.innerHTML = '<span class="spinner"></span> AI가 문제를 출제하고 있어요... (15~30초 소요)';
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
힌트: (핵심 개념 + 첫 번째 풀이 방향 2~3줄. 어떤 공식/개념을 쓰는지 명시. 수식 기호 $ 없이 일반 텍스트로만 적을 것)

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
    const result = await callGemini(prompt, 12000);
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
    const bAns = document.getElementById('basicAns');
    bAns.value = '';
    attachHandwriting(bAns);                     // 손글씨 UI (이미 붙었으면 그냥 넘어감)
    setAnswerInputVisible(bAns, !hasChoices);    // 객관식이면 입력칸과 손글씨를 같이 숨긴다

    const bWrap = document.getElementById('basicInput');
    attachReportButton(bWrap, () => ({
      problem: state.currentProblem || '',
      answer: state.currentAnswer || '',
      studentAnswer: selectedChoice || bAns.value || '',
      type: document.getElementById('mathType')?.value || '',
      source: 'basic',
    }));
    resetReport(bWrap);                          // 앞 문제에서 신고했어도 새 문제엔 다시 쓸 수 있게
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
  feedback.innerHTML = '<span class="spinner"></span> AI가 채점하고 있어요... (10~30초 소요)';

  const prompt = `문제: ${state.currentProblem}
학생 답: ${ans}

마크다운 기호(#, **, *) 절대 사용 금지. 수식은 반드시 $...$ LaTeX 형식으로. 아래 형식으로만 작성:

판정: ✅ 정답 / ❌ 오답 중 하나만
정답: (객관식이면 ①②③④⑤ 번호, 서술형이면 값)

📋 풀이
(반드시 "1단계:", "2단계:" 형식으로 시작. 전체 4단계 이내. 각 단계 한 문장. ★(가)(나)(다) 조건은 조건명 재나열 금지, 결과값만 바로 사용. 케이스 1개만, 나머지는 "같은 방식으로" 한 줄 처리. 수식은 $...$ 형식)

∴ 최종 답: (정답을 굵게 강조해서 마지막에 한 번 더)

💡 핵심 팁
(틀리지 않기 위한 핵심 한 줄)`;

  try {
    const result = await callGemini(prompt, 5500, 2000);
    // ⭐ 정답을 알고 있으면 코드가 직접 판정, 모르면 "판정:" 라인만 견고하게 파싱
    const knownAns = state.currentAnswer || '';
    const isCorrect = knownAns ? isAnswerCorrect(ans, knownAns) : parseAiVerdict(result);
    const correctMatch = result.match(/정답[：:]\s*([^\n]+)/);
    const correctAns = knownAns || (correctMatch ? correctMatch[1].trim() : '?');
    feedback.innerHTML = renderFeedback(result, isCorrect, true, knownAns);
    renderMath(feedback);
    incrementProblems(isCorrect, state.currentProblem, ans, correctAns, type, 'ai');
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
  renderMath(modal); // 모달 안의 LaTeX 수식 렌더
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
      <div id="hintModalBody" style="font-size:0.95rem;color:#1a2340;line-height:1.9;">${cleanHint(state.currentHint)}</div>
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
  problemBox.innerHTML = '<span class="spinner"></span> AI가 약점 유형 문제를 만들고 있어요... (20~40초 소요)';

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
      : `<div class="ans-row" style="display:flex;gap:10px;margin-top:12px">
          <input type="text" id="intensiveAns" class="text-input" placeholder="답 입력" />
          <button class="btn-primary" onclick="checkIntensive()">확인</button>
        </div>`;
    if (!hasChoices) {
      const iAns = document.getElementById('intensiveAns');
      attachHandwriting(iAns, iAns.closest('.ans-row'));   // flex 줄 아래에 붙인다
    }
    attachReportButton(inputArea, () => ({
      problem: state.currentProblem || '',
      answer: state.currentAnswer || '',
      studentAnswer: selectedChoice || document.getElementById('intensiveAns')?.value || '',
      type: state.selectedWeakType || '',
      source: 'intensive',
    }));
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
  feedback.innerHTML = '<span class="spinner"></span> AI가 채점하고 있어요... (10~30초 소요)';

  const prompt = `문제: ${state.currentProblem}
학생 답: ${ans}
반드시 한국어로만 작성. 영어 문장 금지. 마크다운 기호 절대 사용 금지. 아래 형식으로만:

판정: ✅ 정답 / ❌ 오답 중 하나만
정답: (객관식이면 ①②③④⑤ 번호, 서술형이면 값)

✅ 잘한 점
(한 줄)

🔧 개선할 점
(한 줄)

📋 풀이
(반드시 "1단계:", "2단계:" 형식으로 시작. 전체 4단계 이내. 각 단계 한 문장. ★(가)(나)(다) 조건은 조건명 재나열 금지, 결과값만 바로 사용. 케이스 1개만, 나머지는 "같은 방식으로" 한 줄 처리. 수식은 $...$ LaTeX 형식)

∴ 최종 답: (정답을 마지막에 한 번 더 강조)

💡 핵심 팁
(한 줄)`;

  try {
    const result = await callGemini(prompt, 5500, 2000);
    // ⭐ 정답을 알고 있으면 코드가 직접 판정, 모르면 "판정:" 라인만 견고하게 파싱
    const knownAns = state.currentAnswer || '';
    const isCorrect = knownAns ? isAnswerCorrect(ans, knownAns) : parseAiVerdict(result);
    const correctMatch = result.match(/정답[：:]\s*([^\n]+)/);
    const correctAns = knownAns || (correctMatch ? correctMatch[1].trim() : '?');
    feedback.innerHTML = renderFeedback(result, isCorrect, true, knownAns);
    renderMath(feedback);
    incrementProblems(isCorrect, state.currentProblem, ans, correctAns, targetType, 'ai');
  } catch (e) {
    feedback.innerHTML = `<span style="color:var(--red)">오류: ${e.message}</span>`;
  }
}
window.checkIntensive = checkIntensive;
function renderFeedback(raw, isCorrect, compact = false, trueAnswer = '') {
  const text = raw
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .trim();

  // ⭐ 정답 표시는 코드가 아는 실제 정답(trueAnswer)을 우선 사용
  let answerText = String(trueAnswer || '').trim();
  if (!answerText) {
    const answerMatch = text.match(/^정답[：:]\s*(.+)$/m);
    answerText = answerMatch ? answerMatch[1].trim() : '';
  }
  // escapeHtml 필수: 정답이 부등식(x<3, a<b)이면 브라우저가 <3 부터를 태그로 먹어
  // "정답:" 뒤가 통째로 사라진다. 학생이 매 문제마다 보는 줄이라 제일 먼저 막아야 한다.
  const answerHtml = escapeHtml(answerText);
  const verdict = isCorrect
    ? `<div class="feedback-verdict correct">✅ 정답!${answerText ? ` <span style="font-size:0.9rem;opacity:0.85">(${answerHtml})</span>` : ''}</div>`
    : `<div class="feedback-verdict wrong">❌ 오답${answerText ? ` <span style="font-size:0.9rem;opacity:0.85">— 정답: ${answerHtml}</span>` : ''}</div>`;

  // collapse:true 인 섹션은 compact 모드에서 "자세한 풀이 보기" 토글 안으로 들어감
  const sectionMap = [
    { icon: '🎯', label: '핵심', color: '#4A90E2', collapse: false },
    { icon: '✅', label: '잘한 점', color: '#34C759', collapse: false },
    { icon: '🔧', label: '개선할 점', color: '#FF9500', collapse: false },
    { icon: '📋', label: '자세한 풀이', color: '#4A90E2', collapse: true, isSolution: true },
    { icon: '📋', label: '풀이', color: '#4A90E2', collapse: true, isSolution: true },
    { icon: '💡', label: '핵심 팁', color: '#5856D6', collapse: true },
  ];

  const sectionHtml = (sec, bodyHtml) => `
      <div class="feedback-section">
        <div class="feedback-section-title" style="color:${sec.color}">
          ${sec.icon} ${sec.label}
        </div>
        <div class="feedback-section-body" style="line-height:2;">${bodyHtml}</div>
      </div>`;

  const lines = text.split('\n');
  const blocks = [];      // { collapse, isSolution, sec, body }
  let finalBody = '';
  let currentSection = null;
  let currentLines = [];

  const flush = () => {
    if (!currentSection) return;
    const plain = [];
    currentLines.forEach(l => {
      if (l.trim().startsWith('∴')) finalBody += (finalBody ? ' ' : '') + l.trim();
      else plain.push(l);
    });
    const body = plain.filter(l => l.trim()).join('\n').trim();
    if (body) blocks.push({ collapse: currentSection.collapse, isSolution: !!currentSection.isSolution, sec: currentSection, body });
    currentLines = [];
  };

  lines.forEach(line => {
    const matched = sectionMap.find(s => line.includes(s.icon) && line.includes(s.label));
    if (matched) { flush(); currentSection = matched; }
    else if (currentSection && !line.match(/^판정:/) && !line.match(/^정답:/)) currentLines.push(line);
  });
  flush();

  // 같은 label 중복 제거 (AI가 같은 섹션 헤더를 두 번 출력한 경우 첫 번째만 유지)
  const seenLabels = new Set();
  const dedupedBlocks = blocks.filter(b => {
    if (seenLabels.has(b.sec.label)) return false;
    seenLabels.add(b.sec.label);
    return true;
  });

  // 풀이 연습(자세히)에서는 풀이 섹션을 단계별 아코디언으로, 그 외엔 일반 렌더
  const renderBlock = (b) => {
    const bodyHtml = (b.isSolution && !compact) ? stepsAccordion(b.body) : richBody(b.body);
    return sectionHtml(b.sec, bodyHtml);
  };

  // 섹션 파싱 실패 → 통째로 표시
  if (dedupedBlocks.length === 0 && !finalBody) {
    return `<div class="feedback-wrap">${verdict}<div class="feedback-section-body" style="padding:0">${richBody(text)}</div></div>`;
  }

  const finalBox = finalBody
    ? `<div style="margin-top:12px;padding:10px 14px;background:rgba(74,144,226,0.1);border-left:3px solid #4A90E2;border-radius:6px;font-weight:700;color:#1a2340;">${mathHtml(finalBody)}</div>`
    : '';

  let sectionsHtml;
  if (compact) {
    const alwaysHtml = dedupedBlocks.filter(b => !b.collapse).map(renderBlock).join('');
    const collapseBlocks = dedupedBlocks.filter(b => b.collapse);
    let detailsHtml = '';
    if (collapseBlocks.length) {
      const inner = collapseBlocks.map(renderBlock).join('');
      detailsHtml = `
      <details class="feedback-details">
        <summary style="cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:9px 16px;border:1.5px solid var(--border);border-radius:10px;font-weight:700;font-size:0.85rem;color:var(--accent);background:var(--card);">📖 자세한 풀이 보기</summary>
        <div style="margin-top:6px;">${inner}</div>
      </details>`;
    }
    sectionsHtml = alwaysHtml + finalBox + detailsHtml;
  } else {
    sectionsHtml = dedupedBlocks.map(renderBlock).join('') + finalBox;
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
  syncMathPicker();

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
  const notes = lsJSON('wrong_notes', []);
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
  const notes = lsJSON('wrong_notes', []);
  if (countEl) countEl.textContent = notes.length + '문제';
  if (notes.length === 0) { list.innerHTML = '<p class="empty-hint">틀린 문제가 자동으로 저장돼요</p>'; return; }
  list.innerHTML = notes.map((n, i) => `
    <div class="wrong-note-item ${n.retried ? 'retried' : ''}">
      <div class="wrong-note-meta">
        <span class="wrong-note-type">${n.type}</span>
        <span class="wrong-note-date">${n.date}</span>
        ${n.retried ? '<span class="wrong-retried-badge">✅ 재도전 완료</span>' : ''}
      </div>
      <div class="wrong-note-problem math-problem">${mathHtml(n.problem.replace(/DESMOS_START[\s\S]*?DESMOS_END/g,"").replace(/\s*\n\s*/g," ").trim().substring(0,120))}...</div>
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
  const notes = lsJSON('wrong_notes', []);
  const note = notes[idx];
  if (!note) return;
  navigateTo('training');
  switchTab('basic');
  const listWrap = document.getElementById('basicProblemList');
  if (!listWrap) return;
  listWrap.classList.remove('hidden');
  document.getElementById('basicFeedback')?.classList.add('hidden');

  const cleanProblem = (note.problem || '').replace(/DESMOS_START[\s\S]*?DESMOS_END/g, '').trim();

  // 오답 재도전 배너 + 형식에 맞는 단일 카드(객관식=보기버튼, 단답=입력칸)
  listWrap.innerHTML = `<div style="margin-bottom:10px;padding:8px 12px;background:rgba(74,144,226,0.1);border-radius:8px;font-weight:700;color:var(--accent);font-size:0.88rem;">📝 오답 재도전${note.type ? ' · ' + note.type : ''}</div>`;
  const itemEl = document.createElement('div');
  itemEl.className = 'multi-problem-item';
  itemEl.innerHTML = renderMultiProblemItem(1, cleanProblem, '', note.correctAnswer || '', 'basic', 'ai', note.type || '');
  listWrap.appendChild(itemEl);
  renderMath(itemEl);
  attachChoiceListeners(listWrap);

  // 채점 버튼
  const oldRow = document.getElementById('basicBtnRow');
  if (oldRow) oldRow.remove();
  const row = document.createElement('div');
  row.id = 'basicBtnRow';
  row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;';
  const checkBtn = document.createElement('button');
  checkBtn.id = 'checkAllBtn-basic';
  checkBtn.className = 'btn-primary check-all-btn';
  checkBtn.innerHTML = '✅ 채점하기';
  checkBtn.onclick = () => checkAllAnswers('basic');
  row.appendChild(checkBtn);
  listWrap.appendChild(row);

  // 재도전 완료 표시
  notes[idx].retried = true;
  localStorage.setItem('wrong_notes', JSON.stringify(notes));
  try { saveToFirestore('data/wrong_notes', { notes }); } catch(e) {}
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
  const progress = lsJSON('unit_progress', {});
  const unitHist = lsJSON('unit_score_history', {});
  el.innerHTML = MATH_UNITS.map(subj => `
    <div class="progress-subject">
      <div class="progress-subject-name">${subj.subject}</div>
      <div class="progress-units">
        ${subj.units.map(unit => {
          const hist = unitHist[unit] || [];
          let correct = 0, total = 0;
          hist.forEach(e => { correct += (e.correct || 0); total += (e.total || 0); });
          const hasAcc = total > 0;
          const solved = hasAcc ? total : (progress[unit] || 0);
          const acc = hasAcc ? Math.round(correct / total * 100) : 0;
          const pct = hasAcc ? acc : 0;
          const color = !hasAcc ? '#cbd5e1' : (acc >= 80 ? 'var(--green)' : acc >= 40 ? 'var(--accent)' : '#FF9500');
          const label = hasAcc ? `정답률 ${acc}% · ${solved}회` : (solved > 0 ? `${solved}회` : '0회');
          return `<div class="progress-unit">
            <span class="progress-unit-name">${unit}</span>
            <div class="progress-unit-bar"><div class="progress-unit-fill" style="width:${pct}%;background:${color}"></div></div>
            <span class="progress-unit-pct">${label}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function updateUnitProgress(unitName) {
  if (!unitName) return;
  const progress = lsJSON('unit_progress', {});
  progress[unitName] = (progress[unitName] || 0) + 1;
  localStorage.setItem('unit_progress', JSON.stringify(progress));
  try { saveToFirestore('data/unit_progress', { progress }); } catch(e) {}
}

// ============ 성적 예측 ============
// ============ 단원별 성적 차트 ============
function switchChartTab(tab) {
  const examTab = document.getElementById('chartTabExam');
  const unitTab = document.getElementById('chartTabUnit');
  if (!examTab || !unitTab) return;
  examTab.style.display = tab === 'exam' ? 'block' : 'none';
  unitTab.style.display = tab === 'unit' ? 'block' : 'none';
  document.querySelectorAll('.chart-tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'exam') || (i === 1 && tab === 'unit'));
  });
  if (tab === 'unit') {
    const sel = document.getElementById('unitChartSelect');
    if (sel && sel.value) drawUnitChart(sel.value);
  }
}

function initUnitChartSelect() {
  const sel = document.getElementById('unitChartSelect');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = '<option value="">-- 단원 선택 --</option>';
  MATH_UNITS.forEach(subj => {
    const group = document.createElement('optgroup');
    group.label = subj.subject;
    subj.units.forEach(unit => {
      const opt = document.createElement('option');
      opt.value = unit;
      const hist = state.unitScoreHistory[unit];
      const hasData = hist && hist.length > 0;
      opt.textContent = unit + (hasData ? ' ✓' : '');
      group.appendChild(opt);
    });
    sel.appendChild(group);
  });
  if (currentVal) sel.value = currentVal;
}

function onUnitChartChange() {
  const sel = document.getElementById('unitChartSelect');
  if (sel && sel.value) drawUnitChart(sel.value);
  else {
    const canvas = document.getElementById('unitChart');
    const empty = document.getElementById('unitChartEmpty');
    const dateEl = document.getElementById('unitChartDate');
    if (canvas) canvas.style.display = 'none';
    if (empty) { empty.style.display = 'block'; empty.textContent = '단원을 선택하고 문제를 풀면 그래프가 표시돼요'; }
    if (dateEl) dateEl.textContent = '';
  }
}

function drawUnitChart(unitName) {
  const canvas = document.getElementById('unitChart');
  const empty = document.getElementById('unitChartEmpty');
  const dateEl = document.getElementById('unitChartDate');
  if (!canvas || !empty) return;

  const history = (state.unitScoreHistory[unitName] || []).slice().sort((a, b) => a.date.localeCompare(b.date));

  if (history.length < 1) {
    canvas.style.display = 'none';
    empty.style.display = 'block';
    empty.textContent = `[${unitName}] 풀이 기록이 없어요. 기본 문제에서 풀어보세요!`;
    if (dateEl) dateEl.textContent = '';
    return;
  }

  canvas.style.display = 'block';
  empty.style.display = 'none';

  const last = history[history.length - 1];
  if (dateEl) dateEl.textContent = `마지막 풀이: ${last.date} · ${last.correct}/${last.total}개 정답`;

  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || canvas.width;
  canvas.width = w;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const accs = history.map(e => e.total > 0 ? Math.round((e.correct / e.total) * 100) : 0);
  const padL = 44, padR = 16, padT = 28, padB = 44;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  // 그리드 (0~100%)
  ctx.strokeStyle = 'rgba(148,163,184,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillStyle = 'rgba(100,116,139,0.7)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText((100 - i * 25) + '%', padL - 4, y + 4);
  }

  const n = accs.length;
  const pts = accs.map((a, i) => ({
    x: padL + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW),
    y: padT + (1 - a / 100) * chartH
  }));

  // 60% 기준선
  const baseY = padT + (1 - 0.6) * chartH;
  ctx.beginPath();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = 'rgba(251,146,60,0.5)';
  ctx.lineWidth = 1.2;
  ctx.moveTo(padL, baseY); ctx.lineTo(w - padR, baseY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(251,146,60,0.6)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('60%', padL + 2, baseY - 3);

  // 그라데이션 + 라인
  const color = '#22c55e';
  if (n > 1) {
    const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
    grad.addColorStop(0, 'rgba(34,197,94,0.25)');
    grad.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, h - padB);
    ctx.lineTo(pts[0].x, h - padB);
    ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  // 점 + 정확도 + 날짜
  pts.forEach((p, i) => {
    const entry = history[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(accs[i] + '%', p.x, p.y - 12);

    ctx.fillStyle = 'rgba(100,116,139,0.7)'; ctx.font = '9px sans-serif';
    ctx.fillText(entry.correct + '/' + entry.total, p.x, p.y - 23);

    ctx.fillStyle = 'rgba(100,116,139,0.85)'; ctx.font = '9px sans-serif';
    ctx.fillText(entry.date, p.x, h - padB + 14);
  });
}

// ============ 틀린 문제 패턴 ============
function renderErrorPattern() {
  const el = document.getElementById('errorPattern');
  if (!el) return;
  const notes = lsJSON('wrong_notes', []);
  const filtered = notes.filter(n => n.type && n.type !== '기타');
  if (filtered.length < 3) { el.innerHTML = '<p class="empty-hint">틀린 문제 3개 이상 쌓이면 패턴이 분석돼요</p>'; return; }
  const typeCounts = {};
  filtered.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });
  const sorted = Object.entries(typeCounts).sort((a,b) => b[1]-a[1]);
  const total = filtered.length;
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
  const earned = lsJSON('earned_badges', []);
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
  const earned = lsJSON('earned_badges', []);
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
  drawCompareChart();
  updateWeakTypesUI();
  renderWrongNotes();
  renderProgressTable();
  renderErrorPattern();
  renderBadges();
  checkAndAwardBadges();
  initUnitChartSelect();
}

function hexToRgba(hex, a) {
  const m = String(hex).replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function drawCompareChart() {
  const canvas = document.getElementById('compareChart');
  const empty = document.getElementById('compareChartEmpty');
  const dateEl = document.getElementById('compareChartDate');
  const summaryRow = document.getElementById('compareSummaryRow');
  if (!canvas || !empty) return;

  const ai = state.aiStats;
  const su = state.suneungStats;
  const hasAI = ai.total > 0;
  const hasSu = su.total > 0;

  // 요약 배지
  if (summaryRow) {
    const aiAcc = hasAI ? Math.round(ai.correct / ai.total * 100) : 0;
    const suAcc = hasSu ? Math.round(su.correct / su.total * 100) : 0;
    summaryRow.innerHTML = `
      <div class="compare-badge">
        <div class="compare-badge-dot" style="background:#6366f1"></div>
        <div class="compare-badge-info">
          <strong>AI 문제</strong>
          <span>${ai.total}문제 · 정답률 ${aiAcc}%</span>
        </div>
      </div>
      <div class="compare-badge">
        <div class="compare-badge-dot" style="background:#22c55e"></div>
        <div class="compare-badge-info">
          <strong>수능 기출</strong>
          <span>${su.total}문제 · 정답률 ${suAcc}%</span>
        </div>
      </div>`;
  }

  if (!hasAI && !hasSu) {
    canvas.style.display = 'none';
    empty.style.display = 'block';
    if (dateEl) dateEl.textContent = '';
    return;
  }
  canvas.style.display = 'block';
  empty.style.display = 'none';

  // 날짜 범위 통합
  const allDates = [...new Set([
    ...(ai.history || []).map(e => e.date),
    ...(su.history || []).map(e => e.date)
  ])].sort();

  const lastDate = allDates[allDates.length - 1] || '';
  if (dateEl) dateEl.textContent = lastDate ? `마지막 풀이: ${lastDate}` : '';

  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || canvas.width;
  canvas.width = w;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padL = 44, padR = 16, padT = 28, padB = 50;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const n = allDates.length;

  // 그리드
  ctx.strokeStyle = 'rgba(148,163,184,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillStyle = 'rgba(100,116,139,0.7)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText((100 - i * 25) + '%', padL - 4, y + 4);
  }

  // x축 날짜
  allDates.forEach((date, i) => {
    const x = padL + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
    ctx.fillStyle = 'rgba(100,116,139,0.85)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(date, x, h - padB + 14);
  });

  // 두 데이터셋 공통 그리기
  function drawLine(history, color, labelBelow) {
    if (!history || history.length === 0) return;
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const pts = allDates.map(date => {
      const entry = sorted.find(e => e.date === date);
      if (!entry) return null;
      const acc = entry.total > 0 ? Math.round(entry.correct / entry.total * 100) : 0;
      const xi = allDates.indexOf(date);
      return {
        x: padL + (n === 1 ? chartW / 2 : (xi / (n - 1)) * chartW),
        y: padT + (1 - acc / 100) * chartH,
        acc, entry
      };
    }).filter(Boolean);

    if (pts.length === 0) return;

    // 그라데이션 (옅은 면 채우기)
    const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
    grad.addColorStop(0, hexToRgba(color, 0.16));
    grad.addColorStop(1, hexToRgba(color, 0));

    if (pts.length > 1) {
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length-1].x, h - padB);
      ctx.lineTo(pts[0].x, h - padB);
      ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = color; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.acc + '%', p.x, labelBelow ? p.y + 16 : p.y - 9);
    });
  }

  // 범례
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  [['#6366f1', 'AI 문제'], ['#22c55e', '수능 기출']].forEach(([color, label], i) => {
    const lx = padL + i * 100;
    const ly = h - padB + 30;
    ctx.beginPath(); ctx.arc(lx + 5, ly, 5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = 'rgba(100,116,139,0.9)'; ctx.fillText(label, lx + 13, ly + 4);
  });

  drawLine(ai.history, '#6366f1', false);
  drawLine(su.history, '#22c55e', true);
}

function drawScoreChart() {
  const canvas = document.getElementById('scoreChart');
  const empty = document.getElementById('scoreChartEmpty');
  const dateEl = document.getElementById('examChartDate');
  if (!canvas || !empty) return;
  if (state.scoreHistory.length < 1) {
    empty.style.display = 'block';
    canvas.style.display = 'none';
    if (dateEl) dateEl.textContent = '';
    return;
  }
  canvas.style.display = 'block';
  empty.style.display = 'none';

  // 마지막 업데이트 날짜 표시
  const last = state.scoreHistory[state.scoreHistory.length - 1];
  if (dateEl) dateEl.textContent = `마지막 업데이트: ${last.date}`;

  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || canvas.width;
  canvas.width = w;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const scores = state.scoreHistory.map(s => s.score);
  const maxS = Math.max(...scores, 100);
  const minS = Math.max(Math.min(...scores) - 10, 0);
  const padL = 44, padR = 16, padT = 28, padB = 44;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  // 배경 그리드
  ctx.strokeStyle = 'rgba(148,163,184,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillStyle = 'rgba(100,116,139,0.7)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxS - (maxS - minS) / 4 * i), padL - 4, y + 4);
  }

  const n = scores.length;
  const pts = scores.map((s, i) => ({
    x: padL + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW),
    y: padT + (1 - (s - minS) / ((maxS - minS) || 1)) * chartH
  }));

  // 그라데이션 채우기
  if (n > 1) {
    const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
    grad.addColorStop(0, 'rgba(99,102,241,0.25)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, h - padB);
    ctx.lineTo(pts[0].x, h - padB);
    ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5;
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  // 점 + 점수 + 등급 + 날짜 + 라벨
  pts.forEach((p, i) => {
    const entry = state.scoreHistory[i];
    // 점
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    // 점수
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(entry.score + '점', p.x, p.y - 12);

    // 등급 (있으면)
    if (entry.grade) {
      ctx.fillStyle = '#6366f1'; ctx.font = '10px sans-serif';
      ctx.fillText(entry.grade + '등급', p.x, p.y - 24);
    }

    // 날짜 (x축 아래)
    ctx.fillStyle = 'rgba(100,116,139,0.85)'; ctx.font = '9px sans-serif';
    ctx.fillText(entry.date, p.x, h - padB + 14);

    // 시험 라벨 (날짜 아래)
    if (entry.label) {
      ctx.fillStyle = 'rgba(100,116,139,0.65)'; ctx.font = '9px sans-serif';
      ctx.fillText(entry.label, p.x, h - padB + 26);
    }
  });
}

// ============ 유형별 수준 ============
// ★ 예전에는 퍼센트를 Math.random() 으로 지어냈다. 풀지 않아도 숫자가 떴고
//   새로고침할 때마다 값이 바뀌었다. 진단을 내세우는 서비스에서 가장 위험한 버그였다.
//   지금은 진도표와 똑같이 unit_score_history(실제 채점 기록)로 계산하고,
//   푼 문제가 없으면 숫자를 만들지 않고 "기록 없음" 이라고 밝힌다.
//
// unit_score_history 는 출제 단원(18개) 이름으로 쌓이므로, 화면에 보이는
// 큰 분류로 묶어서 합산한다.
const TYPE_GROUPS = [
  { name: '수와 연산',     color: '#3b82f6', units: ['수와 연산', '지수와 로그'] },
  { name: '방정식·부등식', color: '#06b6d4', units: ['방정식과 부등식'] },
  { name: '함수',          color: '#8b5cf6', units: ['함수', '삼각함수', '함수의 극한과 연속'] },
  { name: '수열',          color: '#ec4899', units: ['수열', '수열의 극한'] },
  { name: '확률·통계',     color: '#f59e0b', units: ['경우의 수', '확률', '통계'] },
  { name: '미적분',        color: '#22c55e', units: ['미분', '적분', '미분법', '적분법'] },
  { name: '기하',          color: '#64748b', units: ['이차곡선', '평면벡터', '공간도형과 공간좌표'] },
];

function drawTypeChart() {
  const container = document.getElementById('typeChart');
  if (!container) return;

  const hist = state.unitScoreHistory || {};
  const weakList = (state.weakTypes || []).map(cleanWeakType);

  const rows = TYPE_GROUPS.map((g) => {
    let correct = 0, total = 0;
    g.units.forEach((u) => {
      (hist[u] || []).forEach((e) => {
        correct += (e.correct || 0);
        total   += (e.total   || 0);
      });
    });
    // AI 성적표 분석이 약점으로 지목했는지 (큰 분류 이름 또는 소속 단원 이름으로 대조)
    const isWeak = weakList.some((w) =>
      w.includes(g.name) || g.name.includes(w) ||
      g.units.some((u) => w.includes(u) || u.includes(w)));
    return { ...g, correct, total, isWeak, pct: total ? Math.round(correct / total * 100) : null };
  });

  const anyData = rows.some((r) => r.total > 0);

  container.innerHTML = rows.map((r) => {
    const hasData = r.pct !== null;
    const width = hasData ? r.pct : 0;
    const color = hasData ? r.color : '#e2e8f0';
    // 분모를 같이 보여준다. "67%" 만 쓰면 3문제 중 2개인지 30문제 중 20개인지 알 수 없다.
    const right = hasData
      ? `${r.pct}% · ${r.total}문제${r.isWeak ? ' ⚠️' : ''}`
      : (r.isWeak ? '⚠️ 약점' : '기록 없음');
    const dim = hasData ? '' : 'opacity:0.55;';
    return `<div class="type-bar-item" style="${dim}">
      <div class="type-bar-label"><span>${r.name}</span><span>${right}</span></div>
      <div class="type-bar-bg"><div class="type-bar-fill" style="width:${width}%;background:${color}"></div></div>
    </div>`;
  }).join('') + (anyData
    ? ''
    : '<p class="empty-hint" style="margin-top:12px;">문제를 풀면 단원별 정답률이 여기에 쌓여요</p>');
}

function cleanWeakType(t) {
  return t.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/^\d+\.\s*/, '').trim();
}

function updateWeakTypesUI() {
  const container = document.getElementById('weakTypes');
  if (!container) return;
  if (state.weakTypes.length === 0) {
    container.innerHTML = '<p class="empty-hint">성적 분석 후 약점 유형이 표시돼요</p>';
    state.selectedWeakType = null;
    return;
  }

  // cleanedList 기준으로 비교 (마크다운 제거 후 비교하여 Firestore/localStorage 불일치 방지)
  const cleanedList = state.weakTypes.map(cleanWeakType);
  if (!state.selectedWeakType || !cleanedList.includes(state.selectedWeakType)) {
    state.selectedWeakType = cleanedList[0];
  }

  container.innerHTML = cleanedList.map(clean => {
    const isSelected = clean === state.selectedWeakType;
    const selectedStyle = isSelected
      ? 'background:#4A90E2;color:#fff;border:2px solid #4A90E2;box-shadow:0 2px 8px rgba(74,144,226,0.4);'
      : 'background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);';
    return `<span data-weak-type="${escapeHtml(clean)}" style="display:inline-block;margin:4px;padding:6px 14px;border-radius:99px;font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.2s;${selectedStyle}">${isSelected ? '🎯' : '⚠️'} ${escapeHtml(clean)}</span>`;
  }).join('');

  // 이벤트 위임으로 클릭 처리 (onclick 문자열 삽입 대신 안전하게)
  container.onclick = function(e) {
    const span = e.target.closest('[data-weak-type]');
    if (!span) return;
    state.selectedWeakType = span.dataset.weakType;
    updateWeakTypesUI();
  };
}

// ============ HELPERS ============
function incrementProblems(isCorrect, problem = '', myAnswer = '', correctAnswer = '', type = '', source = 'ai') {
  state.totalProblems++;
  if (isCorrect) state.correctProblems++;
  else saveWrongNote(problem || state.currentProblem || '', myAnswer, correctAnswer, type);
  updateUnitProgress(type);

  // 단원별 성적 기록 저장
  if (type) {
    const todayKey = toDateKey(new Date());
    if (!state.unitScoreHistory[type]) state.unitScoreHistory[type] = [];
    const existing = state.unitScoreHistory[type].find(e => e.date === todayKey);
    if (existing) {
      existing.total++;
      if (isCorrect) existing.correct++;
    } else {
      state.unitScoreHistory[type].push({ date: todayKey, correct: isCorrect ? 1 : 0, total: 1 });
    }
    localStorage.setItem('unit_score_history', JSON.stringify(state.unitScoreHistory));
    try { saveToFirestore('data/unit_score_history', { history: state.unitScoreHistory }); } catch(e) {}
  }

  // AI vs 기출 분리 통계
  const todayKey = toDateKey(new Date());
  const statsObj = source === 'suneung' ? state.suneungStats : state.aiStats;
  const statsKey = source === 'suneung' ? 'suneung_stats' : 'ai_stats';
  const firestoreKey = source === 'suneung' ? 'data/suneung_stats' : 'data/ai_stats';
  statsObj.total++;
  if (isCorrect) statsObj.correct++;
  const histEntry = statsObj.history.find(e => e.date === todayKey);
  if (histEntry) {
    histEntry.total++;
    if (isCorrect) histEntry.correct++;
  } else {
    statsObj.history.push({ date: todayKey, correct: isCorrect ? 1 : 0, total: 1 });
  }
  localStorage.setItem(statsKey, JSON.stringify(statsObj));
  try { saveToFirestore(firestoreKey, statsObj); } catch(e) {}

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

// ============================================================
// [v8] 레벨 테스트 — 학원 반배치고사 방식
// ============================================================
// 성적표 없이도 실력을 재서 약점 단원과 추정 등급을 뽑는다.
//
// 설계 원칙
//  1. 2점·3점만 쓴다. 준킬러·킬러는 쓰지 않는다.
//     -> 은행에 준킬러가 없기도 하고, 못 푸는 문제를 쌓아봐야 측정이 안 된다.
//  2. 채점은 AI를 쓰지 않는다. isAnswerCorrect() 로 즉시·무료로 판정한다.
//     -> 27문제를 AI로 채점하면 문제당 10~30초에 비용까지 든다.
//  3. 통합수능 구조를 따른다. 공통(수학Ⅰ·Ⅱ) + 선택 1과목.
//     -> 미적분 선택자에게 기하 문제를 내지 않기 위해 선택과목을 먼저 묻는다.
//  4. 측정 한계를 숨기지 않는다. 2·3점만으로는 3등급 위를 못 가른다.
// ============================================================

const LT_KEY = 'level_test_state';

// 통합수능 과목 구조 (2022학년도~)
const LT_COMMON = [
  { group: '수학Ⅰ', types: ['지수와 로그', '삼각함수', '수열'] },
  { group: '수학Ⅱ', types: ['함수의 극한과 연속', '미분', '적분'] },
];
const LT_ELECTIVES = {
  '미적분':     ['수열의 극한', '미분법', '적분법'],
  '확률과 통계': ['경우의 수', '확률', '통계'],
  '기하':       ['이차곡선', '평면벡터', '공간도형과 공간좌표'],
};

// 단원당 배점 구성: 2점 1개 + 3점 2개
const LT_LEVELS_PER_UNIT = ['2', '3', '3'];
// 한 화면에 한 단원(3문제)씩 보여준다. 27번 누르는 대신 9번만 누르면 된다.
const LT_PAGE_SIZE = LT_LEVELS_PER_UNIT.length;
// 요청한 배점이 없을 때 대체 범위 (4점으로는 절대 안 빠진다)
const LT_FALLBACK = { '2': ['2', '3'], '3': ['3', '2'] };

let ltState = null;

function ltLoad() {
  try {
    const raw = localStorage.getItem(LT_KEY);
    ltState = raw ? JSON.parse(raw) : null;
  } catch (e) { ltState = null; }
  // 한 문제씩 풀던 예전 저장본(idx)을 단원 페이지(page)로 옮긴다
  if (ltState && ltState.page === undefined) {
    ltState.page = Math.floor((ltState.idx || 0) / LT_PAGE_SIZE);
  }
  return ltState;
}
function ltSave() {
  try { localStorage.setItem(LT_KEY, JSON.stringify(ltState)); } catch (e) {}
}
function ltClear() {
  ltState = null;
  try { localStorage.removeItem(LT_KEY); } catch (e) {}
}

// ---------- 시작 화면 ----------
function renderLevelTestIntro() {
  const el = document.getElementById('ltIntro');
  if (!el) return;
  document.getElementById('ltProgress')?.classList.add('hidden');
  document.getElementById('ltProblemList')?.classList.add('hidden');
  document.getElementById('ltResult')?.classList.add('hidden');
  el.classList.remove('hidden');

  ltLoad();
  const totalPages = ltState && ltState.items ? Math.ceil(ltState.items.length / LT_PAGE_SIZE) : 0;
  const inProgress = ltState && ltState.items && ltState.page < totalPages;

  if (inProgress) {
    el.innerHTML = `
      <div style="padding:14px;border:1.5px solid var(--border);border-radius:12px;margin-bottom:12px;">
        <strong>풀던 테스트가 있어요</strong>
        <p style="color:var(--text2);font-size:0.9rem;margin:6px 0 10px;">
          선택과목 ${ltState.elective} · ${totalPages}단원 중 ${ltState.page}단원까지 풀었어요
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-primary" onclick="resumeLevelTest()">이어서 풀기</button>
          <button class="btn-ghost" onclick="ltClearAndIntro()">처음부터 다시</button>
        </div>
      </div>`;
    return;
  }

  el.innerHTML = `
    <p style="color:var(--text2);font-size:0.92rem;line-height:1.6;margin-bottom:12px;">
      성적표에는 표준점수·백분위·등급만 있어서 <strong>어느 단원이 약한지는 알 수 없어요.</strong>
      (분석 결과에 "정보 부족"이 뜨는 이유예요.)<br/>
      레벨 테스트는 직접 풀어보고 그 빈칸을 채워요. 9개 단원에서 3문제씩, 모두 27문제예요.<br/>
      <strong>한 화면에 한 단원씩 3문제</strong>가 나오고, 다 풀면 "다음"을 눌러 넘어가요.<br/>
      2점·3점 문제만 나와요. 30~50분 정도 걸리고, 중간에 그만둬도 이어서 풀 수 있어요.
    </p>
    <p style="font-weight:600;margin-bottom:8px;">선택과목을 골라주세요</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${Object.keys(LT_ELECTIVES).map(k => `
        <button class="btn-primary" onclick="startLevelTest('${k}')">${k}</button>
      `).join('')}
    </div>
    <p style="font-size:0.8rem;color:var(--text3);margin-top:10px;">
      공통(수학Ⅰ·수학Ⅱ) 6단원은 모두 공통으로 나오고, 선택과목 3단원이 더해져요.
    </p>`;
}

window.ltClearAndIntro = function () {
  if (!confirm('지금까지 푼 답이 사라져요. 처음부터 다시 시작할까요?')) return;
  ltClear();
  renderLevelTestIntro();
};

// ---------- 문제 수집 ----------
function ltUnitList(elective) {
  const units = [];
  LT_COMMON.forEach(g => g.types.forEach(t => units.push({ type: t, group: g.group })));
  (LT_ELECTIVES[elective] || []).forEach(t => units.push({ type: t, group: elective }));
  return units;
}

window.startLevelTest = async function (elective) {
  const intro = document.getElementById('ltIntro');
  if (!LT_ELECTIVES[elective]) return;

  intro.innerHTML = `<span class="spinner"></span> 문제를 준비하고 있어요...`;

  const units = ltUnitList(elective);
  const items = [];
  const shortage = [];

  for (const u of units) {
    for (const lv of LT_LEVELS_PER_UNIT) {
      let p = null;
      try {
        p = await fetchFromBank(u.type, lv, { levels: LT_FALLBACK[lv] });
      } catch (e) { p = null; }
      if (!p) { shortage.push(`${u.type} ${lv}점`); continue; }
      items.push({
        type: u.type,
        group: u.group,
        askedLevel: lv,
        level: p.level || lv,
        visibleText: p.visibleText,
        answer: p.answer,
        hint: p.hint || '',
        desmos: p.desmos || [],
        userAns: null,
        correct: null,
      });
    }
  }

  if (items.length === 0) {
    intro.innerHTML = `
      <div style="color:var(--text2);padding:10px;">
        문제 은행에서 2·3점 문제를 찾지 못했어요.<br/>
        문제를 먼저 만들어 올린 뒤에 다시 시도해주세요.
      </div>
      <button class="btn-ghost" onclick="renderLevelTestIntro()" style="margin-top:8px;">돌아가기</button>`;
    return;
  }

  ltState = {
    elective,
    items,
    page: 0,
    startedAt: new Date().toISOString(),
    shortage,
  };
  ltSave();
  renderLevelTestPage();
};

window.resumeLevelTest = function () {
  ltLoad();
  if (!ltState || !ltState.items) { renderLevelTestIntro(); return; }
  if (ltState.page >= Math.ceil(ltState.items.length / LT_PAGE_SIZE)) { renderLevelTestResult(); return; }
  renderLevelTestPage();
};

// ---------- 진행 ----------
function renderLevelTestPage() {
  if (!ltState) return;
  const totalPages = Math.ceil(ltState.items.length / LT_PAGE_SIZE);
  if (ltState.page >= totalPages) { renderLevelTestResult(); return; }

  const from = ltState.page * LT_PAGE_SIZE;
  const group = ltState.items.slice(from, from + LT_PAGE_SIZE);
  if (!group.length) { renderLevelTestResult(); return; }

  document.getElementById('ltIntro')?.classList.add('hidden');
  document.getElementById('ltResult')?.classList.add('hidden');

  const prog = document.getElementById('ltProgress');
  const list = document.getElementById('ltProblemList');
  prog.classList.remove('hidden');
  list.classList.remove('hidden');

  const unit = group[0];
  const pageNo = ltState.page + 1;
  const pct = Math.round((ltState.page / totalPages) * 100);
  prog.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
      <strong style="font-size:1rem;">${unit.type}</strong>
      <span style="font-size:0.85rem;color:var(--text2);">${unit.group} · ${pageNo}/${totalPages}단원</span>
    </div>
    <div style="height:6px;background:var(--border,#e3e6ea);border-radius:999px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#4A90E2,#6C63FF);transition:width .3s;"></div>
    </div>
    <div style="font-size:0.8rem;color:var(--text3);margin-top:5px;">
      문제 ${from + 1}~${from + group.length} / ${ltState.items.length}
    </div>`;

  // 한 단원의 3문제를 한 번에 그린다
  list.innerHTML = group.map((it, i) => renderMultiProblemItem(
    from + i + 1, it.visibleText, '', it.answer, 'lt', 'ai', it.type, '', it.level, it.desmos
  )).join('');
  renderMath(list);
  renderCardGraphs(list);
  attachChoiceListeners(list);

  // 실력 측정이므로 힌트는 쓰지 않는다
  list.querySelectorAll('.hint-btn').forEach(b => b.remove());

  // 이미 풀고 돌아온 페이지면 답을 되살려 보여준다
  group.forEach((it, i) => {
    if (!it.userAns) return;
    const card = list.querySelectorAll('.multi-problem-card')[i];
    if (!card) return;
    // 답에 따옴표가 섞이면 선택자 문법이 깨져 querySelector 가 예외를 던지고,
    // 그러면 복원이 통째로 중단된다. 선택지 복원은 실패해도 되는 일이라 감싸 둔다.
    let btn = null;
    try { btn = card.querySelector(`.choice-btn[data-val="${CSS.escape(String(it.userAns))}"]`); }
    catch (_) { btn = null; }
    if (btn) btn.classList.add('selected');
    const inp = card.querySelector('.multi-ans-input');
    if (inp) inp.value = it.userAns;
  });

  const isLast = pageNo === totalPages;
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;';
  row.innerHTML = `
    <button class="btn-primary" onclick="ltNextPage(false)" style="flex:1;min-width:160px;">
      ${isLast ? '제출하고 결과 보기' : '다음 단원 3문제'}
    </button>
    <button class="btn-ghost" onclick="ltNextPage(true)">모르는 건 비우고 넘어가기</button>
    <button class="btn-ghost" onclick="ltPause()">나중에 하기</button>`;
  list.appendChild(row);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.ltPause = function () {
  ltSave();
  renderLevelTestIntro();
};

// 한 단원(3문제)의 답을 한 번에 거둔다.
// allowBlank 가 true 면 빈 답은 오답으로 처리하고 넘어간다.
window.ltNextPage = function (allowBlank) {
  if (!ltState) return;
  const from = ltState.page * LT_PAGE_SIZE;
  const group = ltState.items.slice(from, from + LT_PAGE_SIZE);
  const cards = document.querySelectorAll('#ltProblemList .multi-problem-card');

  const answers = group.map((it, i) => {
    const card = cards[i];
    if (!card) return '';
    const sel = card.querySelector('.choice-btn.selected');
    const inp = card.querySelector('.multi-ans-input');
    return sel ? sel.dataset.val : (inp ? inp.value.trim() : '');
  });

  if (!allowBlank) {
    const blanks = answers.map((a, i) => a ? null : (from + i + 1)).filter(Boolean);
    if (blanks.length) {
      alert(`${blanks.join(', ')}번 문제의 답이 비어 있어요.\n모르면 "모르는 건 비우고 넘어가기"를 눌러도 돼요.`);
      return;
    }
  }

  group.forEach((it, i) => {
    const a = answers[i];
    it.userAns = a;
    it.correct = a ? isAnswerCorrect(a, it.answer) : false;
  });

  ltState.page++;
  ltSave();

  if (ltState.page >= Math.ceil(ltState.items.length / LT_PAGE_SIZE)) renderLevelTestResult();
  else renderLevelTestPage();
};

// ---------- 등급 추정 ----------
// 2점은 기초 개념, 3점은 개념 연결을 본다.
// 2점부터 흔들리면 기초가 비어 있는 것이므로 3점 결과와 무관하게 아래 등급으로 본다.
// 단계별 if 로 끊으면 "3점을 17/18 맞췄는데 2점 2개 틀려서 7등급" 같은 절벽이 생긴다.
// 그래서 가중 점수를 쓴다. 3점이 실력을 더 잘 드러내므로 비중을 7:3 으로 둔다.
// 다만 2점이 절반 미만이면 기초가 비어 있는 것이므로 3점 결과와 무관하게 아래로 본다.
function ltEstimateGrade(p2, p3) {
  const score = 0.3 * p2 + 0.7 * p3;
  // 2점만 낮은 건 실수이거나 그 문제들이 이상한 경우일 수 있으므로,
  // 기초가 무너졌다고 보려면 3점까지 같이 약해야 한다.
  const basicsBroken = p2 < 0.5 && p3 < 0.5;

  let grade;
  if (basicsBroken || score < 0.30) grade = '8~9등급';
  else if (score < 0.45)            grade = '7등급';
  else if (score < 0.60)            grade = '6등급';
  else if (score < 0.75)            grade = '5등급';
  else if (score < 0.88)            grade = '4등급';
  else                              grade = '3등급 이상';

  // ⭐ 메모는 등급이 아니라 실제 정답률에서 만든다.
  //   등급은 2점·3점을 섞은 점수로 정하는데, 메모를 등급 구간에 매달아 두면
  //   사실과 반대되는 말을 하게 된다. 실제로 이런 경우가 나왔다:
  //     2점 100% · 3점 45% → 5등급 → "3점을 절반 넘게 맞혀요"    (틀린 말)
  //     2점   0% · 3점 70% → 6등급 → "3점을 절반 이하로 맞혔어요" (틀린 말)
  //   약점을 짚어 주는 앱이 학생의 성적을 틀리게 말하면 안 된다.
  let note;
  if (basicsBroken) {
    note = '2점과 3점 모두 절반을 못 넘겼어요. 공식과 기본 개념부터 다시 쌓아야 해요.';
  } else if (p2 < 0.5) {
    note = '3점은 버티는데 2점에서 흘리고 있어요. 기본 개념을 한 번 정리하면 바로 올라가요.';
  } else if (p3 < 0.34) {
    note = '기본 공식은 되는데 개념을 두 개 엮으면 막혀요. 3점 연습이 지금 할 일이에요.';
  } else if (p3 < 0.67) {
    note = '3점에서 절반쯤 맞혀요. 여기가 지금 올릴 구간이에요.';
  } else if (p3 < 0.9) {
    note = '3점은 거의 잡았어요. 남은 건 4점 연습이에요.';
  } else {
    note = '2·3점은 충분히 잡았어요. 이 테스트로는 여기까지만 잴 수 있어요.';
  }
  return { grade, note };
}

function ltSummarize() {
  const items = ltState.items;
  let c2 = 0, n2 = 0, c3 = 0, n3 = 0;
  const byUnit = {};

  items.forEach(it => {
    const lv = String(it.level);
    if (lv === '2') { n2++; if (it.correct) c2++; }
    else { n3++; if (it.correct) c3++; }

    if (!byUnit[it.type]) byUnit[it.type] = { group: it.group, total: 0, correct: 0 };
    byUnit[it.type].total++;
    if (it.correct) byUnit[it.type].correct++;
  });

  const p2 = n2 ? c2 / n2 : 0;
  const p3 = n3 ? c3 / n3 : 0;
  const est = ltEstimateGrade(p2, p3);

  // 정답률이 낮은 순으로 정렬해 약점 단원을 뽑는다
  const units = Object.entries(byUnit).map(([type, v]) => ({
    type, group: v.group, total: v.total, correct: v.correct,
    rate: v.total ? v.correct / v.total : 0,
  })).sort((a, b) => a.rate - b.rate || a.type.localeCompare(b.type));

  const weak = units.filter(u => u.rate <= 0.34).map(u => u.type);
  const totalCorrect = items.filter(i => i.correct).length;

  return { c2, n2, c3, n3, p2, p3, est, units, weak, totalCorrect, total: items.length };
}

// ---------- 결과 ----------
function renderLevelTestResult() {
  if (!ltState) { renderLevelTestIntro(); return; }
  const s = ltSummarize();

  document.getElementById('ltIntro')?.classList.add('hidden');
  document.getElementById('ltProgress')?.classList.add('hidden');
  document.getElementById('ltProblemList')?.classList.add('hidden');
  const box = document.getElementById('ltResult');
  box.classList.remove('hidden');

  const pct = v => Math.round(v * 100) + '%';
  const bar = (rate) => {
    const color = rate <= 0.34 ? '#FF6B6B' : (rate <= 0.67 ? '#FF9500' : '#34C759');
    return `<div style="height:6px;background:var(--border,#e3e6ea);border-radius:999px;overflow:hidden;">
              <div style="height:100%;width:${Math.round(rate * 100)}%;background:${color};"></div>
            </div>`;
  };

  box.innerHTML = `
    <h3>📝 레벨 테스트 결과</h3>

    <div style="text-align:center;padding:18px 0 10px;">
      <div style="font-size:2rem;font-weight:800;">${s.est.grade}</div>
      <div style="color:var(--text2);font-size:0.9rem;margin-top:4px;">
        ${s.totalCorrect} / ${s.total}문제 정답
      </div>
      <p style="color:var(--text2);font-size:0.9rem;margin-top:10px;line-height:1.55;max-width:460px;margin-left:auto;margin-right:auto;">
        ${s.est.note}
      </p>
    </div>

    <div style="display:flex;gap:10px;margin:14px 0;">
      <div style="flex:1;padding:12px;border:1.5px solid var(--border);border-radius:12px;text-align:center;">
        <div style="font-size:0.82rem;color:var(--text2);">2점 (기초 개념)</div>
        <div style="font-size:1.3rem;font-weight:700;margin-top:2px;">${pct(s.p2)}</div>
        <div style="font-size:0.78rem;color:var(--text3);">${s.c2} / ${s.n2}</div>
      </div>
      <div style="flex:1;padding:12px;border:1.5px solid var(--border);border-radius:12px;text-align:center;">
        <div style="font-size:0.82rem;color:var(--text2);">3점 (개념 연결)</div>
        <div style="font-size:1.3rem;font-weight:700;margin-top:2px;">${pct(s.p3)}</div>
        <div style="font-size:0.78rem;color:var(--text3);">${s.c3} / ${s.n3}</div>
      </div>
    </div>

    <h4 style="margin:16px 0 8px;font-size:0.95rem;">단원별 정답률 (낮은 순)</h4>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${s.units.map(u => `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.86rem;margin-bottom:3px;">
            <span>${u.type} <span style="color:var(--text3);font-size:0.78rem;">${u.group}</span></span>
            <span style="color:var(--text2);">${u.correct}/${u.total}</span>
          </div>
          ${bar(u.rate)}
        </div>`).join('')}
    </div>

    <div style="margin-top:18px;padding:12px;background:var(--bg2,#f6f7f9);border-radius:12px;font-size:0.84rem;color:var(--text2);line-height:1.55;">
      이 테스트는 2점·3점 문제만 사용해요. 그래서 3등급보다 위는 구분하지 않아요.
      ${(ltState.shortage && ltState.shortage.length)
        ? '<br/>문제 은행이 부족해서 ' + ltState.shortage.length + '문제는 빼고 냈어요: ' + ltState.shortage.join(', ')
        : ''}
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">
      ${s.weak.length ? `<button class="btn-primary" onclick="ltApplyWeak()">약점 ${s.weak.length}개 유형 집중에 등록</button>` : ''}
      <button class="btn-ghost" onclick="ltApplyGrade('${s.est.grade}')">이 등급으로 설정</button>
      <button class="btn-ghost" onclick="ltReview()">틀린 문제 다시 보기</button>
      <button class="btn-ghost" onclick="ltClearAndIntro()">다시 테스트</button>
    </div>`;

  // 결과를 남겨두면 나중에 다시 볼 수 있다
  ltState.result = { grade: s.est.grade, weak: s.weak, at: new Date().toISOString() };
  ltSave();
}

// 약점 단원을 유형 집중 트레이닝으로 넘긴다
window.ltApplyWeak = function () {
  const s = ltSummarize();
  if (!s.weak.length) return;
  let cur = Array.isArray(state.weakTypes) ? state.weakTypes.slice() : [];
  // 새로 찾은 약점을 앞에 둔다. 테스트를 여러 번 해도 목록이 무한정 늘지 않게 12개로 자른다.
  s.weak.forEach(t => { cur = cur.filter(x => x !== t); });
  cur = s.weak.concat(cur).slice(0, 12);
  state.weakTypes = cur;
  try { localStorage.setItem('weak_types', JSON.stringify(cur)); } catch (e) {}
  if (typeof updateWeakTypesUI === 'function') updateWeakTypesUI();
  alert(`약점 ${s.weak.length}개 유형을 등록했어요.\n트레이닝 > 유형 집중 탭에서 바로 연습할 수 있어요.`);
};

// 추정 등급을 내 등급으로 설정
window.ltApplyGrade = function (gradeLabel) {
  const m = String(gradeLabel).match(/(\d)/);
  if (!m) return;
  const g = m[1];
  if (!confirm(`내 등급을 ${g}등급으로 설정할까요?\n앞으로 나오는 문제의 배점이 이 등급에 맞춰져요.`)) return;
  state.currentGrade = g;
  try { localStorage.setItem('current_grade', g); } catch (e) {}
  if (typeof updateHeaderBadge === 'function') updateHeaderBadge();
  if (typeof updateHomeStats === 'function') updateHomeStats();
  alert(`${g}등급으로 설정했어요.`);
};

// 틀린 문제 다시 보기
window.ltReview = function () {
  if (!ltState) return;
  const wrong = ltState.items.filter(i => !i.correct);
  const box = document.getElementById('ltResult');
  if (!wrong.length) {
    box.insertAdjacentHTML('beforeend',
      `<p style="margin-top:12px;color:var(--text2);">틀린 문제가 없어요.</p>`);
    return;
  }
  const html = wrong.map((it, i) => `
    <div style="padding:12px;border:1.5px solid var(--border);border-radius:12px;margin-bottom:10px;">
      <div style="font-size:0.82rem;color:var(--text2);margin-bottom:6px;">
        ${it.type} · ${it.level}점 ${it.userAns ? '' : '(모르겠어요)'}
      </div>
      <div style="margin-bottom:8px;">${renderProblemHTML(it.visibleText)}</div>
      <div style="font-size:0.86rem;">
        <!-- escapeHtml 필수: 부등식 답(x<3, a<b)을 그냥 넣으면 브라우저가 태그로 먹어
             답이 통째로 사라진다. $...$ 안의 수식은 escape 후에도 MathJax 가 제대로 읽는다. -->
        <span style="color:var(--red,#FF6B6B);">내 답 ${escapeHtml(it.userAns || '-')}</span>
        <span style="color:var(--text3);margin:0 6px;">|</span>
        <span style="color:var(--green,#34C759);">정답 ${escapeHtml(it.answer || '')}</span>
      </div>
    </div>`).join('');
  box.innerHTML = `<h3>❌ 틀린 문제 ${wrong.length}개</h3>${html}
    <button class="btn-ghost" onclick="renderLevelTestResult()">결과로 돌아가기</button>`;
  renderMath(box);
};

window.renderLevelTestIntro = renderLevelTestIntro;
// ⭐ 틀린 문제 목록의 "결과로 돌아가기" 버튼이 onclick 으로 이걸 부른다.
//    script.js 는 type="module" 로 실려서 모듈 안의 함수는 전역이 아니다.
//    여기서 내보내지 않으면 버튼을 눌러도 아무 일도 일어나지 않는다.
window.renderLevelTestResult = renderLevelTestResult;

window.closeModal = closeModal;
window.saveSettings = saveSettings;
window.switchSettingsTab = switchSettingsTab;
window.switchChartTab = switchChartTab;
window.onUnitChartChange = onUnitChartChange;
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

// ============================================================
//  손글씨 답 입력
//
//  왜 만들었나
//    폰에서 1/3, √2 같은 답을 치는 게 불편하다.
//
//  어떻게 도나
//    캔버스에 쓴 글씨를 AI가 읽어서 "원래 있던 입력칸에 글자로 채워준다".
//    채점은 예전 그대로 입력칸의 글자를 코드가 비교한다.
//    → AI가 채점에 끼어들지 않는다. 예전에 고친 구조가 그대로 유지된다.
//    → 읽은 결과가 입력칸에 보이므로, 잘못 읽었으면 학생이 직접 고칠 수 있다.
//
//  왜 주관식에만 붙이나
//    객관식은 ①~⑤ 버튼이 이미 편하고 AI를 거칠 이유가 없다.
//    그리고 입력 방식이 답의 형태(정수냐 분수냐)를 알려주면 안 되므로,
//    주관식에는 답이 무엇이든 항상 같은 UI를 붙인다.
// ============================================================

const HW_MAX_TOKENS = 256;  // 64 였더니 답이 잘려 나왔다. 짧은 답이라 비용 차이는 없다.
const HW_THINK      = 0;    // 판독에 추론은 필요 없다. 사고 토큰도 출력 요금이다.
const HW_HEIGHT     = 170;  // 캔버스 높이(px)
const HW_PAD        = 24;   // 글씨 둘레 여백(px)
const HW_OUT_MIN_H  = 420;  // 잘라낸 글씨를 최소 이 높이까지 키워서 보낸다

function hwPrompt() {
  return [
    '이미지에 손으로 쓴 수학 답이 하나 있다. 그 값을 그대로 읽어라.',
    '',
    '출력 규칙:',
    '- 값만 한 줄로 출력한다. 설명·풀이·단위·따옴표·마침표를 쓰지 마라.',
    '- 분수는 1/3 처럼 슬래시로 쓴다.',
    '- 루트는 sqrt(3) 처럼 쓴다. (√ 기호를 쓰지 마라)',
    '- 거듭제곱은 2^3 처럼 쓴다.',
    '- 계수가 붙은 루트는 2*sqrt(3) 처럼 곱셈 기호를 넣어 쓴다.',
    '- 전혀 알아볼 수 없을 때만 ? 한 글자를 출력한다.',
    '',
    '예시:',
    '  2√3  →  2*sqrt(3)',
    '  √5   →  sqrt(5)',
    '  ⅓ 또는 1/3  →  1/3',
    '  2³   →  2^3',
    '  -7   →  -7',
  ].join('\n');
}

// AI가 sqrt(3) 로 돌려준 것을 사람이 보는 표기로 바꾼다.
// √ 를 직접 쓰게 하면 판독이 불안정해서, 받을 때는 아스키로 받고 여기서 변환한다.
function hwNormalize(s) {
  // 판독 결과에 섞여 오는 유니코드 변형(⁄ − ½ …)을 입력칸에 넣기 전에 맞춘다.
  // 입력칸에 보이는 글자와 채점이 읽는 글자가 어긋나지 않게 하려는 것.
  let t = unifySymbols(s).replace(/[`"'\n\r]/g, '').trim();
  t = t.replace(/(\d)\s*\*\s*sqrt\s*\(\s*([^)]+?)\s*\)/gi, '$1√$2');  // 2*sqrt(3) → 2√3
  t = t.replace(/sqrt\s*\(\s*([^)]+?)\s*\)/gi, '√$1');                 // sqrt(3)   → √3
  t = t.replace(/(\d)\s*\*\s*√/g, '$1√');                              // 2*√3      → 2√3
  t = t.replace(/\s+/g, '');
  t = t.replace(/^\(([^()]*)\)$/, '$1');   // (2/3) → 2/3  학생 눈에 괄호가 거슬리지 않게
  return t;
}

// 입력칸 하나에 손글씨 UI를 붙인다. 이미 붙어 있으면 아무것도 하지 않는다.
// mountAfter: UI를 어느 요소 뒤에 넣을지. 입력칸이 flex 줄 안에 있으면
//             그 줄 전체를 넘겨야 버튼 옆으로 끼어들지 않는다.
function attachHandwriting(input, mountAfter) {
  if (!input || input.dataset.hwOn === '1') return;
  input.dataset.hwOn = '1';

  const box = document.createElement('div');
  box.className = 'hw-box';
  box.innerHTML = `
    <div class="hw-tabs">
      <button type="button" class="hw-tab is-on" data-m="key">⌨️ 직접 입력</button>
      <button type="button" class="hw-tab" data-m="pen">✏️ 손글씨</button>
    </div>
    <div class="hw-pad hidden">
      <canvas class="hw-canvas"></canvas>
      <div class="hw-actions">
        <button type="button" class="hw-btn hw-undo">되돌리기</button>
        <button type="button" class="hw-btn hw-clear">지우기</button>
        <button type="button" class="hw-btn hw-read">읽기</button>
      </div>
      <div class="hw-msg"></div>
    </div>`;
  (mountAfter || input).insertAdjacentElement('afterend', box);
  input._hwBox = box;   // 숨길 때 찾기 위해 참조를 들고 있는다 (형제 탐색은 깨지기 쉽다)

  const pad    = box.querySelector('.hw-pad');
  const canvas = box.querySelector('.hw-canvas');
  const msg    = box.querySelector('.hw-msg');
  const ctx    = canvas.getContext('2d');

  // 획을 배열로 들고 있어야 되돌리기가 된다
  let strokes = [];
  let cur = null;

  function fitCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || box.clientWidth || 300;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(HW_HEIGHT * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function redraw() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#111111';   // 진한 검정이 판독에 유리하다
    ctx.lineWidth = 3.4;           // 선이 가늘면 축소·압축에서 끊어져 보인다
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach((s) => {
      if (s.length < 2) {
        if (s.length === 1) {   // 점 하나만 찍은 경우도 보이게
          ctx.beginPath(); ctx.arc(s[0].x, s[0].y, 1.4, 0, Math.PI * 2); ctx.fill();
        }
        return;
      }
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
      ctx.stroke();
    });
  }

  // 글씨가 실제로 차지한 사각형 (CSS 픽셀 기준). 둘레 여백을 잘라내기 위해 쓴다.
  function inkBounds() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    strokes.forEach((s) => s.forEach((p) => {
      if (p.x < x1) x1 = p.x;
      if (p.y < y1) y1 = p.y;
      if (p.x > x2) x2 = p.x;
      if (p.y > y2) y2 = p.y;
    }));
    if (!isFinite(x1)) return { x1: 0, y1: 0, x2: w, y2: h };
    x1 = Math.max(0, x1 - HW_PAD); y1 = Math.max(0, y1 - HW_PAD);
    x2 = Math.min(w, x2 + HW_PAD); y2 = Math.min(h, y2 + HW_PAD);
    // "1" 처럼 한 획만 그으면 폭이 거의 0이 된다. 최소 크기를 보장한다.
    if (x2 - x1 < 48) { const c = (x1 + x2) / 2; x1 = Math.max(0, c - 24); x2 = Math.min(w, c + 24); }
    if (y2 - y1 < 48) { const c = (y1 + y2) / 2; y1 = Math.max(0, c - 24); y2 = Math.min(h, c + 24); }
    return { x1, y1, x2, y2 };
  }

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // Pointer Events 하나로 마우스·손가락·애플펜슬을 모두 받는다
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    cur = [pos(e)];
    strokes.push(cur);
    msg.textContent = '';
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur) return;
    e.preventDefault();
    cur.push(pos(e));
    redraw();
  });
  const endStroke = () => { cur = null; };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  canvas.addEventListener('pointerleave', endStroke);

  box.querySelector('.hw-undo').onclick  = () => { strokes.pop(); redraw(); };
  box.querySelector('.hw-clear').onclick = () => { strokes = []; redraw(); msg.textContent = ''; };

  // 탭 전환
  box.querySelectorAll('.hw-tab').forEach((t) => {
    t.onclick = () => {
      box.querySelectorAll('.hw-tab').forEach((x) => x.classList.remove('is-on'));
      t.classList.add('is-on');
      const pen = t.dataset.m === 'pen';
      pad.classList.toggle('hidden', !pen);
      if (pen) requestAnimationFrame(fitCanvas);
    };
  });

  // 읽기
  box.querySelector('.hw-read').onclick = async (e) => {
    if (strokes.length === 0) { msg.textContent = '먼저 답을 써주세요.'; return; }
    const btn = e.currentTarget;
    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = '읽는 중...';
    msg.textContent = '';

    try {
      // ── 글씨 부분만 잘라서 크게 보낸다 ──────────────────────
      // 이게 판독 정확도에 제일 크게 작용한다.
      // 캔버스 전체를 보내면 흰 여백이 대부분이라, AI가 이미지를 타일로 볼 때
      // 글씨가 아주 작게 들어간다. 2√3 을 2 로 읽었던 원인이 이것이다.
      const b = inkBounds();
      const sw = b.x2 - b.x1, sh = b.y2 - b.y1;
      const scale = Math.max(1, HW_OUT_MIN_H / sh);   // 작으면 키워서 보낸다
      const out = document.createElement('canvas');
      out.width  = Math.round(sw * scale);
      out.height = Math.round(sh * scale);
      const octx = out.getContext('2d');
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, out.width, out.height);
      octx.imageSmoothingQuality = 'high';
      // 주의: drawImage 의 원본 좌표는 캔버스 "실제 픽셀" 기준이다.
      //       획 좌표는 CSS 픽셀로 저장했으므로 dpr 을 곱해야 한다.
      const dpr = window.devicePixelRatio || 1;
      octx.drawImage(canvas, b.x1 * dpr, b.y1 * dpr, sw * dpr, sh * dpr, 0, 0, out.width, out.height);

      // PNG 로 보낸다. JPEG 는 가는 선 둘레에 번짐을 만들어 판독을 방해한다.
      // 선 그림이라 PNG 가 오히려 더 작다.
      const b64 = out.toDataURL('image/png').split(',')[1];
      console.log(`[손글씨] ${Math.round(sw)}×${Math.round(sh)} → ${out.width}×${out.height}, ` +
        `${Math.round(b64.length * 0.75 / 1024)}KB`);

      const res = await aiFetch({
        contents: [{ parts: [
          { text: hwPrompt() },
          { inline_data: { mime_type: 'image/png', data: b64 } },
        ] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: HW_MAX_TOKENS,
          thinkingConfig: { thinkingBudget: HW_THINK },
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `판독 실패 (${res.status})`);

      const cand = data.candidates?.[0];
      const parts = cand?.content?.parts || [];
      const raw = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join('');
      const read = hwNormalize(raw);

      if (cand?.finishReason === 'MAX_TOKENS') {
        console.warn('[손글씨] 출력이 토큰 한도로 잘렸습니다. HW_MAX_TOKENS 를 늘리세요.');
      }
      if (!read || read === '?') {
        msg.textContent = '글씨를 알아보지 못했어요. 더 크고 또박또박 써보거나 직접 입력해 주세요.';
        return;
      }
      input.value = read;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      msg.innerHTML = `<span class="hw-ok">입력칸에 "${read}" 로 넣었어요. 다르면 직접 고치세요.</span>`;
    } catch (err) {
      msg.textContent = '판독 실패: ' + err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  };

  window.addEventListener('resize', () => { if (!pad.classList.contains('hidden')) fitCanvas(); });
}

// 화면에 있는 주관식 입력칸 전부에 붙인다. 렌더 후에 호출한다.
function attachHandwritingAll() {
  ['#basicAns', '#intensiveAns'].forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) attachHandwriting(el);
  });
  document.querySelectorAll('.multi-ans-input').forEach(attachHandwriting);
}

// 객관식일 때는 입력칸과 함께 손글씨 UI도 숨긴다 (입력 방식이 답 형태를 알리지 않도록)
function setAnswerInputVisible(input, visible) {
  if (!input) return;
  input.style.display = visible ? '' : 'none';
  if (input._hwBox) input._hwBox.classList.toggle('hidden', !visible);
}


// ============================================================
//  문제 신고 ("이 문제 이상해요")
//
//  왜 필요한가
//    문제를 AI가 만들고 AI가 검증한다. 두 검증기가 같은 착각을 하면
//    불량 문제가 통과한다 — 그게 이 구조에 남은 유일한 구멍이다.
//    그 구멍이 실제로 얼마나 되는지는 "사람이 걸러낸 수"로만 잴 수 있다.
//    이 버튼이 그 측정 장치다.
//
//  어디에 쌓이나
//    users/{uid}/reports/{자동ID}
//    기존 보안 규칙(users/{userId}/{document=**})이 그대로 덮으므로
//    규칙을 새로 쓸 필요가 없다. 모아 보는 건 reports.js 로 한다.
// ============================================================

const REPORT_REASONS = [
  '보기에 답이 없어요',
  '조건이 모순이에요',
  '문제가 잘렸어요',
  '정답이 틀린 것 같아요',
  '해설이 이상해요',
  '기타',
];

// 신고 버튼 + 패널을 container 안에 붙인다.
// getCtx() 는 신고 시점에 문제 정보를 돌려주는 함수다.
function attachReportButton(container, getCtx) {
  if (!container || container.dataset.rpOn === '1') return;
  container.dataset.rpOn = '1';

  const wrap = document.createElement('div');
  wrap.className = 'rp-wrap';
  wrap.innerHTML = `
    <button type="button" class="rp-open">🚩 이 문제 이상해요</button>
    <div class="rp-panel hidden">
      <div class="rp-title">어디가 이상한가요?</div>
      <div class="rp-chips">
        ${REPORT_REASONS.map((r) => `<button type="button" class="rp-chip">${r}</button>`).join('')}
      </div>
      <textarea class="rp-memo" rows="2" placeholder="자세히 적어주면 고치는 데 큰 도움이 돼요 (선택)"></textarea>
      <div class="rp-actions">
        <button type="button" class="rp-cancel">취소</button>
        <button type="button" class="rp-send">보내기</button>
      </div>
      <div class="rp-msg"></div>
    </div>`;
  container.appendChild(wrap);

  const panel = wrap.querySelector('.rp-panel');
  const memo  = wrap.querySelector('.rp-memo');
  const msg   = wrap.querySelector('.rp-msg');
  let picked = '';

  wrap.querySelector('.rp-open').onclick = () => {
    panel.classList.toggle('hidden');
    msg.textContent = '';
  };
  wrap.querySelector('.rp-cancel').onclick = () => {
    panel.classList.add('hidden');
  };
  wrap.querySelectorAll('.rp-chip').forEach((c) => {
    c.onclick = () => {
      wrap.querySelectorAll('.rp-chip').forEach((x) => x.classList.remove('is-on'));
      c.classList.add('is-on');
      picked = c.textContent;
      msg.textContent = '';
    };
  });

  wrap.querySelector('.rp-send').onclick = async (e) => {
    if (!picked) { msg.textContent = '어디가 이상한지 하나만 골라주세요.'; return; }
    const u = auth.currentUser;
    if (!u) { msg.textContent = '로그인이 필요해요.'; return; }

    const btn = e.currentTarget;
    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = '보내는 중...';

    try {
      const ctx = (typeof getCtx === 'function' ? getCtx() : {}) || {};
      await addDoc(collection(db, 'users', u.uid, 'reports'), {
        reason: picked,
        memo: (memo.value || '').slice(0, 500),
        problem: String(ctx.problem || '').slice(0, 2000),
        answer: String(ctx.answer || '').slice(0, 200),
        studentAnswer: String(ctx.studentAnswer || '').slice(0, 200),
        type: String(ctx.type || ''),
        level: String(ctx.level || ''),
        source: String(ctx.source || ''),   // 은행에서 나온 문제인지 라이브 생성인지
        page: location.pathname,
        at: serverTimestamp(),
      });
      panel.classList.add('hidden');
      wrap.querySelector('.rp-open').textContent = '✅ 신고 접수됐어요';
      wrap.querySelector('.rp-open').disabled = true;
      memo.value = '';
    } catch (err) {
      msg.textContent = '신고를 보내지 못했어요: ' + err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  };
}

// 수능 모드 카드마다 신고 버튼을 붙인다. 카드에 문제 정보가 data- 로 들어 있다.
function attachReportToCards(wrap) {
  if (!wrap) return;
  wrap.querySelectorAll('.multi-problem-card').forEach((card) => {
    const area = card.querySelector('.multi-answer-area') || card;
    attachReportButton(area, () => ({
      problem: decodeURIComponent(card.dataset.problem || ''),
      answer: card.dataset.answer || '',
      studentAnswer: card.querySelector('.multi-ans-input')?.value
        || card.querySelector('.choice-btn.selected')?.textContent || '',
      type: card.dataset.type || '',
      level: card.dataset.level || '',
      source: card.dataset.source || '',
    }));
  });
}

// 새 문제를 띄울 때 신고 버튼을 원래 상태로 되돌린다 (앞 문제에서 신고했으면 꺼져 있다)
function resetReport(container) {
  const b = container?.querySelector('.rp-open');
  if (b) { b.disabled = false; b.textContent = '🚩 이 문제 이상해요'; }
  container?.querySelector('.rp-panel')?.classList.add('hidden');
  container?.querySelectorAll('.rp-chip').forEach((c) => c.classList.remove('is-on'));
}