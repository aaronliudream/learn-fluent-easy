/* ============================================================
 * 英语小冒险·一年级 · 共享引擎
 * - SRS 间隔重复算法
 * - 进度追踪 + localStorage 持久化
 * - TTS 朗读
 * - 通用 UI 工具（撒星星 / 反馈条 / 朗读按钮）
 * ============================================================ */

// ============================================================
// 进度数据库（所有模块共享）
// localStorage key: 'eg1.v1'
// ============================================================
const PROGRESS_KEY = 'eg1.v1';

const DEFAULT_PROGRESS = {
  // 每个 word/sentence/letter/phonics 的状态
  // key 格式: 'w001', 's01', 'L_A', 'p01'
  items: {},      // { 'w001': { correct: 3, wrong: 0, lastSeen: timestamp, nextDue: timestamp, level: 2 } }
  // 全局统计
  totalScore: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  // 学习时长（毫秒）
  totalMinutes: 0,
  // 每日打卡
  days: {},       // { '2026-05-05': { score: 100, correct: 8, total: 10, minutes: 5 } }
  // 启动时间（用于计算时长）
  startedAt: null,
  // 当前用户名（多个孩子时分别保存）
  currentUser: 'default',
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
    const data = JSON.parse(raw);
    // 兼容性：旧数据补齐缺字段
    return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_PROGRESS)), data);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  }
}

function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch (e) {
    console.warn('saveProgress failed', e);
  }
}

// 重置（家长报告里有"清除数据"按钮）
function resetProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

// ============================================================
// SRS 算法（简化版 SuperMemo / Anki）
//   level 0: 还没学 / 答错重置
//   level 1: 答对 1 次 → 1 天后再考
//   level 2: 答对 2 次 → 3 天后
//   level 3: 答对 3 次 → 7 天后  ← "已掌握"门槛
//   level 4: 答对 4 次 → 14 天后
//   level 5: 答对 5+ 次 → 30 天后（彻底记住）
// ============================================================
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30]; // 天数

function srsUpdate(itemId, correct) {
  const p = loadProgress();
  const now = Date.now();
  let it = p.items[itemId];
  if (!it) it = { correct: 0, wrong: 0, lastSeen: 0, nextDue: 0, level: 0 };

  it.lastSeen = now;
  if (correct) {
    it.correct++;
    // 升级一级，封顶 5
    it.level = Math.min(5, it.level + 1);
  } else {
    it.wrong++;
    // 答错回退（不归零，保留一点历史）
    it.level = Math.max(0, it.level - 1);
  }

  // 计算下次到期时间
  const days = SRS_INTERVALS[it.level] || 0;
  it.nextDue = now + days * 24 * 60 * 60 * 1000;
  p.items[itemId] = it;
  saveProgress(p);
  return it;
}

// 返回某个 itemId 的状态：'new' | 'learning' | 'mastered'
function srsStatus(itemId) {
  const p = loadProgress();
  const it = p.items[itemId];
  if (!it || it.level === 0) return 'new';
  if (it.level >= 3) return 'mastered';
  return 'learning';
}

// 拿出"今天该复习的"item id 列表（nextDue <= now）
function srsDueItems(allIds) {
  const p = loadProgress();
  const now = Date.now();
  return allIds.filter(id => {
    const it = p.items[id];
    if (!it) return false;        // 没学过的不算"该复习"
    if (it.level >= 3) return false; // 已掌握的暂时跳过（除非长期不复习）
    return it.nextDue <= now;
  });
}

// 拿出"还没学过"的 item id 列表
function srsNewItems(allIds) {
  const p = loadProgress();
  return allIds.filter(id => !p.items[id] || p.items[id].level === 0);
}

// ============================================================
// 出题策略：智能从词库挑 N 个
// 优先级：到期复习 > 学习中（level 1-2）> 全新
// ============================================================
function pickQuestions(allItems, n, idKey = 'id') {
  const allIds = allItems.map(it => it[idKey]);
  const due = srsDueItems(allIds);
  const newOnes = srsNewItems(allIds);

  // 学习中但还没到期的（用作填充）
  const p = loadProgress();
  const learning = allIds.filter(id => {
    const it = p.items[id];
    return it && it.level >= 1 && it.level < 3;
  });

  // 组合：先到期复习，再新词，再学习中
  const ordered = [...due, ...newOnes, ...learning];

  // 去重保序
  const seen = new Set();
  const dedup = ordered.filter(id => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // 取前 n 个 + 打乱顺序
  const picked = dedup.slice(0, n);
  shuffle(picked);

  // 转回完整对象
  return picked.map(id => allItems.find(it => it[idKey] === id)).filter(Boolean);
}

// ============================================================
// 工具函数
// ============================================================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(arr, n) {
  return shuffle(arr.slice()).slice(0, n);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 记录答题（计分 + 当日统计 + SRS 更新）
function recordAnswer(itemId, isCorrect, scorePts = 10) {
  const p = loadProgress();
  p.totalAnswered++;
  if (isCorrect) {
    p.totalCorrect++;
    p.totalScore += scorePts;
  }

  // 当日打卡
  const day = todayStr();
  if (!p.days[day]) p.days[day] = { score: 0, correct: 0, total: 0, minutes: 0 };
  p.days[day].total++;
  if (isCorrect) {
    p.days[day].correct++;
    p.days[day].score += scorePts;
  }

  saveProgress(p);

  // 更新 SRS 状态
  if (itemId) srsUpdate(itemId, isCorrect);
}

// 启动学习计时（页面加载时调）
function startSession() {
  const p = loadProgress();
  p.startedAt = Date.now();
  saveProgress(p);
}

// 结束学习计时（页面卸载时调）
function endSession() {
  const p = loadProgress();
  if (!p.startedAt) return;
  const elapsed = Date.now() - p.startedAt;
  const day = todayStr();
  if (!p.days[day]) p.days[day] = { score: 0, correct: 0, total: 0, minutes: 0 };
  p.days[day].minutes += elapsed / 60000;
  p.totalMinutes += elapsed / 60000;
  p.startedAt = null;
  saveProgress(p);
}

// 拿出错过 N 次的 item（薄弱点）
function getWeakItems(threshold = 2) {
  const p = loadProgress();
  return Object.entries(p.items)
    .filter(([_, it]) => it.wrong >= threshold)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .map(([id, it]) => ({ id, ...it }));
}

// ============================================================
// TTS 朗读
// ============================================================
let _voicesReady = false;
function _initVoices() {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => { _voicesReady = true; };
}
_initVoices();

function speak(text, opts = {}) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = opts.rate || 0.85;
  u.pitch = opts.pitch || 1.1;
  const voices = speechSynthesis.getVoices();
  const prefer = voices.find(v =>
    /samantha|aria|jenny|google.*us|natural|premium/i.test(v.name) &&
    /^en/i.test(v.lang)
  );
  if (prefer) u.voice = prefer;
  speechSynthesis.speak(u);
}

// ============================================================
// 通用 UI 工具
// ============================================================
function $(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstChild;
}

function showFeedback(isRight) {
  const right = ['太棒了!', '答对了!', '真厉害!', '继续加油!', '好样的!'];
  const wrong = ['再想想~', '差一点!', '没关系!', '加油!'];
  const list = isRight ? right : wrong;
  const msg = list[Math.floor(Math.random() * list.length)];
  const el = $(`<div class="feedback ${isRight ? 'right' : 'wrong'}">${msg}</div>`);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function burstStars(x, y) {
  const burst = $(`<div class="star-burst" style="top:${y}px;left:${x}px;"></div>`);
  document.body.appendChild(burst);
  const stars = ['⭐', '✨', '🌟', '💫'];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 80 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const star = $(`<div class="star" style="--dx:${dx}px;--dy:${dy}px;">${stars[i % stars.length]}</div>`);
    burst.appendChild(star);
  }
  setTimeout(() => burst.remove(), 800);
}

// 页面加载/卸载自动管理 session
window.addEventListener('load', startSession);
window.addEventListener('beforeunload', endSession);
window.addEventListener('pagehide', endSession);

// 全局暴露
window.eg1 = {
  loadProgress, saveProgress, resetProgress,
  srsUpdate, srsStatus, srsDueItems, srsNewItems,
  pickQuestions, recordAnswer, getWeakItems,
  shuffle, pickRandom, todayStr,
  speak, $, showFeedback, burstStars,
};
