const statsElement = document.getElementById("stats");
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

const storyNodes = {
  intro: {
    text: `Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar.
Tumpukan amplop tagihan menunggu di meja. Hari ini debt collector berkali-kali datang. Kamu tak bisa pergi jauh, mereka mengawasi.`,
    choices: [
      { text: "Periksa kondisi Ayah", next: "checkFather" },
      { text: "Buka tumpukan tagihan", next: "checkBills" },
      { text: "Lihat dari jendela", next: "lookOutside" },
    ],
  },
  checkFather: {
    text: `Ayah demam. Kamu mengganti kompres dan menaruh obat di dekatnya.
Saat itu ponselmu bergetar — pesan dari debt collector, menanyakan kapan kamu akan bayar.`,
    effects: { purity: 2, masochism: 2, willpower: 1, beauty: 1 },
    choices: [
      { text: "Balas dengan sopan", next: "replyCollector" },
      { text: "Abaikan dan fokus ke Ayah", next: "stayWithFather" },
    ],
  },
  checkBills: {
    text: `Ada daftar utang dari tiga koperasi. Totalnya 80 juta rupiah.
Besok adalah tenggat terakhir salah satu tagihan.`,
    effects: { awareness: 4, willpower: -2, deviancy: 1 },
    choices: [
      { text: "Telepon sahabatmu Dina", next: "callFriend" },
      { text: "Susun rencana bayar cicilan", next: "planInstallment" },
      { text: "Tarik napas, kembali ke Ayah", next: "checkFather" },
    ],
  },
  lookOutside: {
    text: `Lewat tirai, kamu melihat dua orang lelaki bersandar di motor. Salah satunya memegang map merah — identitas debt collector langganan.
Mereka menunggu tanda kamu keluar.`,
    effects: { awareness: 3, exhibitionism: -1, masochism: 1, beauty: -1 },
    choices: [
      { text: "Kunci pintu dan jendela", next: "lockDoors" },
      { text: "Kirimi pesan suara bahwa Ayah sakit", next: "voiceMessage" },
    ],
  },
  replyCollector: {
    text: `Kamu mengetik: "Maaf, Ayah saya sakit. Saya akan kirim kabar besok." Balasan cepat datang: "Kami butuh kepastian sekarang."`,
    effects: { exhibitionism: 1, willpower: -2, sadism: 1 },
    choices: [
      { text: "Tawarkan pembayaran sebagian", next: "partialOffer" },
      { text: "Minta waktu tiga hari", next: "askThreeDays" },
    ],
  },
  stayWithFather: {
    text: `Kamu duduk menggenggam tangan Ayah. Rasanya ingin menangis, tapi kamu tahu harus tegar.
Di kejauhan terdengar ketukan pintu pelan.`,
    effects: { purity: 1, masochism: 2, beauty: 1 },
    choices: [
      { text: "Buka pintu", next: "openDoor" },
      { text: "Diam dan berharap mereka pergi", next: "silentDoor" },
    ],
  },
  callFriend: {
    text: `Dina menjawab dengan suara kantuk. "Aku bisa pinjamkan lima juta, tapi aku baru gajian lusa," katanya.`,
    effects: { promiscuity: 3, willpower: 1, beauty: 1 },
    choices: [
      { text: "Setujui dan atur janji", next: "acceptHelp" },
      { text: "Tolak karena tak ingin merepotkan", next: "declineHelp" },
    ],
  },
  planInstallment: {
    text: `Kamu membuka spreadsheet di laptop tua. Jika menambah shift kerja online dan menjual kamera, kamu bisa kumpulkan 10 juta minggu ini.`,
    effects: { awareness: 2, deviancy: 2, willpower: 1 },
    choices: [
      { text: "Kirim rencana ke debt collector", next: "sendPlan" },
      { text: "Simpan dulu, fokus rawat Ayah", next: "stayWithFather" },
    ],
  },
  lockDoors: {
    text: `Kamu memastikan semua pintu terkunci. Kamu dengar salah satu dari mereka berkata, "Dia masih di dalam."`,
    effects: { awareness: 2, willpower: 1, masochism: 1 },
    choices: [
      { text: "Siapkan rekaman pembicaraan", next: "prepareRecording" },
      { text: "Cari bantuan RT lewat pesan", next: "callNeighbour" },
    ],
  },
  voiceMessage: {
    text: `Kamu mengirim pesan suara penuh harap. Balasan hanya emoji jam pasir. Mereka tetap menunggu.`,
    effects: { exhibitionism: 2, promiscuity: 1, willpower: -1 },
    choices: [
      { text: "Kembali ke dalam dan pikirkan rencana", next: "planInstallment" },
      { text: "Kirim lokasi ke Dina", next: "callFriend" },
    ],
  },
  partialOffer: {
    text: `Kamu tawarkan 5 juta besok pagi jika mereka memberi jaminan tertulis. Mereka menolak: "Minimal setengah malam ini."`,
    effects: { sadism: 2, willpower: -1, awareness: 1 },
    choices: [
      { text: "Coba negosiasi ulang", next: "negotiation" },
      { text: "Hubungi ketua RT", next: "callNeighbour" },
    ],
  },
  askThreeDays: {
    text: `"Tiga hari saja," katamu. Mereka menjawab, "Besok kami bawa penagih lebih banyak."`,
    effects: { masochism: 1, promiscuity: 1, willpower: -1 },
    choices: [
      { text: "Tetap tenang dan susun bukti", next: "prepareRecording" },
      { text: "Minta Dina datang", next: "acceptHelp" },
    ],
  },
  openDoor: {
    text: `Kamu membuka pintu. Debt collector berdiri dengan senyum tipis. "Kalau nggak bayar, kami tunggu di sini sampai pagi."`,
    effects: { exhibitionism: 3, willpower: -2, awareness: 1 },
    choices: [
      { text: "Rekam percakapan dan jelaskan kondisi", next: "prepareRecording" },
      { text: "Tutup pintu tanpa bicara", next: "silentDoor" },
    ],
  },
  silentDoor: {
    text: `Ketukan berhenti setelah beberapa menit. Tapi kamu tahu mereka belum pergi.`,
    effects: { masochism: 2, awareness: 1, exhibitionism: -1, beauty: -1 },
    choices: [
      { text: "Cari cara melapor", next: "callNeighbour" },
      { text: "Susun barang berharga yang bisa digadai", next: "gatherItems" },
    ],
  },
  acceptHelp: {
    text: `Dina berjanji akan datang pagi-pagi membawa pinjaman, juga mengantar makanan untuk Ayah.`,
    effects: { promiscuity: 2, willpower: 2, purity: 1, beauty: 1 },
    choices: [
      { text: "Gabungkan dengan rencana cicilan", next: "sendPlan" },
      { text: "Gunakan untuk nego ulang", next: "negotiation" },
    ],
  },
  declineHelp: {
    text: `Kamu menolak, tetapi begitu menutup telepon rasa menyesal menghantui. Kamu sendirian.`,
    effects: { willpower: -2, purity: 1, masochism: 1, promiscuity: -2, beauty: -1 },
    choices: [
      { text: "Telepon kembali Dina", next: "callFriend" },
      { text: "Fokus cari cara lain", next: "gatherItems" },
    ],
  },
  sendPlan: {
    text: `Kamu kirimkan rencana pembayaran lengkap dengan jadwal dan bukti pemasukan.
Tak lama kemudian, pesan datang: "Kami akan cek ke kantor. Pagi kami kembali."`,
    effects: { awareness: 2, deviancy: 2, sadism: 1, willpower: 1 },
    choices: [
      { text: "Gunakan waktu untuk rawat Ayah", next: "goodEnding" },
      { text: "Tetap berjaga semalaman", next: "keepWatch" },
    ],
  },
  negotiation: {
    text: `Kamu mengajak mereka bicara melalui pintu tertutup, menekankan bahwa Ayah sakit dan kamu punya bukti cicilan stabil.
Setelah perdebatan panjang, mereka akhirnya berkata, "Besok pagi jangan lupa siapkan minimal 10 juta."`,
    effects: { sadism: 3, willpower: -1, awareness: 1 },
    choices: [
      { text: "Terima syarat dan fokus menyiapkan dana", next: "keepWatch" },
      { text: "Laporkan perilaku mereka", next: "callNeighbour" },
    ],
  },
  prepareRecording: {
    text: `Kamu menyiapkan ponsel untuk merekam, juga menuliskan kronologi. Jika mereka memaksa masuk, kamu akan punya bukti hukum.`,
    effects: { awareness: 2, exhibitionism: 1, sadism: 1 },
    choices: [
      { text: "Hubungi LBH setempat", next: "legalAid" },
      { text: "Simpan bukti dan temani Ayah", next: "goodEnding" },
    ],
  },
  callNeighbour: {
    text: `Ketua RT menjawab, "Saya akan ke sana dengan Pak RW. Jangan buka pintu sebelum kami datang."`,
    effects: { promiscuity: 2, exhibitionism: 1, willpower: 1 },
    choices: [
      { text: "Tunggu kedatangan mereka", next: "communityHelp" },
      { text: "Sambil menunggu, susun bukti", next: "prepareRecording" },
    ],
  },
  gatherItems: {
    text: `Kamu mengumpulkan barang berharga: laptop, kamera, cincin ibu. Cukup untuk menutup sebagian utang.`,
    effects: { awareness: 1, purity: -1, masochism: 1, beauty: -1 },
    choices: [
      { text: "Rencanakan penjualan keesokan pagi", next: "keepWatch" },
      { text: "Pikirkan cara lain", next: "planInstallment" },
    ],
  },
  legalAid: {
    text: `Petugas LBH mengatakan akan membantu jika ada bukti intimidasi. Mereka menyarankanmu merekam dan tidak memberikan barang berharga tanpa kwitansi.`,
    effects: { promiscuity: 1, awareness: 2, willpower: 2, sadism: 1 },
    choices: [
      { text: "Tenang dan fokus ke Ayah", next: "goodEnding" },
      { text: "Bagikan info ini ke Dina", next: "acceptHelp" },
    ],
  },
  communityHelp: {
    text: `Ketua RT dan Pak RW datang, berbicara langsung dengan debt collector. Mereka mengingatkan prosedur hukum.
Para penagih mundur, berjanji kembali besok siang dengan surat resmi.`,
    effects: { promiscuity: 2, exhibitionism: 2, willpower: 1 },
    choices: [
      { text: "Gunakan malam untuk merawat Ayah", next: "goodEnding" },
      { text: "Tetap siaga jika mereka kembali", next: "keepWatch" },
    ],
  },
  keepWatch: {
    text: `Malam terasa panjang, namun kamu punya rencana. Meski lelah, kamu tak lagi merasa sendirian. Besok kamu siap menghadapi mereka.`,
    effects: { awareness: 1, masochism: 2, willpower: 1, beauty: -1 },
    ending: true,
    label: "Akhir: Bertahan dengan Rencana",
  },
  goodEnding: {
    text: `Kamu duduk di samping Ayah, memegang tangannya. Di meja ada rencana pembayaran, dukungan Dina, dan kontak bantuan hukum.
Kamu sadar: jalan keluar mungkin belum jelas, tapi kamu sudah mengambil langkah pertama.`,
    effects: { purity: 3, willpower: 2, beauty: 2 },
    ending: true,
    label: "Akhir: Secercah Harapan",
  },
};

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
    if (!change || typeof change.amount !== "number" || !stats[change.key]) {
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
    const stat = stats[key];
    if (!stat) return;
    const prefix = amount > 0 ? "+" : "";
    parts.push(`${stat.alias} ${prefix}${amount}`);
  });
  return parts.join(", ");
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
      const stat = stats[change.key];
      const item = document.createElement("li");
      item.className = `stat-change ${change.amount > 0 ? "positive" : "negative"}`;
      const label = document.createElement("span");
      label.textContent = stat.alias;
      const value = document.createElement("span");
      value.textContent = formatChange(change.amount);
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

function setStoryText(text) {
  storyElement.innerHTML = "";
  text
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      storyElement.appendChild(p);
    });
}

function renderNode(key, incomingChanges = []) {
  const node = storyNodes[key];
  if (!node) return;

  setStoryText(node.text);

  const nodeChanges = applyEffects(node.effects);
  const allChanges = [...incomingChanges, ...nodeChanges];
  renderFeedback(allChanges);

  choicesElement.innerHTML = "";

  if (node.ending) {
    const endingLabel = document.createElement("p");
    endingLabel.className = "subtitle";
    endingLabel.textContent = node.label;
    choicesElement.appendChild(endingLabel);
    restartButton.hidden = false;
    restartButton.focus();
  } else {
    node.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "button";
      button.type = "button";

      const label = document.createElement("span");
      label.textContent = choice.text;
      button.appendChild(label);

      const previewEffects = storyNodes[choice.next]?.effects;
      const preview = describeEffects(previewEffects);
      if (preview) {
        const hint = document.createElement("span");
        hint.className = "choice-hint";
        hint.textContent = preview;
        button.appendChild(hint);
        button.setAttribute("aria-label", `${choice.text}. ${preview}`);
      } else {
        button.setAttribute("aria-label", choice.text);
      }

      button.addEventListener("click", () => {
        renderNode(choice.next);
      });

      choicesElement.appendChild(button);
    });

    restartButton.hidden = true;
  }

  storyElement.focus();
}

function resetStats() {
  statsOrder.forEach((key) => {
    stats[key].value = stats[key].initial;
  });
  updateStatsUI();
}

restartButton.addEventListener("click", () => {
  resetStats();
  feedbackElement.innerHTML = "";
  renderNode("intro");
});

initializeStatsUI();
updateStatsUI();
renderNode("intro");
