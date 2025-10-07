import { baseStats, statsOrder, createInitialStats } from "../config/stats.js";
import { statusConfig } from "../config/status.js";
import { actionLibrary } from "./actions.js";
import { locations } from "../story/locations.js";
import { scheduledEvents, randomEvents } from "../story/events.js";
import { initializeStatsUI, updateStatsUI } from "../ui/statsPanel.js";
import { initializeStatusPanel, updateStatusPanel } from "../ui/statusPanel.js";
import { renderFeedback } from "../ui/feedbackPanel.js";
import { setStoryText } from "../ui/storyRenderer.js";
import { initializeMiniMap, updateMiniMap } from "../ui/mapPanel.js";
import { initializeJournal, refreshJournal, closeJournal } from "../ui/journal.js";
import { formatCurrency, formatChange } from "../util/format.js";
import { clamp, normalizeValue } from "../util/math.js";
import { formatTime, formatCalendarDate, formatDuration, advanceCalendarDay } from "../util/time.js";

const stats = createInitialStats();
const allStatsMetadata = new Map();

let worldState = createInitialWorldState();
let gameEnded = false;
let currentEnding = null;

let statsElement;
let statusSummaryElement;
let statusMetricsElement;
let storyElement;
let feedbackElement;
let choicesElement;
let restartButton;
let toggleStatsButton;
let journalButton;
let journalPanel;
let miniMapContainer;
let statsPanelVisible = false;

export function initializeGame() {
  statsElement = document.getElementById("stats");
  statusSummaryElement = document.getElementById("statusSummary");
  statusMetricsElement = document.getElementById("statusMetrics");
  storyElement = document.getElementById("story");
  feedbackElement = document.getElementById("feedback");
  choicesElement = document.getElementById("choices");
  restartButton = document.getElementById("restart");
  toggleStatsButton = document.getElementById("toggleStats");
  journalButton = document.getElementById("journalButton");
  journalPanel = document.getElementById("journalPanel");
  miniMapContainer = document.getElementById("miniMap");

  buildMetadata();
  initializeStatsUI(statsElement, stats);
  initializeStatusPanel(statusMetricsElement, worldState);
  initializeMiniMap(miniMapContainer);
  initializeJournal(journalButton, journalPanel, () => buildJournalEntries());

  toggleStatsButton.addEventListener("click", () => {
    setStatsPanelVisibility(!statsPanelVisible);
  });

  restartButton.addEventListener("click", () => {
    resetGame();
  });

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
    });
  });
  Object.entries(statusConfig).forEach(([key, meta]) => {
    allStatsMetadata.set(key, {
      alias: meta.alias,
      formatChange: meta.formatChange,
      positiveIsGood: meta.positiveIsGood ?? true,
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
    debtInterestRate: 0.018,
    hoursSinceFatherCare: 1,
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
  resetStats();
  updateStatusSummary();
  updateStatusPanel(worldState);
  updateMiniMap(worldState.location);
  feedbackElement.innerHTML = "";
  setStatsPanelVisibility(false);
  closeJournal();

  const introText =
    "Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar. Para penagih masih berjaga di depan pagar.";
  renderScene([introText], []);
}

function updateStatusSummary() {
  const location = locations[worldState.location];
  const clock = formatTime(worldState.hour, worldState.minute);
  const calendar = formatCalendarDate(worldState);
  statusSummaryElement.textContent = `Hari ${worldState.day} (${calendar}) • ${clock} • ${
    location?.name ?? "Lokasi tidak dikenal"
  }`;
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
    updateStatusPanel(worldState);
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
    }
  }

  if (traits.has("mental") || traits.has("planning") || traits.has("work")) {
    if (willpower >= 65) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 0.7 : value * 1.15));
      incrementEffect(baseEffects, "willpower", 0.5);
      notes.push("Tekad tinggi membantumu tetap fokus di tengah tekanan.");
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
  }

  if (traits.has("social")) {
    if (beauty >= 60) {
      adjustChange(statusChanges, "stress", (value) => (value < 0 ? value * 1.2 : value * 0.9));
      notes.push("Pembawaan percaya diri membuat interaksi berjalan mulus.");
    } else if (beauty <= 35) {
      adjustChange(statusChanges, "stress", (value) => (value > 0 ? value * 1.1 : value * 0.85));
      notes.push("Rasa canggung sedikit mengurangi hasil interaksimu.");
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
  if (!effects) return "";
  const parts = [];
  Object.entries(effects).forEach(([key, amount]) => {
    if (!amount) return;
    const metadata = allStatsMetadata.get(key);
    if (!metadata) return;
    const formatter = metadata.formatChange ?? formatChange;
    parts.push(`${metadata.alias} ${formatter(amount)}`);
  });
  return parts.join(", ");
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

    if (worldState.stress >= 80) {
      aggregate.trauma = (aggregate.trauma || 0) + applyStatusDelta("trauma", 0.6 * portion);
    }
  }

  updateStatusPanel(worldState);
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
    updateStatusPanel(worldState);
    updateStatusSummary();
  }

  return { narratives, changes: changeRecords };
}

function renderChoicesForLocation(location) {
  choicesElement.innerHTML = "";

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

    const label = document.createElement("span");
    label.textContent = action.label;
    button.appendChild(label);

    const outcomePreview = resolveActionOutcome(action, worldState);
    const preview = describeCombinedEffects(outcomePreview.baseEffects, outcomePreview.statusChanges);
    const durationText = formatDuration(action.time ?? 1);
    if (preview) {
      const hint = document.createElement("span");
      hint.className = "choice-hint";
      hint.textContent = preview;
      button.appendChild(hint);
      button.setAttribute("aria-label", `${action.label}. Durasi ${durationText}. ${preview}`);
    } else {
      button.setAttribute("aria-label", `${action.label}. Durasi ${durationText}.`);
    }

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

    button.addEventListener("click", () => performAction(actionRef.id));
    choicesElement.appendChild(button);
  });

  const connections = location.connections || [];
  connections.forEach((target) => {
    const targetLocation = locations[target];
    if (!targetLocation) return;
    const button = document.createElement("button");
    button.className = "button secondary";
    button.type = "button";
    const label = document.createElement("span");
    label.textContent = `Pergi ke ${targetLocation.name}`;
    button.appendChild(label);
    button.setAttribute("aria-label", `Pergi ke ${targetLocation.name}`);
    button.addEventListener("click", () => moveTo(target));
    choicesElement.appendChild(button);
  });

  if (!choicesElement.children.length) {
    const note = document.createElement("p");
    note.className = "subtitle";
    note.textContent = "Tidak ada tindakan yang tersedia saat ini.";
    choicesElement.appendChild(note);
  }
}

function getInsights() {
  const hints = [];

  if (worldState.fatherHealth <= 40) {
    hints.push("Kesehatan Ayah melemah; ganti kompres atau beri obat untuk menstabilkannya.");
  } else if (worldState.fatherHealth >= 80) {
    hints.push("Ayah mulai bernapas lebih lega setelah perawatanmu yang konsisten.");
  }

  if (worldState.stress >= 75) {
    hints.push("Stres memuncak. Sisihkan waktu untuk menurunkan tekanan sebelum membuat keputusan.");
  } else if (worldState.stress <= 30) {
    hints.push("Stres terkendali; manfaatkan kejernihan pikiran untuk menyusun strategi.");
  }

  if (worldState.fatigue >= 70) {
    hints.push("Kelelahanmu ekstrem. Istirahat sejenak dapat mencegah tubuh tumbang.");
  } else if (worldState.fatigue <= 25) {
    hints.push("Energi tubuh cukup untuk menangani pekerjaan yang berat.");
  }

  if (worldState.trauma >= 60) {
    hints.push("Trauma mendekati batas aman. Cari dukungan emosional untuk menjaga ketahanan mental.");
  } else if (worldState.trauma <= 20) {
    hints.push("Ketahanan mentalmu stabil—manfaatkan untuk negosiasi yang menegangkan.");
  }

  if (worldState.money >= 5_000_000 && worldState.debt > 0) {
    hints.push("Dana yang ada cukup untuk menawar cicilan darurat agar penagih mereda.");
  }

  if (worldState.debt <= 40_000_000) {
    hints.push("Utang mulai terpangkas signifikan. Jaga momentum pembayaranmu.");
  } else if (worldState.debt >= 90_000_000) {
    hints.push("Bunga membuat utang membengkak. Pertimbangkan langkah agresif atau negosiasi baru.");
  }

  if (worldState.flags.awaitingDina && !worldState.flags.dinaArrived) {
    hints.push("Dina dalam perjalanan membawa bantuan; siapkan daftar kebutuhan yang ingin kamu sampaikan.");
  }

  const dinaOutstanding = worldState.flags.dinaLoanOutstanding || 0;
  if (dinaOutstanding > 0 && worldState.flags.dinaArrived) {
    const due = worldState.flags.dinaLoanDue;
    if (due) {
      const hoursRemaining = (due.day - worldState.day) * 24 + (due.hour - worldState.hour);
      if (hoursRemaining <= 0) {
        hints.push("Dina menunggu kabar pembayaran—segera kirim cicilan agar kepercayaannya terjaga.");
      } else if (hoursRemaining <= 24) {
        hints.push("Jatuh tempo cicilan Dina tinggal kurang dari sehari. Sisihkan dana sekarang.");
      } else {
        hints.push(`Sisa pinjaman Dina ${formatCurrency(dinaOutstanding)}. Atur cicilan sebelum tenggat berikutnya.`);
      }
    }
  } else if (worldState.flags.dinaArrived && dinaOutstanding === 0) {
    hints.push("Pinjaman Dina sudah lunas—kamu bebas fokus ke strategi jangka panjang.");
  }

  if (stats.awareness.value >= 65) {
    hints.push("Kewaspadaanmu tinggi; kamu membaca pola gerak para penagih bahkan sebelum mereka mengetuk.");
  } else if (stats.awareness.value <= 30) {
    hints.push("Kewaspadaanmu menurun. Pertimbangkan untuk meninjau ulang informasi agar tidak kecolongan.");
  }

  if (stats.willpower.value >= 70) {
    hints.push("Tekadmu kokoh; rasa takut tidak mudah menggoyahkan fokusmu.");
  } else if (stats.willpower.value <= 25) {
    hints.push("Tekadmu nyaris habis. Cari dukungan emosional sebelum membuat keputusan besar.");
  }

  if (stats.promiscuity.value >= 55) {
    hints.push("Jejaring sosialmu siap digerakkan kapan saja untuk mencari bantuan baru.");
  } else if (stats.promiscuity.value <= 25) {
    hints.push("Jejaring dukunganmu masih sempit; cobalah menghubungi orang tepercaya lainnya.");
  }

  if (stats.deviancy.value >= 60) {
    hints.push("Inovasi tinggi membuatmu berani mencoba langkah tidak umum untuk mematahkan tekanan.");
  }

  if (stats.purity.value <= 30) {
    hints.push("Integritasmu mulai goyah. Pastikan kompromi tidak meninggalkan luka permanen.");
  }

  if (stats.masochism.value >= 65) {
    hints.push("Daya tahanmu kuat; kamu mampu berjaga tanpa tidur jika keadaan memaksa.");
  }

  if (stats.sadism.value >= 40) {
    hints.push("Ketegasanmu tinggi. Gunakan dengan bijak agar tidak berubah menjadi ancaman balik.");
  }

  return hints.slice(0, 4);
}

function renderScene(narratives = [], changeRecords = []) {
  updateStatusSummary();
  updateStatusPanel(worldState);
  updateMiniMap(worldState.location);
  refreshJournal();

  const aggregated = aggregateChanges(changeRecords);
  const insights = getInsights();
  renderFeedback(
    feedbackElement,
    aggregated,
    insights,
    (key) => allStatsMetadata.get(key),
    formatChange,
  );

  const location = locations[worldState.location];
  const paragraphs = [];
  const clock = formatTime(worldState.hour, worldState.minute);
  const calendar = formatCalendarDate(worldState);
  paragraphs.push(`Hari ${worldState.day} (${calendar}), ${clock} di ${location?.name ?? "???"}.`);
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

  setStoryText(storyElement, paragraphs);

  if (gameEnded) {
    choicesElement.innerHTML = "";
    const endingLabel = document.createElement("p");
    endingLabel.className = "subtitle";
    endingLabel.textContent = currentEnding?.label ?? "Permainan Berakhir";
    choicesElement.appendChild(endingLabel);
    restartButton.hidden = false;
    restartButton.focus();
    return;
  }

  renderChoicesForLocation(location ?? { actions: [], connections: [] });
  restartButton.hidden = true;
  storyElement.focus();
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

function setStatsPanelVisibility(visible) {
  statsPanelVisible = Boolean(visible);
  if (!statsElement || !toggleStatsButton) {
    return;
  }

  if (statsPanelVisible) {
    statsElement.hidden = false;
    statsElement.removeAttribute("hidden");
  } else {
    statsElement.hidden = true;
    if (!statsElement.hasAttribute("hidden")) {
      statsElement.setAttribute("hidden", "");
    }
  }

  toggleStatsButton.setAttribute("aria-expanded", statsPanelVisible ? "true" : "false");
  toggleStatsButton.textContent = statsPanelVisible
    ? "Sembunyikan Stat Karakter"
    : "Tampilkan Stat Karakter";
}
