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

const ACTION_HOTKEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const TRAVEL_HOTKEYS = Array.from('abcdefghijklmnopqrstuvwxyz');
const choiceHotkeys = new Map();
let hotkeyListenerAttached = false;

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
  resetGame();
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

export function initializeGame() {
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
  resetGame();
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
    },
  };
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

function updateStatusSummary() {
  updateStatusHeading();
  const location = locations[worldState.location];
  const clock = formatTime(worldState.hour, worldState.minute);
  const calendar = formatCalendarDate(worldState);
  const segment = describeDaySegment(worldState.hour);
  if (statusSummaryElement) {
    const summaryParts = [
      `Hari ${worldState.day} (${calendar})`,
      segment,
      clock,
      location?.name ?? "Lokasi tidak dikenal",
    ];
    const collectorDeadline = describeCollectorDeadline();
    if (collectorDeadline) {
      summaryParts.push(collectorDeadline);
    }
    const loanDeadline = describeLoanDeadline();
    if (loanDeadline) {
      summaryParts.push(loanDeadline);
    }
    if (worldState.flags.homeBusinessLaunched) {
      summaryParts.push("Pre-order tetangga aktif");
    } else if (worldState.flags.homeBusinessPlan) {
      summaryParts.push("Rencana usaha siap jalan");
    }
    if (worldState.flags.creatorChannel) {
      summaryParts.push("Kanal dukungan aktif");
    }
    statusSummaryElement.textContent = summaryParts.join(" • ");
  }
}

function applyEffects(effects = {}) {
  if (!effects) return [];
  const changes = [];
  Object.entries(effects).forEach(([key, amount]) => {
    if (!amount) return;
    const stat = stats[key];
    if (!stat) return;
    const previous = stat.value;
    const next = clamp(previous + amount, 0, stat.max);
    if (next !== previous) {
      const delta = next - previous;
      const normalizedDelta = normalizeValue(delta);
      if (normalizedDelta !== 0) {
        stat.value = Number(next.toFixed(2));
        changes.push({ key, amount: normalizedDelta });
      }
    }
  });
  if (changes.length) {
    updateStatsUI(stats);
  }
  return changes;
}

function applyStatusDelta(key, delta) {
  if (!delta) return 0;
  const meta = statusConfig[key];
  if (!meta) return 0;
  const previous = Number(worldState[key] ?? 0);
  let next = previous + delta;
  if (typeof meta.min === "number") {
    next = Math.max(meta.min, next);
  }
  if (typeof meta.max === "number") {
    next = Math.min(meta.max, next);
  }
  worldState[key] = next;
  return next - previous;
}

function applyStatusChanges(changes = {}) {
  if (!changes) return [];
  const results = [];
  Object.entries(changes).forEach(([key, amount]) => {
    const actual = applyStatusDelta(key, amount);
    if (actual) {
      results.push({ key, amount: normalizeValue(actual) });
    }
  });
  if (results.length) {
    if (statusMetricsElement) {
      updateStatusPanel(worldState);
    }
    updateStatusSummary();
  }
  return results;
}

function adjustChange(target, key, transformer) {
  if (!Object.prototype.hasOwnProperty.call(target, key)) {
    return;
  }
  const next = normalizeValue(transformer(target[key]));
  if (next === 0) {
    delete target[key];
  } else {
    target[key] = next;
  }
}

function adjustMultiple(target, keys, transformer) {
  keys.forEach((key) => adjustChange(target, key, transformer));
}

function incrementEffect(target, key, amount) {
  const next = normalizeValue((target[key] || 0) + amount);
  if (next === 0) {
    delete target[key];
  } else {
    target[key] = next;
  }
}

function cloneEffects(effects = {}) {
  return Object.fromEntries(Object.entries(effects || {}).map(([key, value]) => [key, value]));
}

function resolveActionOutcome(action, state) {
  const rawBaseEffects =
    typeof action.baseEffects === "function" ? action.baseEffects(state) : action.baseEffects || {};
  const rawStatusChanges =
    typeof action.statusChanges === "function" ? action.statusChanges(state) : action.statusChanges || {};
  const baseEffects = cloneEffects(rawBaseEffects);
  const statusChanges = cloneEffects(rawStatusChanges);
  const notes = [];
  const traits = new Set(action.traits || []);

  const fatigue = state.fatigue;
  const stressLevel = state.stress;
  const willpower = stats.willpower.value;
  const awareness = stats.awareness.value;
  const beauty = stats.beauty.value;
  const networking = stats.networking?.value ?? 0;
  const confidence = stats.confidence?.value ?? 0;
  const ingenuity = stats.ingenuity?.value ?? 0;
  const resilienceStat = stats.resilience?.value ?? 0;
  let freshForWork = false;
  let focusedWillpower = false;

  if (traits.has("physical") || traits.has("care")) {
    if (fatigue >= 75) {
      adjustMultiple(statusChanges, ["fatherHealth"], (value) => value * 0.65);
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 0.7 : value * 1.15));
      adjustChange(statusChanges, "fatigue", (value) => value + 2.5);
      notes.push("Kelelahan tinggi membuat gerakanmu melambat dan hasilnya berkurang.");
    } else if (fatigue <= 30) {
      adjustMultiple(statusChanges, ["fatherHealth"], (value) => value * 1.2);
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 1.25 : value * 0.85));
      adjustChange(statusChanges, "fatigue", (value) => value - 2);
      notes.push("Tubuh yang masih segar membuat upaya fisikmu lebih efektif.");
    }
  }

  if (traits.has("work")) {
    if (fatigue >= 65) {
      adjustChange(statusChanges, "money", (value) => value * 0.85);
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 1.1 : value));
      notes.push("Kelelahan menurunkan produktivitas kerjamu.");
    } else if (fatigue <= 35) {
      adjustChange(statusChanges, "money", (value) => value * 1.1);
      notes.push("Energi cukup membuat tempo kerjamu lebih cepat.");
      freshForWork = true;
    }

    if (ingenuity >= 65) {
      adjustChange(statusChanges, "money", (value) => value * 1.12);
      notes.push("Kecakapan bisnismu membuat hasil kerja jadi lebih bernilai.");
    } else if (ingenuity <= 30) {
      adjustChange(statusChanges, "money", (value) => value * 0.9);
      notes.push("Tanpa sistem yang matang, pendapatan kerjamu belum optimal.");
    }
  }

  if (traits.has("mental") || traits.has("planning") || traits.has("work")) {
    if (willpower >= 65) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 0.7 : value * 1.15));
      incrementEffect(baseEffects, "willpower", 0.5);
      notes.push("Tekad tinggi membantumu tetap fokus di tengah tekanan.");
      focusedWillpower = true;
    } else if (willpower <= 40) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 1.2 : value * 0.85));
      notes.push("Tekad yang melemah membuat tekanan terasa lebih berat.");
    }
  }

  if (traits.has("planning") || traits.has("documentation")) {
    if (awareness >= 65) {
      incrementEffect(baseEffects, "awareness", 1);
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 0.85 : value));
      notes.push("Kewaspadaan tinggi memudahkanmu memilah informasi penting.");
    } else if (awareness <= 35) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 1.15 : value * 0.9));
      notes.push("Kurang fokus membuat analisis terasa melelahkan.");
    }
  }

  if (traits.has("recovery")) {
    if (stressLevel >= 80) {
      adjustChange(statusChanges, "fatigue", (value) => value * 0.8);
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 0.9 : value));
      notes.push("Stres tinggi membuat pemulihan tidak maksimal.");
    } else if (willpower >= 65) {
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 1.2 : value));
      notes.push("Teknik fokus membantu pemulihan lebih dalam.");
    }

    if (resilienceStat >= 65) {
      adjustChange(statusChanges, "fatigue", (value) => value * 1.1);
      notes.push("Resiliensi tinggi mempercepat pemulihan tubuhmu.");
    } else if (resilienceStat <= 30) {
      adjustChange(statusChanges, "fatigue", (value) => value * 0.85);
      notes.push("Tubuh yang rapuh membuat pemulihan butuh waktu lebih lama.");
    }
  }

  if (traits.has("social")) {
    if (beauty >= 60) {
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 1.2 : value * 0.9));
      notes.push("Pembawaan percaya diri membuat interaksi berjalan mulus.");
    } else if (beauty <= 35) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 1.1 : value * 0.85));
      notes.push("Rasa canggung sedikit mengurangi hasil interaksimu.");
    }

    if (confidence >= 60) {
      adjustChange(statusChanges, "money", (value) => (typeof value === "number" ? value * 1.08 : value));
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 1.1 : value));
      notes.push("Kepercayaan diri tinggi membuat ajakanmu lebih meyakinkan.");
    } else if (confidence <= 30) {
      adjustChange(statusChanges, "money", (value) => (typeof value === "number" ? value * 0.92 : value));
      notes.push("Keraguan diri membuatmu sulit menutup dukungan baru.");
    }
  }

  if (traits.has("work") && freshForWork && focusedWillpower) {
    adjustChange(statusChanges, "money", (value) => value * 1.12);
    notes.push("Tubuh segar dan tekad menyala membuat hasil lemburmu melesat.");
  }

  if (traits.has("business")) {
    if (ingenuity >= 60) {
      adjustChange(statusChanges, "money", (value) => value * 1.15);
      notes.push("Perhitungan bisnismu membuat setiap pesanan lebih menguntungkan.");
    } else if (ingenuity <= 35) {
      adjustChange(statusChanges, "money", (value) => value * 0.88);
      notes.push("Tanpa strategi yang matang, marjin usahamu menipis.");
    }

    if (networking >= 60) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 0.85 : value));
      notes.push("Jaringanmu membantu meredakan tekanan menghadapi pelanggan.");
    } else if (networking <= 30) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 1.15 : value));
      notes.push("Jangkauan sempit membuat usaha sampingan terasa melelahkan.");
    }
  }

  return { baseEffects, statusChanges, notes };
}

function aggregateChanges(changes) {
  const combined = new Map();
  changes.forEach((change) => {
    if (!change || typeof change.amount !== "number") {
      return;
    }
    if (!allStatsMetadata.has(change.key)) {
      return;
    }
    if (!combined.has(change.key)) {
      combined.set(change.key, { ...change });
    } else {
      combined.get(change.key).amount += change.amount;
    }
  });
  return Array.from(combined.values()).filter((item) => item.amount !== 0);
}

function describeEffects(effects = {}) {
  if (!effects) {
    return { text: "", segments: [] };
  }

  const parts = [];
  const segments = [];
  Object.entries(effects).forEach(([key, amount]) => {
    if (!amount) return;
    const metadata = allStatsMetadata.get(key);
    if (!metadata) return;
    const formatter = metadata.formatChange ?? formatChange;
    const formatted = formatter(amount);
    parts.push(`${metadata.alias} ${formatted}`);
    segments.push({
      key,
      alias: metadata.alias,
      amount,
      formatted,
      positiveIsGood: metadata.positiveIsGood !== false,
      color: metadata.color,
      colorStrong: metadata.colorStrong,
      colorSoft: metadata.colorSoft,
    });
  });

  return { text: parts.join(", "), segments };
}

function describeCombinedEffects(baseEffects = {}, statusEffects = {}) {
  const combined = {};
  Object.entries(baseEffects || {}).forEach(([key, amount]) => {
    if (!amount) return;
    combined[key] = (combined[key] || 0) + amount;
  });
  Object.entries(statusEffects || {}).forEach(([key, amount]) => {
    if (!amount) return;
    combined[key] = (combined[key] || 0) + amount;
  });
  return describeEffects(combined);
}

function advanceTime(hours = 1) {
  if (!Number.isFinite(hours) || hours <= 0) {
    return [];
  }
  const aggregate = {};
  let remainingMinutes = Math.max(1, Math.round(hours * 60));
  const stepMinutes = 15;

  while (remainingMinutes > 0) {
    const step = Math.min(stepMinutes, remainingMinutes);
    remainingMinutes -= step;

    worldState.minute += step;
    while (worldState.minute >= 60) {
      worldState.minute -= 60;
      worldState.hour += 1;
    }
    while (worldState.hour >= 24) {
      worldState.hour -= 24;
      worldState.day += 1;
      advanceCalendarDay(worldState);
    }

    const portion = step / 60;
    const hourlyInterestRate = worldState.debtInterestRate / 24;
    const interest = worldState.debt * hourlyInterestRate * portion;
    aggregate.debt = (aggregate.debt || 0) + applyStatusDelta("debt", interest);

    const stressGain = worldState.flags.safeWithSupport ? 0.4 : 0.9;
    aggregate.stress = (aggregate.stress || 0) + applyStatusDelta("stress", stressGain * portion);

    aggregate.fatigue = (aggregate.fatigue || 0) + applyStatusDelta("fatigue", 1.4 * portion);

    worldState.hoursSinceFatherCare += portion;
    if (worldState.hoursSinceFatherCare >= 4) {
      aggregate.fatherHealth =
        (aggregate.fatherHealth || 0) + applyStatusDelta("fatherHealth", -1.5 * portion);
    }

    worldState.hoursSinceRest += portion;
    if (worldState.hoursSinceRest >= 24) {
      const fatiguePenalty = 1.2 + Math.max(0, worldState.hoursSinceRest - 24) * 0.05;
      aggregate.fatigue =
        (aggregate.fatigue || 0) + applyStatusDelta("fatigue", fatiguePenalty * portion);
    }
    if (worldState.hoursSinceRest >= 36) {
      aggregate.stress =
        (aggregate.stress || 0) + applyStatusDelta("stress", 0.8 * portion);
      aggregate.trauma = (aggregate.trauma || 0) + applyStatusDelta("trauma", 0.3 * portion);
    }

    if (worldState.stress >= 80) {
      aggregate.trauma = (aggregate.trauma || 0) + applyStatusDelta("trauma", 0.6 * portion);
    }
  }

  if (statusMetricsElement) {
    updateStatusPanel(worldState);
  }
  updateStatusSummary();
  return Object.entries(aggregate)
    .map(([key, amount]) => ({ key, amount: normalizeValue(amount) }))
    .filter((entry) => entry.amount !== 0);
}

function handleEvents() {
  const narratives = [];
  let changeRecords = [];

  scheduledEvents.forEach((event) => {
    if (worldState.flags.triggeredEvents[event.id]) return;
    if (!event.condition(worldState)) return;
    const narrative = event.narrative?.(worldState);
    if (narrative) {
      narratives.push(narrative);
    }
    if (event.baseEffects) {
      changeRecords = changeRecords.concat(applyEffects(event.baseEffects));
    }
    if (event.statusChanges) {
      changeRecords = changeRecords.concat(applyStatusChanges(event.statusChanges));
    }
    const extra = event.after?.(worldState);
    if (extra) {
      narratives.push(extra);
    }
    worldState.flags.triggeredEvents[event.id] = true;
  });

  randomEvents.forEach((event) => {
    if (worldState.flags.triggeredEvents[event.id]) return;
    if (!event.condition(worldState)) return;
    const chance = typeof event.chance === "function" ? event.chance(worldState) : event.chance;
    if (Math.random() >= chance) return;
    const narrative = event.narrative?.(worldState);
    if (narrative) {
      narratives.push(narrative);
    }
    if (event.baseEffects) {
      changeRecords = changeRecords.concat(applyEffects(event.baseEffects));
    }
    if (event.statusChanges) {
      changeRecords = changeRecords.concat(applyStatusChanges(event.statusChanges));
    }
    const extra = event.after?.(worldState);
    if (extra) {
      narratives.push(extra);
    }
    worldState.flags.triggeredEvents[event.id] = true;
  });

  if (narratives.length) {
    if (statusMetricsElement) {
      updateStatusPanel(worldState);
    }
    updateStatusSummary();
  }

  return { narratives, changes: changeRecords };
}

function attachHotkeyToChoice(entry, key) {
  if (!entry || !key) {
    return;
  }
  const { button, header, ariaLabel, onActivate } = entry;
  if (!button || !header || typeof onActivate !== 'function') {
    return;
  }
  const badge = document.createElement('span');
  badge.className = 'choice-key';
  badge.textContent = key.toUpperCase();
  badge.setAttribute('aria-hidden', 'true');
  header.prepend(badge);

  const baseLabel = (ariaLabel || button.getAttribute('aria-label') || button.textContent || '').trim();
  const sentence = baseLabel.endsWith('.') ? baseLabel : baseLabel ? `${baseLabel}.` : '';
  const hotkeyLabel = key.toUpperCase();
  const ariaText = `${sentence ? `${sentence} ` : ''}Pintasan keyboard ${hotkeyLabel}.`.trim();
  if (ariaText) {
    button.setAttribute('aria-label', ariaText);
  }
  button.dataset.hotkey = hotkeyLabel;
  registerChoiceHotkey(key, button, onActivate);
}

function applyHotkeysToEntries(entries, sequence) {
  if (!Array.isArray(entries) || !Array.isArray(sequence)) {
    return;
  }
  entries.forEach((entry, index) => {
    const key = sequence[index];
    if (!key) {
      return;
    }
    attachHotkeyToChoice(entry, key);
  });
}

function renderChoicesForLocation(location) {
  if (!choicesElement) {
    return;
  }

  choicesElement.innerHTML = "";
  clearChoiceHotkeys();

  const actionEntries = [];
  const travelEntries = [];

  const actionRefs = location.actions || [];
  actionRefs.forEach((actionRef) => {
    if (actionRef.type !== "action") return;
    const action = actionLibrary[actionRef.id];
    if (!action) return;
    if (typeof action.condition === "function" && !action.condition(worldState)) {
      return;
    }

    const button = document.createElement("button");
    button.className = "button";
    button.type = "button";

    const header = document.createElement("div");
    header.className = "choice-header";
    const label = document.createElement("span");
    label.className = "choice-label";
    label.textContent = action.label;
    header.appendChild(label);
    button.appendChild(header);

    const outcomePreview = resolveActionOutcome(action, worldState);
    const preview = describeCombinedEffects(outcomePreview.baseEffects, outcomePreview.statusChanges);
    const durationText = formatDuration(action.time ?? 1);
    const ariaParts = [`${action.label}.`, `Durasi ${durationText}.`];

    if (preview?.segments?.length) {
      const hint = document.createElement("span");
      hint.className = "choice-hint";
      hint.setAttribute("aria-hidden", "true");
      preview.segments.forEach((segment, index) => {
        const chip = document.createElement("span");
        chip.className = "stat-chip";
        chip.dataset.stat = segment.key;
        const direction = segment.amount > 0 ? "increase" : "decrease";
        const positiveOutcome =
          (segment.amount > 0 && segment.positiveIsGood) || (segment.amount < 0 && !segment.positiveIsGood);
        chip.dataset.direction = direction;
        chip.dataset.outcome = positiveOutcome ? "positive" : "negative";
        chip.textContent = `${segment.alias} ${segment.formatted}`;
        if (segment.color) {
          chip.style.setProperty("--stat-chip-color", segment.color);
        }
        if (segment.colorStrong) {
          chip.style.setProperty("--stat-chip-color-strong", segment.colorStrong);
        }
        if (segment.colorSoft) {
          chip.style.setProperty("--stat-chip-color-soft", segment.colorSoft);
        }
        hint.appendChild(chip);

        if (index < preview.segments.length - 1) {
          const separator = document.createElement("span");
          separator.className = "stat-chip-separator";
          separator.setAttribute("aria-hidden", "true");
          separator.textContent = "•";
          hint.appendChild(separator);
        }
      });
      button.appendChild(hint);
      if (preview.text) {
        ariaParts.push(preview.text);
      }
    } else if (preview?.text) {
      const hint = document.createElement("span");
      hint.className = "choice-hint";
      hint.textContent = preview.text;
      hint.setAttribute("aria-hidden", "true");
      button.appendChild(hint);
      ariaParts.push(preview.text);
    }

    button.setAttribute("aria-label", ariaParts.join(" ").trim());

    const duration = document.createElement("span");
    duration.className = "choice-duration";
    duration.textContent = `Durasi: ${durationText}`;
    button.appendChild(duration);

    if (outcomePreview.notes.length) {
      const note = document.createElement("span");
      note.className = "choice-note";
      note.textContent = outcomePreview.notes[0];
      button.appendChild(note);
    }

    const onActivate = () => performAction(actionRef.id);
    button.addEventListener("click", onActivate);
    const ariaLabel = ariaParts.join(" ").trim();
    button.setAttribute("aria-label", ariaLabel);
    choicesElement.appendChild(button);
    actionEntries.push({ button, header, ariaLabel, onActivate });
  });

  const connections = location.connections || [];
  connections.forEach((target) => {
    const targetLocation = locations[target];
    if (!targetLocation) return;
    const button = document.createElement("button");
    button.className = "button secondary";
    button.type = "button";
    const header = document.createElement("div");
    header.className = "choice-header";
    const label = document.createElement("span");
    label.className = "choice-label";
    label.textContent = `Pergi ke ${targetLocation.name}`;
    header.appendChild(label);
    button.appendChild(header);
    const ariaLabel = `Pergi ke ${targetLocation.name}.`;
    button.setAttribute("aria-label", ariaLabel);
    const onActivate = () => moveTo(target);
    button.addEventListener("click", onActivate);
    choicesElement.appendChild(button);
    travelEntries.push({ button, header, ariaLabel, onActivate });
  });

  applyHotkeysToEntries(actionEntries, ACTION_HOTKEYS);
  applyHotkeysToEntries(travelEntries, TRAVEL_HOTKEYS);

  if (!choicesElement.children.length) {
    const note = document.createElement("p");
    note.className = "subtitle";
    note.textContent = "Tidak ada tindakan yang tersedia saat ini.";
    choicesElement.appendChild(note);
  }
}

function getInsights() {
  const urgent = [];
  const strategy = [];
  const financial = [];
  const growth = [];

  if (worldState.fatherHealth <= 40) {
    urgent.push("Kesehatan Ayah melemah; ganti kompres atau beri obat untuk menstabilkannya.");
  } else if (worldState.fatherHealth >= 80) {
    growth.push("Ayah mulai bernapas lebih lega setelah perawatanmu yang konsisten.");
  }

  if (worldState.stress >= 75) {
    urgent.push("Stres memuncak. Sisihkan waktu untuk menurunkan tekanan sebelum membuat keputusan.");
  } else if (worldState.stress <= 30) {
    growth.push("Stres terkendali; manfaatkan kejernihan pikiran untuk menyusun strategi.");
  }

  if (worldState.fatigue >= 70) {
    urgent.push("Kelelahanmu ekstrem. Istirahat sejenak dapat mencegah tubuh tumbang.");
  } else if (worldState.fatigue <= 25) {
    growth.push("Energi tubuh cukup untuk menangani pekerjaan yang berat.");
  }

  if (worldState.trauma >= 60) {
    urgent.push("Trauma mendekati batas aman. Cari dukungan emosional untuk menjaga ketahanan mental.");
  } else if (worldState.trauma <= 20) {
    growth.push("Ketahanan mentalmu stabil—manfaatkan untuk negosiasi yang menegangkan.");
  }

  if (worldState.money >= 5_000_000 && worldState.debt > 0) {
    financial.push("Dana yang ada cukup untuk menawar cicilan darurat agar penagih mereda.");
  }

  if (worldState.debt <= 40_000_000) {
    financial.push("Utang mulai terpangkas signifikan. Jaga momentum pembayaranmu.");
  } else if (worldState.debt >= 90_000_000) {
    financial.push("Bunga membuat utang membengkak. Pertimbangkan langkah agresif atau negosiasi baru.");
  }

  if (worldState.flags.awaitingDina && !worldState.flags.dinaArrived) {
    financial.push("Dina dalam perjalanan membawa bantuan; siapkan daftar kebutuhan yang ingin kamu sampaikan.");
  }

  const dinaOutstanding = worldState.flags.dinaLoanOutstanding || 0;
  if (dinaOutstanding > 0 && worldState.flags.dinaArrived) {
    const due = worldState.flags.dinaLoanDue;
    if (due) {
      const hoursRemaining = (due.day - worldState.day) * 24 + (due.hour - worldState.hour);
      if (hoursRemaining <= 0) {
        financial.push("Dina menunggu kabar pembayaran—segera kirim cicilan agar kepercayaannya terjaga.");
      } else if (hoursRemaining <= 24) {
        financial.push("Jatuh tempo cicilan Dina tinggal kurang dari sehari. Sisihkan dana sekarang.");
      } else {
        financial.push(`Sisa pinjaman Dina ${formatCurrency(dinaOutstanding)}. Atur cicilan sebelum tenggat berikutnya.`);
      }
    }
  } else if (worldState.flags.dinaArrived && dinaOutstanding === 0) {
    financial.push("Pinjaman Dina sudah lunas—kamu bebas fokus ke strategi jangka panjang.");
  }

  const awarenessStat = stats.awareness.value;
  if (awarenessStat >= 65) {
    growth.push("Kewaspadaanmu tinggi; kamu membaca pola gerak para penagih bahkan sebelum mereka mengetuk.");
  } else if (awarenessStat <= 30) {
    growth.push("Kewaspadaanmu menurun. Pertimbangkan untuk meninjau ulang informasi agar tidak kecolongan.");
  }

  const willpowerStat = stats.willpower.value;
  if (willpowerStat >= 70) {
    growth.push("Tekadmu kokoh; rasa takut tidak mudah menggoyahkan fokusmu.");
  } else if (willpowerStat <= 25) {
    growth.push("Tekadmu nyaris habis. Cari dukungan emosional sebelum membuat keputusan besar.");
  }

  const networkingStat = stats.networking.value;
  if (networkingStat >= 55) {
    growth.push("Jaringan sosialmu siap digerakkan kapan saja untuk mencari bantuan baru.");
  } else if (networkingStat <= 25) {
    growth.push("Jaringan dukunganmu masih sempit; cobalah menghubungi orang tepercaya lainnya.");
  }

  if (stats.deviancy.value >= 60) {
    growth.push("Inovasi tinggi membuatmu berani mencoba langkah tidak umum untuk mematahkan tekanan.");
  }

  if (stats.purity.value <= 30) {
    growth.push("Integritasmu mulai goyah. Pastikan kompromi tidak meninggalkan luka permanen.");
  }

  const resilienceStat = stats.resilience.value;
  if (resilienceStat >= 65) {
    growth.push("Resiliensi tinggi membuatmu sanggup berjaga lebih lama tanpa kehilangan fokus.");
  }

  const assertivenessStat = stats.assertiveness.value;
  if (assertivenessStat >= 40) {
    growth.push("Ketegasanmu tinggi. Gunakan dengan bijak agar tidak berubah menjadi ancaman balik.");
  }

  const ingenuityStat = stats.ingenuity.value;
  if (ingenuityStat >= 60) {
    strategy.push("Kecakapan bisnismu cukup untuk mengembangkan sumber pendapatan di rumah.");
  } else if (ingenuityStat <= 30) {
    growth.push("Kecakapan bisnismu masih terbatas—riset usaha rumahan bisa membuka peluang baru.");
  }

  if (!worldState.flags.homeBusinessPlan && ingenuityStat >= 45) {
    strategy.push("Coba riset usaha rumahan; tetangga siap membantu pre-order jika kamu menawarkan solusi hangat.");
  } else if (worldState.flags.homeBusinessPlan) {
    if (!worldState.flags.homeBusinessLaunched) {
      strategy.push("Rencana usaha sudah siap. Mulai buka pre-order agar pemasukan tambahan mengalir.");
    } else {
      const momentum = worldState.flags.homeBusinessMomentum || 0;
      if (momentum >= 3) {
        strategy.push("Pre-order tetangga mulai stabil—atur jadwal agar bebanmu tidak menumpuk.");
      } else {
        strategy.push("Jaga ritme pre-order agar usaha sampinganmu terus menambah kas keluarga.");
      }
    }
  }

  const confidenceStat = stats.confidence.value;
  if (!worldState.flags.creatorChannel && confidenceStat >= 50) {
    strategy.push("Modal percaya dirimu cukup untuk mulai rekam konten dukungan dan bangun audiens.");
  } else if (worldState.flags.creatorChannel) {
    const creatorMomentum = worldState.flags.creatorMomentum || 0;
    if (creatorMomentum >= 3) {
      strategy.push("Audiensmu mulai loyal. Jadwalkan siaran rutin agar donasi tetap mengalir.");
    } else {
      strategy.push("Update singkat di kanal dukungan bisa memantik tips baru tanpa menambah stres.");
    }
  }

  const combined = [...urgent, ...strategy, ...financial, ...growth];
  return combined.slice(0, 4);
}

function renderScene(narratives = [], changeRecords = []) {
  updateStatusSummary();
  if (statusMetricsElement) {
    updateStatusPanel(worldState);
  }
  updateMiniMap(worldState.location);

  const aggregated = aggregateChanges(changeRecords);
  const insights = getInsights();
  recordConditionNotes(insights);
  refreshJournal();
  if (feedbackElement) {
    const shouldShowInsights = showInsightsInFeedback && insights.length > 0;
    renderFeedback(
      feedbackElement,
      aggregated,
      shouldShowInsights ? insights : [],
      (key) => allStatsMetadata.get(key),
      formatChange,
    );
    if (shouldShowInsights) {
      showInsightsInFeedback = false;
    }
  }

  const location = locations[worldState.location];
  const paragraphs = [];
  const clock = formatTime(worldState.hour, worldState.minute);
  const calendar = formatCalendarDate(worldState);
  const segment = describeDaySegment(worldState.hour).toLowerCase();
  paragraphs.push(
    `Hari ${worldState.day} (${calendar}), ${clock} (${segment}) di ${location?.name ?? "???"}.`,
  );
  if (location) {
    const description = location.description?.(worldState);
    if (description) {
      paragraphs.push(description);
    }
  }
  narratives.forEach((text) => {
    if (text) {
      paragraphs.push(text);
    }
  });

  if (storyElement) {
    setStoryText(storyElement, paragraphs);
  }

  if (gameEnded) {
    if (choicesElement) {
      clearChoiceHotkeys();
      choicesElement.innerHTML = "";
      const endingLabel = document.createElement("p");
      endingLabel.className = "subtitle";
      endingLabel.textContent = currentEnding?.label ?? "Permainan Berakhir";
      choicesElement.appendChild(endingLabel);
    }
    if (restartButton) {
      restartButton.hidden = false;
      restartButton.focus();
    }
    return;
  }

  renderChoicesForLocation(location ?? { actions: [], connections: [] });
  if (restartButton) {
    restartButton.hidden = true;
  }
  if (storyElement && typeof storyElement.focus === "function") {
    try {
      storyElement.focus({ preventScroll: true });
    } catch (error) {
      storyElement.focus();
    }
  }
}

function describeCollectorDeadline() {
  if (worldState.flags.collectorUltimatum) {
    return "Ultimatum kolektor: siapkan minimal Rp10.000.000";
  }
  if (worldState.flags.nextCollectorVisit) {
    return `Tenggat kolektor: ${formatFutureSchedule(worldState.flags.nextCollectorVisit)}`;
  }
  if (!worldState.flags.debtCollectorKnock) {
    return "Penagih tiba pukul 23.00";
  }
  return "";
}

function describeLoanDeadline() {
  const outstanding = worldState.flags.dinaLoanOutstanding || 0;
  const due = worldState.flags.dinaLoanDue;
  if (outstanding > 0 && due) {
    return `Cicilan Dina (${formatCurrency(outstanding)}): ${formatFutureSchedule(due)}`;
  }
  return "";
}

function performAction(id) {
  if (gameEnded) return;
  const action = actionLibrary[id];
  if (!action) return;
  if (typeof action.condition === "function" && !action.condition(worldState)) {
    return;
  }

  let narratives = [];
  let changeRecords = [];

  const outcome = resolveActionOutcome(action, worldState);

  if (Object.keys(outcome.baseEffects).length) {
    changeRecords = changeRecords.concat(applyEffects(outcome.baseEffects));
  }
  if (Object.keys(outcome.statusChanges).length) {
    changeRecords = changeRecords.concat(applyStatusChanges(outcome.statusChanges));
  }

  const narrative = typeof action.narrative === "function" ? action.narrative(worldState) : action.narrative;
  if (narrative) {
    narratives.push(narrative);
  }

  if (outcome.notes.length) {
    narratives = narratives.concat(outcome.notes);
  }

  const afterText = action.after?.(worldState);
  if (afterText) {
    narratives.push(afterText);
  }

  const timeCost = action.time ?? 1;
  if (timeCost > 0) {
    changeRecords = changeRecords.concat(advanceTime(timeCost));
  }

  const eventResults = handleEvents();
  changeRecords = changeRecords.concat(eventResults.changes);
  narratives = narratives.concat(eventResults.narratives);

  const ending = checkEndConditions();
  if (ending) {
    finishGame(ending, narratives, changeRecords);
    return;
  }

  renderScene(narratives, changeRecords);
}

function moveTo(target) {
  if (gameEnded) return;
  const destination = locations[target];
  if (!destination) return;
  worldState.location = target;
  updateStatusSummary();
  updateMiniMap(worldState.location);

  let narratives = [`Kamu bergerak menuju ${destination.name.toLowerCase()}.`];
  const travelChanges = advanceTime(0.25);
  const eventResults = handleEvents();
  const changeRecords = travelChanges.concat(eventResults.changes);
  narratives = narratives.concat(eventResults.narratives);

  const ending = checkEndConditions();
  if (ending) {
    finishGame(ending, narratives, changeRecords);
    return;
  }

  renderScene(narratives, changeRecords);
}

function checkEndConditions() {
  if (worldState.fatherHealth <= 5) {
    return {
      label: "Akhir: Ayah Kolaps",
      narrative:
        "Tanpa perawatan intensif, Ayah tiba-tiba tidak sadarkan diri. Kamu panik menelepon ambulans sambil merasa gagal menjaga rumah.",
      statusChanges: { stress: 12, trauma: 12 },
    };
  }

  if (worldState.hoursSinceRest >= 72) {
    return {
      label: "Akhir: Tubuh Menyerah",
      narrative:
        "Tiga hari tanpa tidur membuatmu rubuh di lantai. Ketika sadar di klinik darurat, kamu mendapati Ayah sendirian menunggu bantuan.",
      statusChanges: { stress: 10, trauma: 10 },
    };
  }

  if (worldState.trauma >= 95 || worldState.stress >= 100) {
    return {
      label: "Akhir: Tumbang oleh Tekanan",
      narrative:
        "Tubuhmu gemetar hebat dan pandangan menghitam. Beban psikologis malam ini membuatmu roboh sebelum bantuan tiba.",
    };
  }

  if (worldState.debt <= 0) {
    return {
      label: "Akhir: Jalan Keluar Terbuka",
      narrative:
        "Transfer terakhir menghapus saldo utang. Untuk pertama kalinya dalam berbulan-bulan, rumah terasa sunyi tanpa ancaman.",
      baseEffects: { purity: 3, willpower: 3 },
    };
  }

  return null;
}

function finishGame(ending, narratives, changeRecords) {
  gameEnded = true;
  currentEnding = ending;
  if (ending.baseEffects) {
    changeRecords = changeRecords.concat(applyEffects(ending.baseEffects));
  }
  if (ending.statusChanges) {
    changeRecords = changeRecords.concat(applyStatusChanges(ending.statusChanges));
  }
  if (ending.narrative) {
    narratives.push(ending.narrative);
  }
  renderScene(narratives, changeRecords);
}

function buildJournalEntries() {
  const entries = [];

  if (!worldState.flags.debtCollectorKnock) {
    entries.push({
      title: "Ketukan Penagih",
      time: "Malam ini pukul 23.00",
      description:
        "Penagih akan kembali memastikan tagihanmu. Siapkan strategi bicara atau dana dadakan agar tekanan tidak meningkat.",
    });
  }

  if (worldState.flags.nextCollectorVisit) {
    entries.push({
      title: "Ultimatum Kolektor",
      time: formatFutureSchedule(worldState.flags.nextCollectorVisit),
      description:
        "Mereka menagih minimal sepuluh juta. Pastikan ada rencana pembayaran atau dukungan tetangga yang siap membantumu.",
    });
  }

  if (worldState.flags.awaitingDina) {
    entries.push({
      title: "Kedatangan Dina",
      time: "Sekitar pukul 06.00",
      description: "Dina membawa bantuan finansial dan dukungan emosional. Catat kebutuhan prioritas sebelum ia tiba.",
    });
  }

  if (worldState.flags.dinaLoanOutstanding > 0 && worldState.flags.dinaLoanDue) {
    entries.push({
      title: "Jatuh Tempo Cicilan Dina",
      time: formatFutureSchedule(worldState.flags.dinaLoanDue),
      description: `Sisa pinjaman ${formatCurrency(worldState.flags.dinaLoanOutstanding)}. Kirim cicilan agar kepercayaan tetap terjaga.`,
    });
  }

  const conditionNotes = getConditionNotesForJournal();
  if (conditionNotes.length) {
    const latest = conditionNotes[0];
    entries.push({
      title: "Catatan Kondisi",
      time: `Diperbarui ${latest.time}`,
      items: conditionNotes.map((note) => ({ text: note.text, time: note.time })),
    });
  }

  return entries;
}

function formatFutureSchedule(schedule) {
  if (!schedule) return "Segera";
  const diffHours = (schedule.day - worldState.day) * 24 + (schedule.hour - worldState.hour);
  if (diffHours <= 0) {
    return "Sebentar lagi";
  }
  if (diffHours < 24) {
    return `Dalam ${Math.max(1, Math.round(diffHours))} jam`;
  }
  const days = Math.floor(diffHours / 24);
  return `Dalam ${days} hari pukul ${formatTime(schedule.hour)}`;
}

export { performAction, moveTo };

function getConditionNotesForJournal() {
  const notes = Array.from(conditionNoteMap.values()).sort((a, b) => b.sequence - a.sequence);
  return notes.slice(0, 8);
}

function recordConditionNotes(insights = []) {
  if (!Array.isArray(insights) || !insights.length) {
    return;
  }
  const calendar = formatCalendarDate(worldState);
  const time = formatTime(worldState.hour, worldState.minute);
  const label = `${calendar} • ${time}`;
  insights.forEach((text) => {
    if (!text) {
      return;
    }
    const existing = conditionNoteMap.get(text);
    conditionNoteSequence += 1;
    if (existing) {
      existing.time = label;
      existing.sequence = conditionNoteSequence;
    } else {
      conditionNoteMap.set(text, { text, time: label, sequence: conditionNoteSequence });
    }
  });
}

function setStatsPanelVisibility(visible) {
  statsPanelVisible = Boolean(visible);
  if (!statsElement || !toggleStatsButton) {
    return;
  }

  onStatsVisibilityChange(statsPanelVisible);

  if (!statsPanelVisible) {
    const active = document.activeElement;
    if (active instanceof HTMLElement && statsElement.contains(active)) {
      toggleStatsButton.focus();
    }
  }

  const expanded = statsPanelVisible ? "true" : "false";
  toggleStatsButton.setAttribute("aria-expanded", expanded);
  toggleStatsButton.setAttribute("aria-pressed", expanded);
  toggleStatsButton.textContent = statsPanelVisible
    ? "Sembunyikan Stat Karakter"
    : "Tampilkan Stat Karakter";
}
