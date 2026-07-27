"use strict";

const MANIFEST_URL = "./manifest.json";
const STATE_KEY = "circuit-mos-study-v1";
const LANGUAGE_KEY = "circuit-mos-language";
const EXPORT_SCHEMA = "circuit-mos-result-v1";

const translations = {
  zh: {
    pageTitle: "电路原理图视觉质量评价",
    metaDescription: "匿名电路原理图视觉质量 MOS 评价",
    languageLabel: "界面语言",
    siteTitle: "电路原理图视觉质量评价",
    anonymousStudy: "匿名评测",
    researchBrief: "研究说明",
    introTitle: "请只评价图面的美观与可读性",
    introBody: "每个案例包含若干张匿名电路图。请忽略电气功能是否正确，仅根据布局清晰度、连线整洁度、间距与对齐、文字可读性及整体视觉平衡给出 1–5 分。",
    ratingGuideLabel: "评分标准",
    score1Label: "很差",
    score1Help: "严重拥挤、重叠或难以阅读",
    score2Label: "较差",
    score2Help: "明显杂乱，阅读负担较大",
    score3Label: "一般",
    score3Help: "基本可读，但布局仍可改进",
    score4Label: "较好",
    score4Help: "清晰整洁，视觉组织良好",
    score5Label: "优秀",
    score5Help: "布局均衡、连线清楚且易读",
    blindRuleTitle: "盲评规则：",
    blindRuleBody: "图片来源不会显示；案例顺序与同一案例中的图片顺序均会随机化。图片缺失时不会显示，也不会计入评分。",
    participantLabel: "受试者编号",
    optional: "可选",
    participantPlaceholder: "如 P017；请勿填写姓名",
    expertiseLabel: "相关经验",
    expertiseChoose: "请选择",
    expertiseNovice: "无模拟电路设计经验",
    expertiseStudent: "电子/集成电路相关学生",
    expertiseResearcher: "相关研究人员",
    expertiseEngineer: "模拟/集成电路工程师",
    expertiseOther: "其他相关背景",
    sessionSizeLabel: "本次评价案例数",
    session10: "10 个案例（约 12–18 分钟）",
    session20: "20 个案例（约 25–35 分钟）",
    session40: "全部 40 个案例（约 45–60 分钟）",
    consentText: "我理解评分标准，并同意匿名结果用于学术统计。",
    startButton: "开始匿名评价",
    resumeButton: "继续上次进度",
    resumeCompleted: "查看已完成结果",
    resumeProgress: "继续上次进度（{current}/{total}）",
    anonymousCase: "匿名案例",
    caseTitle: "案例 {number}",
    studyReminder: "评价视觉呈现，不评价电路功能。点击图片可放大查看。",
    backButton: "上一案例",
    nextButton: "下一案例",
    finishButton: "完成评价",
    incompleteHint: "请为本案例中的每张可用图片评分。",
    completeHint: "本案例已完成，可以继续。",
    candidateTitle: "候选 {letter}",
    sourceHidden: "来源已隐藏",
    enlargeCandidate: "放大候选 {letter}",
    candidateAlt: "匿名电路图候选 {letter}",
    ratingLabel: "整体视觉质量评分",
    ratingGroup: "1 到 5 分",
    scoreAria: "{score} 分",
    skip: "无法判断 / 图片异常",
    skipActive: "已标记无法判断（点击撤销）",
    imageLoadError: "图片加载失败，本项已自动排除。",
    completionKicker: "评价完成",
    completionTitle: "感谢你的参与",
    completionBody: "结果仅保存在当前浏览器中。请下载 JSON 文件并发送给研究组织者。文件只包含匿名编号、随机顺序、评分与用时，不包含图片来源名称。",
    ratedCases: "已评价案例",
    validRatings: "有效图片评分",
    recordedMinutes: "记录用时（分钟）",
    excludedNotice: "另有 {count} 项标记为无法判断，将不计入 MOS。",
    downloadButton: "下载评价结果 JSON",
    restartButton: "清除并重新开始",
    downloadSuccess: "JSON 已下载。请将该文件发送给研究组织者。",
    resetConfirm: "确定清除当前评价进度并重新开始吗？此操作无法撤销。",
    loadFailure: "评测数据加载失败",
    footerText: "匿名 MOS 研究 · 评分不会自动上传",
    closeImage: "关闭大图",
    enlargedImageAlt: "放大的匿名电路图",
  },
  en: {
    pageTitle: "Circuit Schematic Visual Quality Evaluation",
    metaDescription: "Anonymous MOS evaluation of circuit schematic visual quality",
    languageLabel: "Interface language",
    siteTitle: "Circuit Schematic Visual Quality Evaluation",
    anonymousStudy: "Anonymous study",
    researchBrief: "Study brief",
    introTitle: "Rate visual quality and readability only",
    introBody: "Each case contains several anonymous circuit schematics. Ignore whether the circuit is electrically correct. Assign a score from 1 to 5 based only on layout clarity, wiring neatness, spacing and alignment, label readability, and overall visual balance.",
    ratingGuideLabel: "Rating scale",
    score1Label: "Very poor",
    score1Help: "Severely crowded, overlapping, or difficult to read",
    score2Label: "Poor",
    score2Help: "Clearly cluttered and demanding to read",
    score3Label: "Fair",
    score3Help: "Readable overall, but the layout could be improved",
    score4Label: "Good",
    score4Help: "Clear, tidy, and visually well organized",
    score5Label: "Excellent",
    score5Help: "Balanced layout with clear wiring and high readability",
    blindRuleTitle: "Blind-review rule:",
    blindRuleBody: "Image sources are hidden. Both case order and candidate order within each case are randomized. Missing images are not displayed or included in the score.",
    participantLabel: "Participant code",
    optional: "optional",
    participantPlaceholder: "e.g. P017; do not enter your name",
    expertiseLabel: "Relevant experience",
    expertiseChoose: "Please select",
    expertiseNovice: "No analog circuit design experience",
    expertiseStudent: "Electronics / integrated-circuit student",
    expertiseResearcher: "Researcher in a related field",
    expertiseEngineer: "Analog / integrated-circuit engineer",
    expertiseOther: "Other relevant background",
    sessionSizeLabel: "Number of cases in this session",
    session10: "10 cases (about 12–18 minutes)",
    session20: "20 cases (about 25–35 minutes)",
    session40: "All 40 cases (about 45–60 minutes)",
    consentText: "I understand the rating criteria and consent to anonymous results being used for academic analysis.",
    startButton: "Start anonymous evaluation",
    resumeButton: "Resume previous session",
    resumeCompleted: "View completed results",
    resumeProgress: "Resume previous session ({current}/{total})",
    anonymousCase: "Anonymous case",
    caseTitle: "Case {number}",
    studyReminder: "Rate visual presentation, not circuit function. Click an image to enlarge it.",
    backButton: "Previous case",
    nextButton: "Next case",
    finishButton: "Finish evaluation",
    incompleteHint: "Please rate every available image in this case.",
    completeHint: "This case is complete. You may continue.",
    candidateTitle: "Candidate {letter}",
    sourceHidden: "Source hidden",
    enlargeCandidate: "Enlarge candidate {letter}",
    candidateAlt: "Anonymous circuit schematic candidate {letter}",
    ratingLabel: "Overall visual quality",
    ratingGroup: "Scores from 1 to 5",
    scoreAria: "Score {score}",
    skip: "Cannot judge / image issue",
    skipActive: "Marked cannot judge (click to undo)",
    imageLoadError: "The image failed to load and has been excluded automatically.",
    completionKicker: "Evaluation complete",
    completionTitle: "Thank you for participating",
    completionBody: "Results remain in this browser only. Download the JSON file and send it to the study organizer. The file contains only an anonymous ID, randomized presentation order, scores, and timing; it does not contain source names.",
    ratedCases: "Cases evaluated",
    validRatings: "Valid image ratings",
    recordedMinutes: "Recorded time (minutes)",
    excludedNotice: "{count} additional item(s) were marked cannot judge and will not be included in the MOS.",
    downloadButton: "Download evaluation JSON",
    restartButton: "Clear and restart",
    downloadSuccess: "JSON downloaded. Please send the file to the study organizer.",
    resetConfirm: "Clear the current evaluation and start over? This action cannot be undone.",
    loadFailure: "Evaluation data failed to load",
    footerText: "Anonymous MOS study · No score is uploaded automatically",
    closeImage: "Close enlarged image",
    enlargedImageAlt: "Enlarged anonymous circuit schematic",
  },
};

let currentLanguage =
  localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "zh";

const els = {
  intro: document.querySelector("#introView"),
  study: document.querySelector("#studyView"),
  completion: document.querySelector("#completionView"),
  setupForm: document.querySelector("#setupForm"),
  participantCode: document.querySelector("#participantCode"),
  expertise: document.querySelector("#expertise"),
  sessionSize: document.querySelector("#sessionSize"),
  consent: document.querySelector("#consent"),
  start: document.querySelector("#startButton"),
  resume: document.querySelector("#resumeButton"),
  headerStatus: document.querySelector("#headerStatus"),
  caseTitle: document.querySelector("#caseTitle"),
  progressText: document.querySelector("#progressText"),
  progressFill: document.querySelector("#progressFill"),
  grid: document.querySelector("#candidateGrid"),
  back: document.querySelector("#backButton"),
  next: document.querySelector("#nextButton"),
  hint: document.querySelector("#completionHint"),
  completionStats: document.querySelector("#completionStats"),
  download: document.querySelector("#downloadButton"),
  restart: document.querySelector("#restartButton"),
  downloadStatus: document.querySelector("#downloadStatus"),
  dialog: document.querySelector("#imageDialog"),
  dialogImage: document.querySelector("#dialogImage"),
  dialogClose: document.querySelector("#dialogClose"),
  metaDescription: document.querySelector("#metaDescription"),
  languageButtons: document.querySelectorAll("[data-language]"),
};

let manifest;
let state;
let caseOpenedAt = 0;

function t(key, variables = {}) {
  let value = translations[currentLanguage][key] ?? translations.zh[key] ?? key;
  Object.entries(variables).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-CN";
  document.title = t("pageTitle");
  els.metaDescription.content = t("metaDescription");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.alt = t(element.dataset.i18nAlt);
  });
  els.languageButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.language === currentLanguage),
    );
  });
}

function updateResumeLabel() {
  if (!state) return;
  els.resume.textContent = state.session.completedAt
    ? t("resumeCompleted")
    : t("resumeProgress", {
        current: state.currentIndex + 1,
        total: state.caseOrder.length,
      });
}

function setLanguage(language) {
  if (!translations[language] || language === currentLanguage) return;
  if (state && !els.study.classList.contains("hidden")) {
    recordCaseDuration();
    saveState();
  }
  currentLanguage = language;
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  applyStaticTranslations();
  updateResumeLabel();
  if (!state) {
    updateHeader();
  } else if (!els.study.classList.contains("hidden")) {
    renderCase();
  } else if (!els.completion.classList.contains("hidden")) {
    renderCompletion();
  } else {
    updateHeader();
  }
}

function makeParticipantId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `P-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function makeSeed() {
  const values = new Uint32Array(2);
  crypto.getRandomValues(values);
  return `${values[0].toString(16)}${values[1].toString(16)}`;
}

function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY));
    if (!parsed || parsed.manifestVersion !== manifest.version) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getCase(caseId) {
  return manifest.cases.find((item) => item.id === caseId);
}

function getCurrentCase() {
  return getCase(state.caseOrder[state.currentIndex]);
}

function candidateResponse(caseId, imageId) {
  state.responses[caseId] ??= {};
  state.responses[caseId][imageId] ??= {
    score: null,
    excludedReason: null,
  };
  return state.responses[caseId][imageId];
}

function createSession() {
  const seed = makeSeed();
  const random = mulberry32(hashSeed(seed));
  const requested = Math.min(
    Number.parseInt(els.sessionSize.value, 10),
    manifest.cases.length,
  );
  const caseOrder = shuffle(
    manifest.cases.map((item) => item.id),
    random,
  ).slice(0, requested);
  const imageOrders = {};

  caseOrder.forEach((caseId) => {
    const imageIds = getCase(caseId).images.map((image) => image.id);
    imageOrders[caseId] = shuffle(imageIds, random);
  });

  state = {
    schema: EXPORT_SCHEMA,
    manifestVersion: manifest.version,
    participant: {
      id: makeParticipantId(),
      organizerCode: els.participantCode.value.trim() || null,
      expertise: els.expertise.value,
    },
    session: {
      seed,
      requestedCases: requested,
      startedAt: new Date().toISOString(),
      completedAt: null,
    },
    caseOrder,
    imageOrders,
    responses: {},
    caseDurationsMs: {},
    currentIndex: 0,
  };
  saveState();
}

function showView(view) {
  [els.intro, els.study, els.completion].forEach((element) => {
    element.classList.toggle("hidden", element !== view);
  });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateHeader() {
  if (!state) {
    els.headerStatus.textContent = t("anonymousStudy");
    return;
  }
  els.headerStatus.textContent =
    `${state.participant.id} · ${state.currentIndex + 1}/${state.caseOrder.length}`;
}

function currentCaseComplete() {
  const caseItem = getCurrentCase();
  return caseItem.images.every((image) => {
    const response = candidateResponse(caseItem.id, image.id);
    return Number.isInteger(response.score) || response.excludedReason;
  });
}

function updateNavigation() {
  const complete = currentCaseComplete();
  els.back.disabled = state.currentIndex === 0;
  els.next.disabled = !complete;
  els.next.textContent =
    state.currentIndex === state.caseOrder.length - 1
      ? t("finishButton")
      : t("nextButton");
  els.hint.textContent = complete
    ? t("completeHint")
    : t("incompleteHint");
  els.hint.style.color = complete ? "var(--green)" : "";
}

function setScore(caseId, imageId, score) {
  const response = candidateResponse(caseId, imageId);
  response.score = score;
  response.excludedReason = null;
  saveState();
  renderCase();
}

function toggleSkip(caseId, imageId) {
  const response = candidateResponse(caseId, imageId);
  if (response.excludedReason === "cannot_judge") {
    response.excludedReason = null;
  } else {
    response.score = null;
    response.excludedReason = "cannot_judge";
  }
  saveState();
  renderCase();
}

function markLoadError(caseId, imageId, card) {
  const response = candidateResponse(caseId, imageId);
  response.score = null;
  response.excludedReason = "load_error";
  const frame = card.querySelector(".image-frame");
  frame.replaceChildren();
  const error = document.createElement("p");
  error.className = "image-error";
  error.textContent = t("imageLoadError");
  frame.append(error);
  card.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  saveState();
  updateNavigation();
}

function renderCandidate(caseItem, image, displayIndex) {
  const response = candidateResponse(caseItem.id, image.id);
  const card = document.createElement("article");
  card.className = "candidate-card";
  card.dataset.imageId = image.id;

  const header = document.createElement("div");
  header.className = "candidate-header";
  const title = document.createElement("h3");
  const candidateLetter = String.fromCharCode(65 + displayIndex);
  title.textContent = t("candidateTitle", { letter: candidateLetter });
  const anonymous = document.createElement("span");
  anonymous.textContent = t("sourceHidden");
  header.append(title, anonymous);

  const frame = document.createElement("div");
  frame.className = "image-frame";
  frame.tabIndex = 0;
  frame.setAttribute("role", "button");
  frame.setAttribute(
    "aria-label",
    t("enlargeCandidate", { letter: candidateLetter }),
  );
  const img = document.createElement("img");
  img.src = image.src;
  img.alt = t("candidateAlt", { letter: candidateLetter });
  img.loading = "eager";
  img.addEventListener("error", () => {
    markLoadError(caseItem.id, image.id, card);
  });
  const openImage = () => {
    if (response.excludedReason === "load_error") return;
    els.dialogImage.src = image.src;
    els.dialogImage.alt = img.alt;
    els.dialog.showModal();
  };
  frame.addEventListener("click", openImage);
  frame.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImage();
    }
  });
  frame.append(img);

  const ratingBlock = document.createElement("div");
  ratingBlock.className = "rating-block";
  const ratingLabel = document.createElement("p");
  ratingLabel.className = "rating-label";
  ratingLabel.textContent = t("ratingLabel");
  const buttons = document.createElement("div");
  buttons.className = "rating-buttons";
  buttons.setAttribute("role", "group");
  buttons.setAttribute("aria-label", t("ratingGroup"));

  for (let score = 1; score <= 5; score += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "score-button";
    button.textContent = String(score);
    button.setAttribute("aria-label", t("scoreAria", { score }));
    button.setAttribute("aria-pressed", String(response.score === score));
    button.classList.toggle("selected", response.score === score);
    button.disabled = response.excludedReason === "load_error";
    button.addEventListener("click", () => {
      setScore(caseItem.id, image.id, score);
    });
    buttons.append(button);
  }

  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "skip-button";
  skip.textContent =
    response.excludedReason === "cannot_judge"
      ? t("skipActive")
      : t("skip");
  skip.classList.toggle(
    "active",
    response.excludedReason === "cannot_judge",
  );
  skip.disabled = response.excludedReason === "load_error";
  skip.addEventListener("click", () => {
    toggleSkip(caseItem.id, image.id);
  });

  ratingBlock.append(ratingLabel, buttons, skip);
  card.append(header, frame, ratingBlock);
  return card;
}

function renderCase() {
  showView(els.study);
  updateHeader();
  const caseItem = getCurrentCase();
  const imageOrder = state.imageOrders[caseItem.id];
  const imageById = new Map(caseItem.images.map((image) => [image.id, image]));

  els.caseTitle.textContent = t("caseTitle", {
    number: String(state.currentIndex + 1).padStart(2, "0"),
  });
  els.progressText.textContent =
    `${state.currentIndex + 1} / ${state.caseOrder.length}`;
  els.progressFill.style.width =
    `${((state.currentIndex + 1) / state.caseOrder.length) * 100}%`;
  els.grid.replaceChildren(
    ...imageOrder.map((imageId, index) =>
      renderCandidate(caseItem, imageById.get(imageId), index)),
  );
  updateNavigation();
  caseOpenedAt = performance.now();
}

function recordCaseDuration() {
  const caseId = state.caseOrder[state.currentIndex];
  const elapsed = Math.max(0, Math.round(performance.now() - caseOpenedAt));
  state.caseDurationsMs[caseId] =
    (state.caseDurationsMs[caseId] || 0) + elapsed;
}

function finishSession() {
  recordCaseDuration();
  state.session.completedAt = new Date().toISOString();
  saveState();
  renderCompletion();
}

function renderCompletion() {
  showView(els.completion);
  updateHeader();
  const rated = Object.values(state.responses)
    .flatMap((responses) => Object.values(responses))
    .filter((response) => Number.isInteger(response.score)).length;
  const excluded = Object.values(state.responses)
    .flatMap((responses) => Object.values(responses))
    .filter((response) => response.excludedReason).length;
  const totalMinutes = Math.max(
    1,
    Math.round(
      Object.values(state.caseDurationsMs).reduce((sum, ms) => sum + ms, 0)
      / 60000,
    ),
  );

  els.completionStats.innerHTML = `
    <div><strong>${state.caseOrder.length}</strong><span>${t("ratedCases")}</span></div>
    <div><strong>${rated}</strong><span>${t("validRatings")}</span></div>
    <div><strong>${totalMinutes}</strong><span>${t("recordedMinutes")}</span></div>
  `;
  if (excluded > 0) {
    els.downloadStatus.textContent = t("excludedNotice", { count: excluded });
  } else {
    els.downloadStatus.textContent = "";
  }
}

function exportPayload() {
  return {
    schema: EXPORT_SCHEMA,
    manifestVersion: state.manifestVersion,
    exportedAt: new Date().toISOString(),
    participant: state.participant,
    session: state.session,
    presentation: {
      caseOrder: state.caseOrder,
      imageOrders: state.imageOrders,
    },
    ratings: state.caseOrder.map((caseId, caseIndex) => ({
      caseId,
      displayOrder: caseIndex,
      durationMs: state.caseDurationsMs[caseId] || 0,
      candidates: state.imageOrders[caseId].map((imageId, imageIndex) => {
        const response = candidateResponse(caseId, imageId);
        return {
          imageId,
          displayOrder: imageIndex,
          score: response.score,
          excludedReason: response.excludedReason,
        };
      }),
    })),
  };
}

function downloadResult() {
  const payload = JSON.stringify(exportPayload(), null, 2);
  const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.href = url;
  link.download = `circuit-mos_${state.participant.id}_${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  els.downloadStatus.textContent = t("downloadSuccess");
}

function resetSession() {
  const confirmed = window.confirm(t("resetConfirm"));
  if (!confirmed) return;
  localStorage.removeItem(STATE_KEY);
  state = null;
  els.setupForm.reset();
  els.sessionSize.value = "40";
  els.resume.classList.add("hidden");
  updateHeader();
  showView(els.intro);
}

async function initialize() {
  applyStaticTranslations();
  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
    });
  });

  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
    manifest = await response.json();
    if (!Array.isArray(manifest.cases) || manifest.cases.length === 0) {
      throw new Error("Manifest contains no cases");
    }
  } catch (error) {
    els.start.disabled = true;
    els.start.textContent = t("loadFailure");
    console.error(error);
    return;
  }

  state = loadState();
  if (state) {
    els.resume.classList.remove("hidden");
    updateResumeLabel();
  }

  els.setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!els.setupForm.reportValidity()) return;
    createSession();
    renderCase();
  });

  els.resume.addEventListener("click", () => {
    if (state.session.completedAt) renderCompletion();
    else renderCase();
  });

  els.back.addEventListener("click", () => {
    if (state.currentIndex === 0) return;
    recordCaseDuration();
    state.currentIndex -= 1;
    saveState();
    renderCase();
  });

  els.next.addEventListener("click", () => {
    if (!currentCaseComplete()) return;
    if (state.currentIndex === state.caseOrder.length - 1) {
      finishSession();
      return;
    }
    recordCaseDuration();
    state.currentIndex += 1;
    saveState();
    renderCase();
  });

  els.download.addEventListener("click", downloadResult);
  els.restart.addEventListener("click", resetSession);
  els.dialogClose.addEventListener("click", () => els.dialog.close());
  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) els.dialog.close();
  });
}

initialize();
