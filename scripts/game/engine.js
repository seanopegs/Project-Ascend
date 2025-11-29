import { baseStats, statsOrder, createInitialStats } from "../config/stats.js";
import { statusConfig } from "../config/status.js";
import { actionLibrary } from "./actions.js";
import { locations } from "../story/locations.js";
import { scheduledEvents, randomEvents } from "../story/events.js";
import { initializeStatsUI, updateStatsUI, onStatsVisibilityChange } from "../ui/statsPanel.js";
import { initializeStatusPanel, updateStatusPanel } from "../ui/statusPanel.js";
import { renderFeedback } from "../ui/feedbackPanel.js";
import { setStoryText } from "../ui/storyRenderer.js";
import { initializeMiniMap, updateMiniMap } from "../ui/mapPanel.js";
import { initializeJournal, refreshJournal, closeJournal } from "../ui/journal.js";
import { formatCurrency, formatChange } from "../util/format.js";
import { clamp, normalizeValue } from "../util/math.js";
import { formatTime, formatCalendarDate, formatDuration, advanceCalendarDay } from "../util/time.js";
import { initializeThemeToggle } from "../ui/themeToggle.js";

const stats = createInitialStats();
const allStatsMetadata = new Map();

let worldState = createInitialWorldState();
let gameEnded = false;
let currentEnding = null;
const conditionNoteMap = new Map();
let conditionNoteSequence = 0;
let showInsightsInFeedback = true;

const AUTOSAVE_STORAGE_KEY = "project-ascend:autosave";
const SNAPSHOT_VERSION = 1;

const STORAGE_FALLBACK_NOTICES = new Set();

let cachedLocalStorage;
let cachedSessionStorage;
let fallbackMemoryStorage = null;

let autosaveSuppressed = false;
let cachedAutosaveSnapshot = null;

let statsElement;
let statusSummaryElement;
let statusHeadingTitleElement;
let statusMetricsElement;
let storyElement;
let feedbackElement;
let choicesElement;
let restartButton;
let toggleStatsButton;
let journalButton;
let journalPanel;
let miniMapContainer;
let themeToggleButton;
let statsPanelVisible = false;
let cycleBadgeElement;
let strategyBadgeElement;

const ACTION_HOTKEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const TRAVEL_HOTKEYS = Array.from('abcdefghijklmnopqrstuvwxyz');
const choiceHotkeys = new Map();
let hotkeyListenerAttached = false;

// ... [Keep existing helper functions] ...
function normalizeHotkey(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function describeDaySegment(hour) {
  const normalized = ((Number(hour) % 24) + 24) % 24;
  if (normalized < 4) {
    return 'Dini Hari';
  }
  if (normalized < 11) {
    return 'Pagi Ini';
  }
  if (normalized < 15) {
    return 'Siang Ini';
  }
  if (normalized < 18) {
    return 'Sore Ini';
  }
  if (normalized < 21) {
    return 'Senja Ini';
  }
  return 'Malam Ini';
}

function describeRiskBadge() {
  if (worldState.flags.collectorAssetSeizure) {
    return 'Ancaman Penyitaan';
  }
  if (worldState.flags.collectorAccountFreeze) {
    return 'Akun Dibekukan';
  }
  if (worldState.flags.collectorLegalThreat || worldState.flags.collectorUltimatum) {
    return 'Ultimatum Kolektor';
  }
  if (worldState.flags.debtCollectorKnock) {
    return 'Siaga Penagih';
  }
  return 'Taktik Bertahan';
}

function updateHeaderBadges() {
  if (cycleBadgeElement) {
    const segment = describeDaySegment(worldState.hour);
    cycleBadgeElement.textContent = `Hari ${worldState.day} • ${segment}`;
  }
  if (strategyBadgeElement) {
    strategyBadgeElement.textContent = describeRiskBadge();
  }
}

function updateStatusHeading() {
  if (!statusHeadingTitleElement) {
    return;
  }
  const segment = describeDaySegment(worldState.hour);
  statusHeadingTitleElement.textContent = `Kondisi ${segment}`;
}

function isTextEntryElement(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  const tagName = element.tagName;
  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  );
}

function handleChoiceHotkey(event) {
  if (event.defaultPrevented) {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  const key = normalizeHotkey(event.key);
  if (!key) {
    return;
  }
  if (isTextEntryElement(event.target)) {
    return;
  }
  const entry = choiceHotkeys.get(key);
  if (!entry) {
    return;
  }
  const { button, handler } = entry;
  if (button?.disabled) {
    return;
  }
  event.preventDefault();
  if (typeof button?.focus === 'function') {
    button.focus({ preventScroll: true });
  }
  handler?.();
}

function ensureChoiceHotkeyListener() {
  if (hotkeyListenerAttached) {
    return;
  }
  window.addEventListener('keydown', handleChoiceHotkey, { passive: false });
  hotkeyListenerAttached = true;
}

function clearChoiceHotkeys() {
  choiceHotkeys.clear();
}

function registerChoiceHotkey(key, button, handler) {
  const normalized = normalizeHotkey(key);
  if (!normalized || !button || typeof handler !== 'function') {
    return;
  }
  choiceHotkeys.set(normalized, { button, handler });
}

function handleMiniMapTravelRequest(targetId) {
  if (!targetId || gameEnded) {
    return;
  }
  if (targetId === worldState.location) {
    return;
  }
  const currentLocation = locations[worldState.location];
  if (!currentLocation?.connections?.includes(targetId)) {
    return;
  }
  moveTo(targetId);
}

function detachUiHandlers() {
  if (toggleStatsButton) {
    toggleStatsButton.removeEventListener("click", handleToggleStatsClick);
  }
  if (restartButton) {
    restartButton.removeEventListener("click", handleRestartClick);
  }
}

function handleToggleStatsClick(event) {
  event?.preventDefault?.();
  setStatsPanelVisibility(!statsPanelVisible);
}

function handleRestartClick(event) {
  event?.preventDefault?.();
  startNewSession();
}

function disableControl(button, message) {
  if (!button) {
    return;
  }
  button.disabled = true;
  button.setAttribute("aria-disabled", "true");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-pressed", "false");
  if (message) {
    button.title = message;
  }
}

export function initializeGame(options = {}) {
  detachUiHandlers();

  statsElement = document.getElementById("stats");
  statusSummaryElement = document.getElementById("statusSummary");
  statusHeadingTitleElement = document.getElementById("statusHeadingTitle");
  statusMetricsElement = document.getElementById("statusMetrics");
  storyElement = document.getElementById("story");
  feedbackElement = document.getElementById("feedback");
  choicesElement = document.getElementById("choices");
  restartButton = document.getElementById("restart");
  toggleStatsButton = document.getElementById("toggleStats");
  journalButton = document.getElementById("journalButton");
  journalPanel = document.getElementById("journalPanel");
  miniMapContainer = document.getElementById("miniMap");
  themeToggleButton = document.getElementById("themeToggle");
  cycleBadgeElement = document.querySelector('.header-meta .badge:not(.accent)');
  strategyBadgeElement = document.querySelector('.header-meta .badge.accent');

  if (toggleStatsButton && statsElement) {
    toggleStatsButton.setAttribute("aria-controls", statsElement.id);
    statsPanelVisible = !statsElement.hasAttribute("hidden");
  } else if (toggleStatsButton && !statsElement) {
    disableControl(toggleStatsButton, "Panel stat tidak ditemukan.");
  }

  buildMetadata();

  if (statsElement) {
    initializeStatsUI(statsElement, stats, { onRequestClose: () => setStatsPanelVisibility(false) });
  }

  if (statusMetricsElement) {
    initializeStatusPanel(statusMetricsElement, worldState);
  }

  if (miniMapContainer) {
    initializeMiniMap(miniMapContainer, { onRequestTravel: handleMiniMapTravelRequest });
  }

  if (journalButton && journalPanel) {
    initializeJournal(journalButton, journalPanel, () => buildJournalEntries());
  } else if (journalButton && !journalPanel) {
    disableControl(journalButton, "Panel jurnal tidak ditemukan.");
  }

  initializeThemeToggle(themeToggleButton);

  if (toggleStatsButton && statsElement) {
    toggleStatsButton.addEventListener("click", handleToggleStatsClick);
  }

  if (restartButton) {
    restartButton.addEventListener("click", handleRestartClick);
  }

  ensureChoiceHotkeyListener();
  updateHeaderBadges();

  const controller = {
    startNewGame: (meta) => startNewSession(meta),
    loadSnapshot: (snapshot, loadOptions) => loadSnapshotFromData(snapshot, loadOptions),
    getSnapshot: (meta) => createSnapshot(meta),
    getCachedSnapshot: () => getAutosaveSnapshotInternal(),
    clearAutosave: () => clearAutosaveStorage(),
  };

  if (options.initialSnapshot) {
    try {
      controller.loadSnapshot(options.initialSnapshot, { source: "initial" });
    } catch (error) {
      console.error("Gagal memuat snapshot awal.", error);
      controller.startNewGame();
    }
  } else if (options.autoStart !== false) {
    controller.startNewGame();
  }

  return controller;
}

function buildMetadata() {
  allStatsMetadata.clear();
  statsOrder.forEach((key) => {
    const stat = stats[key];
    allStatsMetadata.set(key, {
      alias: stat.alias,
      formatChange: (amount) => formatChange(Number(amount.toFixed(1))),
      positiveIsGood: true,
      color: stat.color,
      colorStrong: stat.colorStrong,
      colorSoft: stat.colorSoft,
    });
  });
  Object.entries(statusConfig).forEach(([key, meta]) => {
    const negative = meta.positiveIsGood === false;
    const fallbackColor = negative ? "#fb7185" : "#38bdf8";
    const fallbackColorStrong = negative ? "#f43f5e" : "#0ea5e9";
    const fallbackColorSoft = negative ? "rgba(251, 113, 133, 0.22)" : "rgba(56, 189, 248, 0.18)";
    allStatsMetadata.set(key, {
      alias: meta.alias,
      formatChange: meta.formatChange,
      positiveIsGood: meta.positiveIsGood ?? true,
      color: meta.color ?? fallbackColor,
      colorStrong: meta.colorStrong ?? fallbackColorStrong,
      colorSoft: meta.colorSoft ?? fallbackColorSoft,
    });
  });
}

function createInitialWorldState() {
  return {
    day: 1,
    hour: 21,
    minute: 0,
    dayOfMonth: 12,
    monthIndex: 6,
    year: 2024,
    weekdayIndex: 2,
    location: "ruangKeluarga",
    fatherHealth: 62,
    stress: 48,
    fatigue: 42,
    trauma: 32,
    money: 1_300_000,
    debt: 82_000_000,
    debtInterestRate: 0.0045,
    hoursSinceFatherCare: 1,
    hoursSinceRest: 6,
    flags: {
      triggeredEvents: {},
      reviewedBills: false,
      hasChronology: false,
      awaitingDina: false,
      dinaArrived: false,
      dinaSupportAvailable: false,
      dinaLoanOutstanding: 0,
      dinaLoanDue: null,
      safeWithSupport: false,
      houseSecured: false,
      confrontedCollector: false,
      planPrepared: false,
      planSent: false,
      dinaLoanDeposited: false,
      debtCollectorKnock: false,
      nextCollectorVisit: null,
      extraGigTaken: false,
      preparedMedicine: false,
      collectorUltimatum: false,
      homeBusinessPlan: false,
      homeBusinessLaunched: false,
      homeBusinessMomentum: 0,
      creatorChannel: false,
      creatorMomentum: 0,
      sleepDeprivationStage: 0,
      careEscalationStage: 0,
      collectorEscalationStage: 0,
      totalCollectorPayments: 0,
      lastCollectorPayment: null,
      collectorMorningPressure: false,
      collectorPenaltyDay2: false,
      collectorLegalThreat: false,
      collectorAccountFreeze: false,
      collectorAssetSeizure: false,
      pawnedJewelry: false,
    },
  };
}

function getBrowserStorageSafe(type) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window[type] || null;
  } catch (error) {
    const label = type === "sessionStorage" ? "penyimpanan sesi" : "penyimpanan lokal";
    console.warn(`${label} tidak tersedia untuk simpanan otomatis.`, error);
    return null;
  }
}

function getLocalStorageSafe() {
  if (cachedLocalStorage === undefined) {
    cachedLocalStorage = getBrowserStorageSafe("localStorage");
  }
  return cachedLocalStorage || null;
}

function getSessionStorageSafe() {
  if (cachedSessionStorage === undefined) {
    cachedSessionStorage = getBrowserStorageSafe("sessionStorage");
  }
  return cachedSessionStorage || null;
}

function getMemoryStorage(createIfMissing = true) {
  if (!fallbackMemoryStorage && createIfMissing) {
    const store = new Map();
    fallbackMemoryStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => {
        store.set(key, String(value));
      },
      removeItem: (key) => {
        store.delete(key);
      },
    };
  }
  return fallbackMemoryStorage;
}

function notifyStorageFallback(type, message) {
  if (STORAGE_FALLBACK_NOTICES.has(type)) {
    return;
  }
  console.info(message);
  STORAGE_FALLBACK_NOTICES.add(type);
}

function deepClone(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (error) {
      // Fallback akan ditangani di bawah.
    }
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.warn("Gagal melakukan kloning mendalam pada nilai.", error);
    return value;
  }
}

function mergeWorldState(savedWorld = {}) {
  const base = createInitialWorldState();
  const clone = typeof savedWorld === "object" && savedWorld ? deepClone(savedWorld) : {};
  const merged = { ...base, ...clone };
  merged.flags = { ...base.flags, ...(clone.flags || {}) };
  if (!merged.flags.triggeredEvents) {
    merged.flags.triggeredEvents = {};
  }
  return merged;
}

function applyStatsFromSnapshot(savedStats = {}) {
  statsOrder.forEach((key) => {
    const stat = stats[key];
    if (!stat) {
      return;
    }
    const value = Number(savedStats[key]);
    if (Number.isFinite(value)) {
      const clampedValue = clamp(value, 0, stat.max);
      stat.value = Number(clampedValue.toFixed(2));
    } else {
      stat.value = baseStats[key].initial;
    }
  });
  updateStatsUI(stats);
}

function restoreConditionNotes(snapshot = {}) {
  conditionNoteMap.clear();
  const entries = Array.isArray(snapshot.conditionNotes) ? snapshot.conditionNotes : [];
  entries.forEach((note) => {
    if (!note || typeof note.text !== "string") {
      return;
    }
    const normalized = {
      text: note.text,
      time: typeof note.time === "string" ? note.time : "",
      sequence: Number.isFinite(note.sequence) ? note.sequence : 0,
    };
    conditionNoteMap.set(note.text, normalized);
  });
  if (Number.isFinite(snapshot.conditionNoteSequence)) {
    conditionNoteSequence = snapshot.conditionNoteSequence;
  } else {
    conditionNoteSequence = entries.reduce((max, entry) => {
      const value = Number(entry?.sequence) || 0;
      return Math.max(max, value);
    }, 0);
  }
}

function createSnapshot(metaOverrides = {}) {
  const savedAt = new Date().toISOString();
  const location = locations[worldState.location];
  const summaryParts = [
    `Hari ${worldState.day}`,
    formatTime(worldState.hour, worldState.minute),
    location?.name,
  ].filter(Boolean);
  const meta = {
    type: metaOverrides.type || "auto",
    source: metaOverrides.source || "auto",
    summary: summaryParts.join(" • "),
    day: worldState.day,
    hour: worldState.hour,
    minute: worldState.minute,
    location: worldState.location,
    savedAt,
  };
  if (metaOverrides.note) {
    meta.note = metaOverrides.note;
  }
  if (metaOverrides.label) {
    meta.label = metaOverrides.label;
  }

  const snapshot = {
    version: SNAPSHOT_VERSION,
    savedAt,
    meta,
    worldState: deepClone(worldState),
    stats: Object.fromEntries(
      statsOrder.map((key) => [key, Number(stats[key]?.value ?? baseStats[key]?.initial ?? 0)]),
    ),
    conditionNotes: Array.from(conditionNoteMap.values()).map((note) => ({ ...note })),
    conditionNoteSequence,
    showInsightsInFeedback,
    gameEnded,
  };
  if (currentEnding) {
    snapshot.currentEnding = deepClone(currentEnding);
  }
  return snapshot;
}

function dispatchAutosaveEvent(snapshot) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const detail = deepClone(snapshot);
    const event =
      typeof CustomEvent === "function"
        ? new CustomEvent("projectAscend:autosave", { detail })
        : null;
    if (event) {
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.warn("Gagal mengirimkan event autosave.", error);
  }
}

function persistAutosave(metaOverrides = {}) {
  const overrides = { source: "auto", type: "auto", ...metaOverrides };
  const snapshot = createSnapshot(overrides);
  let serialized = null;
  try {
    serialized = JSON.stringify(snapshot);
  } catch (error) {
    console.warn("Gagal mempersiapkan data simpanan otomatis.", error);
  }

  if (serialized) {
    let stored = false;
    const localStorage = getLocalStorageSafe();
    if (localStorage) {
      try {
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
        stored = true;
      } catch (error) {
        console.warn("Gagal menyimpan progres ke penyimpanan lokal.", error);
      }
    }

    if (!stored) {
      const sessionStorage = getSessionStorageSafe();
      if (sessionStorage) {
        try {
          sessionStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
          stored = true;
          notifyStorageFallback(
            "session",
            "Simpan otomatis menggunakan penyimpanan sesi karena penyimpanan lokal tidak tersedia.",
          );
        } catch (error) {
          console.warn("Gagal menyimpan progres ke penyimpanan sesi.", error);
        }
      }
    }

    if (!stored) {
      const memoryStorage = getMemoryStorage(true);
      try {
        memoryStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
        notifyStorageFallback(
          "memory",
          "Simpan otomatis sementara menggunakan memori karena penyimpanan browser tidak tersedia.",
        );
      } catch (error) {
        console.warn("Gagal menyimpan progres ke penyimpanan sementara.", error);
      }
    }
  }

  cachedAutosaveSnapshot = snapshot;
  dispatchAutosaveEvent(snapshot);
  return snapshot;
}

function readAutosaveRaw(storage, label) {
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(AUTOSAVE_STORAGE_KEY);
  } catch (error) {
    if (label) {
      console.warn(`Gagal mengakses ${label} untuk simpanan otomatis.`, error);
    } else {
      console.warn("Gagal mengakses penyimpanan sementara untuk simpanan otomatis.", error);
    }
    return null;
  }
}

function getAutosaveSnapshotInternal() {
  if (cachedAutosaveSnapshot) {
    return deepClone(cachedAutosaveSnapshot);
  }

  const candidates = [
    { storage: getLocalStorageSafe(), label: "penyimpanan lokal" },
    { storage: getSessionStorageSafe(), label: "penyimpanan sesi" },
  ];

  const memoryStorage = getMemoryStorage(false);
  if (memoryStorage) {
    candidates.push({ storage: memoryStorage, label: "penyimpanan sementara" });
  }

  for (const { storage, label } of candidates) {
    const raw = readAutosaveRaw(storage, label);
    if (!raw) {
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        continue;
      }
      if (parsed.version !== SNAPSHOT_VERSION) {
        console.warn(
          `Versi simpanan (${parsed.version}) tidak cocok dengan versi saat ini (${SNAPSHOT_VERSION}).`,
        );
      }
      cachedAutosaveSnapshot = parsed;
      return deepClone(parsed);
    } catch (error) {
      console.warn(`Gagal memuat simpanan otomatis dari ${label}.`, error);
    }
  }

  return null;
}

function clearAutosaveStorage() {
  cachedAutosaveSnapshot = null;
  const localStorage = getLocalStorageSafe();
  if (localStorage) {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (error) {
      console.warn("Gagal menghapus simpanan otomatis dari penyimpanan lokal.", error);
    }
  }

  const sessionStorage = getSessionStorageSafe();
  if (sessionStorage) {
    try {
      sessionStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (error) {
      console.warn("Gagal menghapus simpanan otomatis dari penyimpanan sesi.", error);
    }
  }

  const memoryStorage = getMemoryStorage(false);
  if (memoryStorage) {
    memoryStorage.removeItem(AUTOSAVE_STORAGE_KEY);
  }
}

function withAutosaveSuppressed(callback) {
  const previous = autosaveSuppressed;
  autosaveSuppressed = true;
  try {
    return callback();
  } finally {
    autosaveSuppressed = previous;
  }
}

function loadSnapshotFromData(snapshot, options = {}) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Berkas simpanan tidak valid.");
  }
  if (!snapshot.worldState || typeof snapshot.worldState !== "object") {
    throw new Error("Berkas simpanan tidak memuat status permainan.");
  }
  if (!snapshot.stats || typeof snapshot.stats !== "object") {
    throw new Error("Berkas simpanan tidak memuat statistik karakter.");
  }

  const mergedWorld = mergeWorldState(snapshot.worldState);
  const resumeSource = options.source || snapshot.meta?.source || "load";
  const resumeType = options.type || "auto";

  withAutosaveSuppressed(() => {
    worldState = mergedWorld;
    applyStatsFromSnapshot(snapshot.stats);
    restoreConditionNotes(snapshot);
    showInsightsInFeedback = snapshot.showInsightsInFeedback !== false;
    gameEnded = Boolean(snapshot.gameEnded);
    currentEnding = snapshot.currentEnding ? deepClone(snapshot.currentEnding) : null;

    const narratives =
      gameEnded || resumeSource === "continue" || resumeSource === "initial"
        ? []
        : [
            resumeSource === "load-file"
              ? "Berkas simpanan berhasil dimuat. Kamu kembali ke momen terakhir yang terekam."
              : "Kamu melanjutkan progres terakhir yang tersimpan.",
          ];
    renderScene(narratives, []);
  });

  cachedAutosaveSnapshot = null;
  return persistAutosave({ source: resumeSource, type: resumeType });
}

function startNewSession(metaOverrides = {}) {
  cachedAutosaveSnapshot = null;
  withAutosaveSuppressed(() => {
    resetGame();
  });
  // Force a save immediately upon starting a new session
  return persistAutosave({ source: "new-game", type: "auto", ...metaOverrides });
}

function resetStats() {
  statsOrder.forEach((key) => {
    stats[key].value = baseStats[key].initial;
  });
  updateStatsUI(stats);
}

function resetGame() {
  worldState = createInitialWorldState();
  worldState.flags.triggeredEvents = {};
  gameEnded = false;
  currentEnding = null;
  conditionNoteMap.clear();
  conditionNoteSequence = 0;
  showInsightsInFeedback = true;
  resetStats();
  updateStatusSummary();
  if (statusMetricsElement) {
    updateStatusPanel(worldState);
  }
  updateMiniMap(worldState.location);
  if (feedbackElement) {
    feedbackElement.innerHTML = "";
  }
  setStatsPanelVisibility(false);
  closeJournal();

  const introText =
    "Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar. Para penagih masih berjaga di depan pagar.";
  renderScene([introText], []);
}

// ... [Keep existing implementation for updateStatusSummary, applyEffects, applyStatusDelta, applyStatusChanges, etc.] ...

// ... [Keep rest of the file identical until renderScene or others need changes] ...
// I will just overwrite the file since I'm pasting a large block, but I'll ensure I didn't cut anything off.
// The file is large. I should probably use `replace_with_git_merge_diff` if possible, but the plan was to add a call to persistAutosave in initializeGame.
// Actually, `startNewSession` calls `persistAutosave` at the end.
// And `initializeGame` calls `controller.startNewGame()` if `options.autoStart !== false`.
// So a new game SHOULD have a save immediately.

// Let's verify `performAction`.
// It calls `renderScene`.
// `renderScene` calls `persistAutosave`.

// So the logic seems correct. The issue might be simply that `main.js` wasn't correctly loading it.

// However, I want to double check if `persistAutosave` is actually saving to localStorage.
// `getLocalStorageSafe()` ... `localStorage.setItem`.

// I will paste the content back, just to be safe I didn't miss anything.
// Wait, I am reading the file to verify. I don't need to overwrite it if it's already correct.
// `startNewSession` calls `persistAutosave`.
// `loadSnapshotFromData` calls `persistAutosave`.
// `renderScene` calls `persistAutosave`.

// So if the engine is correct, the problem is in the loading mechanism in `main.js`.
// I'll proceed to modify `scripts/main.js` next.

