"use strict";

const MANIFEST_URL = "./manifest.json";
const STATE_KEY = "circuit-mos-study-v1";
const EXPORT_SCHEMA = "circuit-mos-result-v1";

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
};

let manifest;
let state;
let caseOpenedAt = 0;

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
    els.headerStatus.textContent = "匿名评测";
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
      ? "完成评价"
      : "下一案例";
  els.hint.textContent = complete
    ? "本案例已完成，可以继续。"
    : "请为本案例中的每张可用图片评分。";
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
  error.textContent = "图片加载失败，本项已自动排除。";
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
  title.textContent = `候选 ${String.fromCharCode(65 + displayIndex)}`;
  const anonymous = document.createElement("span");
  anonymous.textContent = "来源已隐藏";
  header.append(title, anonymous);

  const frame = document.createElement("div");
  frame.className = "image-frame";
  frame.tabIndex = 0;
  frame.setAttribute("role", "button");
  frame.setAttribute("aria-label", `放大候选 ${String.fromCharCode(65 + displayIndex)}`);
  const img = document.createElement("img");
  img.src = image.src;
  img.alt = `匿名电路图候选 ${String.fromCharCode(65 + displayIndex)}`;
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
  ratingLabel.textContent = "整体视觉质量评分";
  const buttons = document.createElement("div");
  buttons.className = "rating-buttons";
  buttons.setAttribute("role", "group");
  buttons.setAttribute("aria-label", "1 到 5 分");

  for (let score = 1; score <= 5; score += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "score-button";
    button.textContent = String(score);
    button.setAttribute("aria-label", `${score} 分`);
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
      ? "已标记无法判断（点击撤销）"
      : "无法判断 / 图片异常";
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

  els.caseTitle.textContent = `案例 ${String(state.currentIndex + 1).padStart(2, "0")}`;
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
    <div><strong>${state.caseOrder.length}</strong><span>已评价案例</span></div>
    <div><strong>${rated}</strong><span>有效图片评分</span></div>
    <div><strong>${totalMinutes}</strong><span>记录用时（分钟）</span></div>
  `;
  if (excluded > 0) {
    els.downloadStatus.textContent =
      `另有 ${excluded} 项标记为无法判断，将不计入 MOS。`;
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
  els.downloadStatus.textContent =
    "JSON 已下载。请将该文件发送给研究组织者。";
}

function resetSession() {
  const confirmed = window.confirm(
    "确定清除当前评价进度并重新开始吗？此操作无法撤销。",
  );
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
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
    manifest = await response.json();
    if (!Array.isArray(manifest.cases) || manifest.cases.length === 0) {
      throw new Error("Manifest contains no cases");
    }
  } catch (error) {
    els.start.disabled = true;
    els.start.textContent = "评测数据加载失败";
    console.error(error);
    return;
  }

  state = loadState();
  if (state) {
    els.resume.classList.remove("hidden");
    els.resume.textContent = state.session.completedAt
      ? "查看已完成结果"
      : `继续上次进度（${state.currentIndex + 1}/${state.caseOrder.length}）`;
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
