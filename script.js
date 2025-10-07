const statsElement = document.getElementById("stats");
const statusElement = document.getElementById("status");
const statusSummaryElement = document.getElementById("statusSummary");
const statusMetricsElement = document.getElementById("statusMetrics");
const toggleStatsButton = document.getElementById("toggleStats");
const storyElement = document.getElementById("story");
const feedbackElement = document.getElementById("feedback");
const choicesElement = document.getElementById("choices");
const restartButton = document.getElementById("restart");

const baseStats = {
  awareness: {
    displayName: "Awareness",
    alias: "Kewaspadaan",
    description:
      "Mengukur seberapa tajam kamu membaca ancaman finansial dan peluang bantuan di sekitar.",
    max: 100,
    initial: 45,
  },
  purity: {
    displayName: "Purity",
    alias: "Integritas",
    description:
      "Menjaga kompas moral dan tujuan jangka panjang agar tetap lurus saat mengambil keputusan sulit.",
    max: 100,
    initial: 55,
  },
  physique: {
    displayName: "Physique",
    alias: "Kebugaran",
    description:
      "Stamina fisik untuk merawat Ayah, bekerja lembur, dan bertahan dari malam yang panjang.",
    max: 100,
    initial: 48,
  },
  willpower: {
    displayName: "Willpower",
    alias: "Tekad",
    description:
      "Kekuatan mental menghadapi tekanan psikologis, rasa takut, dan ancaman yang datang bertubi-tubi.",
    max: 100,
    initial: 52,
  },
  beauty: {
    displayName: "Beauty",
    alias: "Performa",
    description:
      "Cara kamu membawa diri—rapi, percaya diri, dan persuasif saat meminta dukungan orang lain.",
    max: 100,
    initial: 46,
  },
  promiscuity: {
    displayName: "Promiscuity",
    alias: "Keluwesan Relasi",
    description:
      "Kemampuan menjalin jaringan dukungan lintas komunitas tanpa ragu menjelaskan kebutuhanmu.",
    max: 100,
    initial: 35,
  },
  exhibitionism: {
    displayName: "Exhibitionism",
    alias: "Keberanian Tampil",
    description:
      "Kesiapanmu berbicara terbuka soal situasi keluarga kepada orang lain atau otoritas.",
    max: 100,
    initial: 32,
  },
  deviancy: {
    displayName: "Deviancy",
    alias: "Inovasi",
    description:
      "Kesediaan mencoba strategi tak lazim demi menciptakan ruang aman dan solusi baru.",
    max: 100,
    initial: 28,
  },
  masochism: {
    displayName: "Masochism",
    alias: "Daya Tahan Tekanan",
    description:
      "Kemampuan menerima lelah, takut, dan malu sementara demi visi yang lebih besar untuk keluarga.",
    max: 100,
    initial: 44,
  },
  sadism: {
    displayName: "Sadism",
    alias: "Ketegasan Menghadapi",
    description:
      "Kemauan menekan balik dan menetapkan batas tegas terhadap pihak yang menindas.",
    max: 100,
    initial: 20,
  },
};

const statsOrder = [
  "awareness",
  "purity",
  "physique",
  "willpower",
  "beauty",
  "promiscuity",
  "exhibitionism",
  "deviancy",
  "masochism",
  "sadism",
];

const tierLabels = ["", "Pemula", "Terkondisi", "Tangkas", "Berdaya", "Visioner"];

const stats = Object.fromEntries(
  statsOrder.map((key) => [key, { ...baseStats[key], value: baseStats[key].initial }]),
);

const statElements = new Map();

function formatCurrency(value) {
  const rounded = Math.round(value);
  const prefix = rounded < 0 ? "-Rp" : "Rp";
  return `${prefix}${Math.abs(rounded).toLocaleString("id-ID")}`;
}

function formatCurrencyChange(amount) {
  if (Math.abs(amount) < 1) {
    return amount >= 0 ? "+Rp0" : "-Rp0";
  }
  const sign = amount > 0 ? "+" : "-";
  return `${sign}Rp${Math.abs(Math.round(amount)).toLocaleString("id-ID")}`;
}

function formatSignedNumber(value, decimals = 1) {
  const threshold = Math.pow(10, -decimals) / 2;
  if (Math.abs(value) < threshold) {
    return "0";
  }
  const sign = value > 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(decimals)}`;
}

function formatSignedPercent(value, decimals = 1) {
  const threshold = Math.pow(10, -decimals) / 2;
  if (Math.abs(value) < threshold) {
    return `0%`;
  }
  const sign = value > 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

const statusConfig = {
  fatherHealth: {
    alias: "Kesehatan Ayah",
    min: 0,
    max: 100,
    meter: true,
    positiveIsGood: true,
    formatValue: (value) => `${Math.round(value)}%`,
    formatChange: (amount) => formatSignedPercent(amount, 1),
  },
  stress: {
    alias: "Stres",
    min: 0,
    max: 100,
    meter: true,
    positiveIsGood: false,
    formatValue: (value) => `${Math.round(value)}/100`,
    formatChange: (amount) => formatSignedNumber(amount, 1),
  },
  fatigue: {
    alias: "Fatigue",
    min: 0,
    max: 100,
    meter: true,
    positiveIsGood: false,
    formatValue: (value) => `${Math.round(value)}/100`,
    formatChange: (amount) => formatSignedNumber(amount, 1),
  },
  trauma: {
    alias: "Trauma",
    min: 0,
    max: 100,
    meter: true,
    positiveIsGood: false,
    formatValue: (value) => `${Math.round(value)}/100`,
    formatChange: (amount) => formatSignedNumber(amount, 1),
  },
  money: {
    alias: "Uang Tunai",
    positiveIsGood: true,
    formatValue: (value) => formatCurrency(value),
    formatChange: (amount) => formatCurrencyChange(amount),
  },
  debt: {
    alias: "Utang Aktif",
    positiveIsGood: false,
    formatValue: (value) => formatCurrency(value),
    formatChange: (amount) => formatCurrencyChange(amount),
  },
  debtInterestRate: {
    alias: "Bunga Harian",
    positiveIsGood: false,
    formatValue: (value) => `${(value * 100).toFixed(2)}%`,
    formatChange: (amount) => formatSignedPercent(amount * 100, 2),
  },
};

const statusOrder = [
  "fatherHealth",
  "stress",
  "fatigue",
  "trauma",
  "money",
  "debt",
  "debtInterestRate",
];

const statusElements = new Map();

const allStatsMetadata = new Map();

statsOrder.forEach((key) => {
  const stat = stats[key];
  allStatsMetadata.set(key, {
    alias: stat.alias,
    formatChange: (amount) => formatChange(Math.round(amount)),
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

function initializeStatsUI() {
  statsElement.innerHTML = "";
  statsOrder.forEach((key) => {
    const stat = stats[key];
    const card = document.createElement("article");
    card.className = "stat-card";
    card.dataset.stat = key;
    card.tabIndex = 0;
    card.setAttribute(
      "aria-label",
      `${stat.displayName} (${stat.alias}). ${stat.description} Nilai awal ${stat.initial}.`,
    );

    const header = document.createElement("div");
    header.className = "stat-header";
    const name = document.createElement("span");
    name.className = "stat-name";
    name.textContent = stat.displayName;
    const alias = document.createElement("span");
    alias.className = "stat-alias";
    alias.textContent = stat.alias;
    header.append(name, alias);

    const progress = document.createElement("div");
    progress.className = "stat-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", String(stat.max));
    const bar = document.createElement("div");
    bar.className = "stat-bar";
    progress.appendChild(bar);

    const meta = document.createElement("div");
    meta.className = "stat-meta";
    const value = document.createElement("span");
    value.className = "stat-value";
    const tier = document.createElement("span");
    tier.className = "stat-tier";
    meta.append(value, tier);

    const description = document.createElement("p");
    description.className = "stat-description";
    description.textContent = stat.description;

    card.append(header, progress, meta, description);
    statsElement.appendChild(card);

    statElements.set(key, { card, bar, progress, value, tier });
  });
}

function initializeStatusUI() {
  statusMetricsElement.innerHTML = "";
  statusOrder.forEach((key) => {
    const meta = statusConfig[key];
    if (!meta) return;
    const card = document.createElement("article");
    card.className = "status-card";
    card.dataset.metric = key;
    if (meta.meter) {
      card.classList.add("status-card--meter");
    }

    const label = document.createElement("span");
    label.className = "status-label";
    label.textContent = meta.alias;

    const value = document.createElement("span");
    value.className = "status-value";

    card.append(label, value);

    let meterFill = null;
    if (meta.meter) {
      const meter = document.createElement("div");
      meter.className = "status-meter";
      meterFill = document.createElement("div");
      meterFill.className = "status-meter-fill";
      meter.appendChild(meterFill);
      card.appendChild(meter);
    }

    statusMetricsElement.appendChild(card);
    statusElements.set(key, { card, value, meterFill });
  });
}

function updateStatsUI() {
  statsOrder.forEach((key) => {
    const stat = stats[key];
    const elements = statElements.get(key);
    if (!elements) return;
    const percent = Math.round((stat.value / stat.max) * 100);
    elements.bar.style.width = `${percent}%`;
    elements.progress.setAttribute("aria-valuenow", String(stat.value));
    elements.progress.setAttribute("aria-valuetext", `${stat.value} dari ${stat.max}`);
    elements.value.textContent = Math.round(stat.value);
    const tierLevel = getTier(stat.value, stat.max);
    elements.tier.textContent = `Level ${tierLevel} • ${tierLabels[tierLevel]}`;
    elements.card.dataset.tier = String(tierLevel);
  });
}

function updateStatusUI() {
  const location = locations[worldState.location];
  statusSummaryElement.textContent = `Hari ${worldState.day} • ${formatTime(worldState.hour)} • ${
    location?.name ?? "Lokasi tidak dikenal"
  }`;

  statusOrder.forEach((key) => {
    const meta = statusConfig[key];
    const elements = statusElements.get(key);
    if (!meta || !elements) return;
    const value = Number(worldState[key] ?? 0);
    elements.value.textContent = meta.formatValue ? meta.formatValue(value) : String(value);
    if (meta.meter && elements.meterFill) {
      const min = typeof meta.min === "number" ? meta.min : 0;
      const max = typeof meta.max === "number" ? meta.max : 100;
      const percent = ((value - min) / (max - min)) * 100;
      elements.meterFill.style.width = `${clamp(percent, 0, 100)}%`;
    }
  });
}

function getTier(value, max) {
  const ratio = value / max;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.8) return 4;
  return 5;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
      stat.value = next;
      changes.push({ key, amount: Math.round(next - previous) });
    }
  });
  if (changes.length) {
    updateStatsUI();
  }
  return changes;
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

function formatChange(amount) {
  return amount > 0 ? `+${amount}` : String(amount);
}

function renderFeedback(changes) {
  const aggregated = aggregateChanges(changes);
  const insights = getInsights();
  feedbackElement.innerHTML = "";

  if (aggregated.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Perubahan Stat";
    feedbackElement.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "stat-changes";
    aggregated.forEach((change) => {
      const metadata = allStatsMetadata.get(change.key);
      const alias = metadata?.alias ?? change.key;
      const positiveIsGood = metadata?.positiveIsGood !== false;
      const isPositive = change.amount > 0;
      const outcomePositive = (isPositive && positiveIsGood) || (!isPositive && !positiveIsGood);

      const item = document.createElement("li");
      item.className = `stat-change ${outcomePositive ? "positive" : "negative"}`;
      const label = document.createElement("span");
      label.textContent = alias;
      const value = document.createElement("span");
      const formatter = metadata?.formatChange ?? formatChange;
      value.textContent = formatter(change.amount);
      item.append(label, value);
      list.appendChild(item);
    });
    feedbackElement.appendChild(list);
  }

  if (insights.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Catatan Kondisi";
    feedbackElement.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "insights";
    insights.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
    feedbackElement.appendChild(list);
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
  }

  if (worldState.trauma >= 60) {
    hints.push("Trauma mendekati batas aman. Cari dukungan emosional untuk menjaga ketahanan mental.");
  }

  if (worldState.money >= 5000000 && worldState.debt > 0) {
    hints.push("Dana yang ada cukup untuk menawar cicilan darurat agar penagih mereda.");
  }

  if (worldState.debt <= 40000000) {
    hints.push("Utang mulai terpangkas signifikan. Jaga momentum pembayaranmu.");
  } else if (worldState.debt >= 90000000) {
    hints.push("Bunga membuat utang membengkak. Pertimbangkan langkah agresif atau negosiasi baru.");
  }

  if (worldState.flags.awaitingDina && !worldState.flags.dinaArrived) {
    hints.push("Dina dalam perjalanan membawa bantuan; siapkan daftar kebutuhan yang ingin kamu sampaikan.");
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

function setStoryText(content) {
  storyElement.innerHTML = "";
  const paragraphs = Array.isArray(content)
    ? content.filter(Boolean)
    : content
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    storyElement.appendChild(p);
  });
}

function formatTime(hour) {
  const normalized = ((hour % 24) + 24) % 24;
  return `${String(normalized).padStart(2, "0")}:00`;
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
      results.push({ key, amount: actual });
    }
  });
  if (results.length) {
    updateStatusUI();
  }
  return results;
}

function advanceTime(hours = 1) {
  if (!Number.isFinite(hours) || hours <= 0) {
    return [];
  }
  const aggregate = {};
  for (let i = 0; i < hours; i += 1) {
    worldState.hour += 1;
    if (worldState.hour >= 24) {
      worldState.hour = 0;
      worldState.day += 1;
    }

    const interest = worldState.debt * (worldState.debtInterestRate / 24);
    aggregate.debt = (aggregate.debt || 0) + applyStatusDelta("debt", interest);

    const stressGain = worldState.flags.safeWithSupport ? 0.4 : 0.9;
    aggregate.stress = (aggregate.stress || 0) + applyStatusDelta("stress", stressGain);

    aggregate.fatigue = (aggregate.fatigue || 0) + applyStatusDelta("fatigue", 1.4);

    worldState.hoursSinceFatherCare += 1;
    if (worldState.hoursSinceFatherCare >= 4) {
      aggregate.fatherHealth =
        (aggregate.fatherHealth || 0) + applyStatusDelta("fatherHealth", -1.5);
    }

    if (worldState.stress >= 80) {
      aggregate.trauma = (aggregate.trauma || 0) + applyStatusDelta("trauma", 0.6);
    }
  }

  updateStatusUI();
  return Object.entries(aggregate)
    .filter(([, amount]) => amount)
    .map(([key, amount]) => ({ key, amount }));
}

function createInitialWorldState() {
  return {
    day: 1,
    hour: 22,
    location: "ruangKeluarga",
    money: 350_000,
    debt: 80_000_000,
    debtInterestRate: 0.015,
    fatherHealth: 62,
    stress: 55,
    fatigue: 48,
    trauma: 24,
    hoursSinceFatherCare: 0,
    flags: {
      triggeredEvents: {},
      awaitingDina: false,
      dinaArrived: false,
      planPrepared: false,
      planSent: false,
      hasChronology: false,
      houseSecured: false,
      safeWithSupport: false,
      confrontedCollector: false,
      reviewedBills: false,
      debtCollectorKnock: false,
      nextCollectorVisit: null,
      extraGigTaken: false,
      preparedMedicine: false,
      collectorUltimatum: false,
    },
  };
}

let worldState = createInitialWorldState();
let gameEnded = false;
let currentEnding = null;

const actionLibrary = {
  bacaTagihan: {
    label: "Teliti tumpukan tagihan",
    time: 1,
    baseEffects: { awareness: 4, willpower: -1, deviancy: 1 },
    statusChanges: { stress: 3 },
    narrative: () =>
      "Ada daftar utang dari tiga koperasi. Totalnya 80 juta rupiah. Besok adalah tenggat terakhir salah satu tagihan.",
    after: (state) => {
      state.flags.reviewedBills = true;
    },
  },
  rekamKronologi: {
    label: "Susun kronologi intimidasi",
    time: 1,
    condition: (state) => !state.flags.hasChronology,
    baseEffects: { awareness: 2, exhibitionism: 1, sadism: 1 },
    statusChanges: { stress: -2 },
    narrative: () =>
      "Kamu menyiapkan ponsel untuk merekam dan menuliskan kronologi detail. Jika mereka memaksa masuk, kamu punya bukti.",
    after: (state) => {
      state.flags.hasChronology = true;
    },
  },
  hubungiDina: {
    label: "Hubungi Dina minta bantuan",
    time: 1,
    condition: (state) => !state.flags.awaitingDina && !state.flags.dinaArrived,
    baseEffects: { promiscuity: 3, willpower: 1, beauty: 1 },
    statusChanges: { stress: -3 },
    narrative: () =>
      "Dina menjawab dengan suara kantuk. Ia siap meminjamkan lima juta dan berjanji mampir begitu fajar.",
    after: (state) => {
      state.flags.awaitingDina = true;
      return "Ada harapan baru: Dina akan datang membawa bantuan dan makanan hangat.";
    },
  },
  latihanNapas: {
    label: "Latihan pernapasan 4-7-8",
    time: 1,
    condition: (state) => state.stress >= 25,
    baseEffects: { willpower: 1, purity: 1 },
    statusChanges: { stress: -6, trauma: -2, fatigue: -1 },
    narrative: () =>
      "Kamu memejamkan mata dan menjalankan pola napas 4-7-8. Dada terasa sedikit lebih ringan.",
  },
  bayarDebtSebagian: {
    label: "Transfer cicilan darurat (Rp2.000.000)",
    time: 1,
    condition: (state) => state.money >= 2_000_000 && state.debt > 0,
    baseEffects: { purity: 1, willpower: 1 },
    statusChanges: { money: -2_000_000, debt: -2_000_000, stress: -4 },
    narrative: () =>
      "Kamu membuka aplikasi bank dan mentransfer dua juta sebagai penegasan niat baik kepada debt collector.",
  },
  periksaAyah: {
    label: "Periksa kondisi Ayah",
    time: 1,
    baseEffects: { purity: 2, masochism: 2, willpower: 1, beauty: 1 },
    statusChanges: { fatherHealth: 8, stress: -4, fatigue: 2 },
    narrative: () =>
      "Ayah demam. Kamu mengganti kompres dan mengusap dahinya hingga napasnya kembali teratur.",
    after: (state) => {
      state.hoursSinceFatherCare = 0;
    },
  },
  istirahatPendek: {
    label: "Rebah sejenak sambil berjaga",
    time: 1,
    condition: (state) => state.fatigue >= 25,
    baseEffects: { masochism: -1, willpower: 1 },
    statusChanges: { fatigue: -14, stress: -3 },
    narrative: () =>
      "Kamu menyandarkan kepala di tepi ranjang tanpa benar-benar tidur. Setidaknya ototmu beristirahat sebentar.",
  },
  masakSup: {
    label: "Masak sup jahe hangat",
    time: 1,
    baseEffects: { purity: 1, beauty: 1 },
    statusChanges: { fatigue: -5, stress: -2, fatherHealth: 3 },
    narrative: () =>
      "Aroma jahe memenuhi dapur. Sup hangat siap kamu bawa untuk membantu Ayah menelan obat.",
  },
  siapkanObat: {
    label: "Siapkan obat dan air hangat",
    time: 1,
    condition: (state) => !state.flags.preparedMedicine,
    baseEffects: { purity: 1, masochism: 1 },
    statusChanges: { fatherHealth: 4, fatigue: 1 },
    narrative: () =>
      "Kamu menyusun obat penurun demam dan segelas air hangat, memastikan dosisnya aman.",
    after: (state) => {
      state.flags.preparedMedicine = true;
    },
  },
  pantauPenagih: {
    label: "Pantau penagih dari balik tirai",
    time: 1,
    baseEffects: { awareness: 3, exhibitionism: -1, masochism: 1 },
    statusChanges: { stress: 3 },
    narrative: () =>
      "Lewat tirai, kamu melihat dua orang lelaki bersandar di motor dengan map merah khas penagih.",
  },
  kunciRumah: {
    label: "Periksa dan kunci seluruh pintu",
    time: 1,
    baseEffects: { awareness: 2, masochism: 1 },
    statusChanges: { stress: -2 },
    narrative: () =>
      "Kamu memastikan semua pintu dan jendela terkunci rapat, menambah gembok cadangan di gerendel depan.",
    after: (state) => {
      state.flags.houseSecured = true;
      return "Perasaan aman sedikit meningkat meski mereka masih menunggu di luar.";
    },
  },
  hadapiPenagih: {
    label: "Hadapi penagih lewat pintu",
    time: 1,
    condition: (state) => state.flags.debtCollectorKnock && !state.flags.confrontedCollector,
    baseEffects: { exhibitionism: 2, sadism: 3, willpower: -1 },
    statusChanges: { stress: 4, trauma: 4 },
    narrative: () =>
      "Kamu berbicara tegas dari balik pintu, menolak intimidasi dan menegaskan kondisi Ayah yang sakit.",
    after: (state) => {
      state.flags.confrontedCollector = true;
      return "Suara mereka mereda, tapi ancaman untuk kembali besok masih terdengar.";
    },
  },
  susunRencana: {
    label: "Susun rencana cicilan realistis",
    time: 2,
    condition: (state) => !state.flags.planPrepared,
    baseEffects: { awareness: 2, deviancy: 2, willpower: 1 },
    statusChanges: { stress: 2, fatigue: 3 },
    narrative: () =>
      "Kamu membuka spreadsheet dan menghitung ulang pemasukan. Menjual kamera dan menambah shift kerja jadi opsi utama.",
    after: (state) => {
      state.flags.planPrepared = true;
    },
  },
  kirimRencana: {
    label: "Kirim rencana ke debt collector",
    time: 1,
    condition: (state) => state.flags.planPrepared && !state.flags.planSent,
    baseEffects: { sadism: 1, willpower: 1 },
    statusChanges: { stress: -2 },
    narrative: () =>
      "Kamu mengirimkan rencana pembayaran lengkap dengan jadwal dan bukti pemasukan stabil.",
    after: (state) => {
      state.flags.planSent = true;
      state.flags.safeWithSupport = true;
      return "Balasan cepat datang: mereka akan cek ke kantor dan kembali pagi nanti.";
    },
  },
  kerjaLembur: {
    label: "Kerjakan lembur daring",
    time: 2,
    baseEffects: { physique: -1, willpower: 2 },
    statusChanges: { money: 450_000, fatigue: 8, stress: 4 },
    narrative: () =>
      "Kamu menyelesaikan dua desain kilat untuk klien daring. Bayarannya lumayan, tapi mata terasa perih menahan kantuk.",
  },
  tulisJurnal: {
    label: "Tulis jurnal penguat diri",
    time: 1,
    baseEffects: { purity: 1, beauty: 1 },
    statusChanges: { trauma: -4, stress: -3 },
    narrative: () =>
      "Kamu menuangkan rasa takut dan harapan dalam jurnal. Kata-kata itu menegaskan kembali alasanmu bertahan.",
  },
};

const locations = {
  ruangKeluarga: {
    name: "Ruang Keluarga",
    description: (state) => {
      const parts = [
        "Lampu temaram menyinari sofa dan meja kayu kecil.",
        state.flags.reviewedBills
          ? "Tumpukan amplop sudah tersusun menurut jatuh tempo, siap dipakai bernegosiasi."
          : "Tumpukan amplop tagihan menunggu di meja rendah, siap menenggelamkanmu dalam angka.",
      ];
      if (state.flags.debtCollectorKnock) {
        parts.push("Ketukan terakhir dari penagih masih terngiang di telingamu.");
      }
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "bacaTagihan" },
      { type: "action", id: "rekamKronologi" },
      { type: "action", id: "hubungiDina" },
      { type: "action", id: "latihanNapas" },
      { type: "action", id: "bayarDebtSebagian" },
      { type: "action", id: "tulisJurnal" },
    ],
    connections: ["kamarAyah", "dapur", "halaman", "ruangKerja"],
  },
  kamarAyah: {
    name: "Kamar Ayah",
    description: (state) => {
      const parts = [
        "Ayah terbaring pucat ditemani aroma minyak kayu putih.",
        state.fatherHealth < 40
          ? "Kulitnya panas dan napasnya berat; kamu harus sering mengganti kompres."
          : "Setelah perawatanmu, nafasnya mulai lebih teratur meski demam belum turun sepenuhnya.",
      ];
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "periksaAyah" },
      { type: "action", id: "istirahatPendek" },
      { type: "action", id: "latihanNapas" },
    ],
    connections: ["ruangKeluarga"],
  },
  dapur: {
    name: "Dapur",
    description: (state) => {
      const parts = [
        "Kompor tua menyala redup, aroma jahe dan bawang memenuhi udara.",
        state.flags.preparedMedicine
          ? "Obat dan gelas air hangat tersusun rapi di nampan."
          : "Kamu bisa menyiapkan obat atau masakan hangat kapan saja.",
      ];
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "masakSup" },
      { type: "action", id: "siapkanObat" },
      { type: "action", id: "latihanNapas" },
    ],
    connections: ["ruangKeluarga"],
  },
  halaman: {
    name: "Halaman Depan",
    description: (state) => {
      const parts = [
        "Dua motor parkir di luar pagar. Suara mesin sesekali dinyalakan untuk menekanmu.",
      ];
      if (state.flags.houseSecured) {
        parts.push("Pintu dan jendela sudah kamu kunci berlapis.");
      }
      if (state.flags.debtCollectorKnock) {
        parts.push("Ancaman mereka untuk kembali besok terus terngiang.");
      }
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "pantauPenagih" },
      { type: "action", id: "kunciRumah" },
      { type: "action", id: "hadapiPenagih" },
    ],
    connections: ["ruangKeluarga"],
  },
  ruangKerja: {
    name: "Ruang Kerja",
    description: (state) => {
      const parts = [
        "Laptop tua menyala dengan spreadsheet terbuka. Kertas catatan penuh coretan strategi.",
      ];
      if (state.flags.planPrepared && !state.flags.planSent) {
        parts.push("Rencana cicilanmu siap dikirim, tinggal menunggu momen tepat.");
      } else if (state.flags.planSent) {
        parts.push("Inbox email memuat balasan penagih yang menunggu kepastian pagi nanti.");
      }
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "susunRencana" },
      { type: "action", id: "kirimRencana" },
      { type: "action", id: "kerjaLembur" },
      { type: "action", id: "tulisJurnal" },
    ],
    connections: ["ruangKeluarga"],
  },
};

const scheduledEvents = [
  {
    id: "debtCollectorKnock",
    condition: (state) => state.day === 1 && state.hour >= 23 && !state.flags.debtCollectorKnock,
    narrative: () =>
      "Ketukan keras menghantam pintu depan. \"Bayar sekarang atau kami tunggu sampai pagi,\" suara berat terdengar.",
    baseEffects: { awareness: 2, sadism: 1 },
    statusChanges: { stress: 8, trauma: 4 },
    after: (state) => {
      state.flags.debtCollectorKnock = true;
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day + 1, hour: 9 };
    },
  },
  {
    id: "collectorUltimatum",
    condition: (state) => {
      const schedule = state.flags.nextCollectorVisit;
      if (!schedule) return false;
      if (state.day > schedule.day) return true;
      if (state.day === schedule.day && state.hour >= schedule.hour) return true;
      return false;
    },
    narrative: () =>
      "Ponselmu bergetar. Pesan dari debt collector: mereka akan datang siang nanti dan menuntut minimal sepuluh juta.",
    baseEffects: { willpower: -1, awareness: 1 },
    statusChanges: { stress: 6, trauma: 2 },
    after: (state) => {
      state.flags.nextCollectorVisit = null;
      state.flags.collectorUltimatum = true;
      state.flags.safeWithSupport = false;
    },
  },
  {
    id: "dinaArrives",
    condition: (state) => state.flags.awaitingDina && state.hour >= 6,
    narrative: () =>
      "Dina muncul mengenakan hoodie dan membawa termos. \"Aku bawa lima juta dan sarapan. Kamu nggak sendirian,\" katanya.",
    baseEffects: { promiscuity: 2, willpower: 1, purity: 1 },
    statusChanges: { money: 5_000_000, stress: -6, fatigue: -3, fatherHealth: 4 },
    after: (state) => {
      state.flags.awaitingDina = false;
      state.flags.dinaArrived = true;
      state.flags.safeWithSupport = true;
    },
  },
];

const randomEvents = [
  {
    id: "neighbourSoup",
    condition: (state) => state.location === "dapur" && !state.flags.safeWithSupport,
    chance: (state) => (state.hour >= 5 && state.hour <= 8 ? 0.35 : 0.15),
    narrative: () =>
      "Ketukan pelan di pintu belakang. Bu Siti dari rumah sebelah menyerahkan termos sup dan menawarkan diri jadi saksi jika dibutuhkan.",
    baseEffects: { promiscuity: 1, purity: 1 },
    statusChanges: { stress: -5, fatigue: -4, fatherHealth: 3 },
    after: (state) => {
      state.flags.safeWithSupport = true;
    },
  },
  {
    id: "rtSupport",
    condition: (state) => state.location === "halaman" && state.flags.debtCollectorKnock,
    chance: () => 0.25,
    narrative: () =>
      "Pak RT mengirim pesan: \"Jika mereka datang lagi, hubungi saya. Saya sudah bicara dengan RW soal perlindungan hukum.\"",
    baseEffects: { promiscuity: 2, exhibitionism: 1 },
    statusChanges: { stress: -3, trauma: -2 },
    after: (state) => {
      state.flags.safeWithSupport = true;
    },
  },
  {
    id: "extraGig",
    condition: (state) => state.location === "ruangKerja" && !state.flags.extraGigTaken,
    chance: () => 0.3,
    narrative: () =>
      "Notifikasi email masuk: klien lama menawarkan proyek desain kilat dengan tenggat besok siang.",
    baseEffects: { deviancy: 1, awareness: 1 },
    statusChanges: { money: 650_000, stress: 2, fatigue: 2 },
    after: (state) => {
      state.flags.extraGigTaken = true;
    },
  },
];

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
    updateStatusUI();
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

    const preview = describeCombinedEffects(action.baseEffects, action.statusChanges);
    if (preview) {
      const hint = document.createElement("span");
      hint.className = "choice-hint";
      hint.textContent = preview;
      button.appendChild(hint);
      button.setAttribute("aria-label", `${action.label}. ${preview}`);
    } else {
      button.setAttribute("aria-label", action.label);
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

function renderScene(narratives = [], changeRecords = []) {
  updateStatusUI();
  renderFeedback(changeRecords);

  const location = locations[worldState.location];
  const paragraphs = [];
  paragraphs.push(`Hari ${worldState.day}, ${formatTime(worldState.hour)} di ${location?.name ?? "???"}.`);
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

  setStoryText(paragraphs);

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

  if (action.baseEffects) {
    changeRecords = changeRecords.concat(applyEffects(action.baseEffects));
  }
  if (action.statusChanges) {
    changeRecords = changeRecords.concat(applyStatusChanges(action.statusChanges));
  }

  const narrative = typeof action.narrative === "function" ? action.narrative(worldState) : action.narrative;
  if (narrative) {
    narratives.push(narrative);
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
  updateStatusUI();

  let narratives = [`Kamu bergerak menuju ${destination.name.toLowerCase()}.`];
  const eventResults = handleEvents();
  const changeRecords = eventResults.changes;
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

function resetStats() {
  statsOrder.forEach((key) => {
    stats[key].value = stats[key].initial;
  });
  updateStatsUI();
}

function resetGame() {
  worldState = createInitialWorldState();
  gameEnded = false;
  currentEnding = null;
  worldState.flags.triggeredEvents = {};
  resetStats();
  updateStatusUI();
  feedbackElement.innerHTML = "";
  const introText =
    "Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar. Para penagih masih berjaga di depan pagar.";
  renderScene([introText], []);
  toggleStatsButton.setAttribute("aria-expanded", "false");
  toggleStatsButton.textContent = "Tampilkan Stat Karakter";
  statsElement.hidden = true;
}

toggleStatsButton.addEventListener("click", () => {
  const isHidden = statsElement.hasAttribute("hidden");
  if (isHidden) {
    statsElement.removeAttribute("hidden");
    toggleStatsButton.setAttribute("aria-expanded", "true");
    toggleStatsButton.textContent = "Sembunyikan Stat Karakter";
  } else {
    statsElement.setAttribute("hidden", "");
    toggleStatsButton.setAttribute("aria-expanded", "false");
    toggleStatsButton.textContent = "Tampilkan Stat Karakter";
  }
});

restartButton.addEventListener("click", () => {
  resetGame();
});

initializeStatsUI();
initializeStatusUI();
updateStatsUI();
resetGame();
