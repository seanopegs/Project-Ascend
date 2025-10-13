var GameApp = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // scripts/main.js
  var main_exports = {};
  __export(main_exports, {
    initializeGame: () => initializeGame
  });

  // scripts/config/stats.js
  var baseStats = {
    awareness: {
      displayName: "Awareness",
      alias: "Kewaspadaan",
      description: "Mengukur seberapa tajam kamu membaca ancaman finansial dan peluang bantuan di sekitar.",
      max: 100,
      initial: 45,
      color: "#38bdf8",
      colorStrong: "#0ea5e9",
      colorSoft: "rgba(56, 189, 248, 0.22)"
    },
    purity: {
      displayName: "Purity",
      alias: "Integritas",
      description: "Menjaga kompas moral dan tujuan jangka panjang agar tetap lurus saat mengambil keputusan sulit.",
      max: 100,
      initial: 55,
      color: "#a855f7",
      colorStrong: "#7c3aed",
      colorSoft: "rgba(168, 85, 247, 0.22)"
    },
    physique: {
      displayName: "Physique",
      alias: "Kebugaran",
      description: "Stamina fisik untuk merawat Ayah, bekerja lembur, dan bertahan dari malam yang panjang.",
      max: 100,
      initial: 48,
      color: "#f97316",
      colorStrong: "#ea580c",
      colorSoft: "rgba(249, 115, 22, 0.22)"
    },
    willpower: {
      displayName: "Willpower",
      alias: "Tekad",
      description: "Kekuatan mental menghadapi tekanan psikologis, rasa takut, dan ancaman yang datang bertubi-tubi.",
      max: 100,
      initial: 52,
      color: "#facc15",
      colorStrong: "#eab308",
      colorSoft: "rgba(250, 204, 21, 0.22)"
    },
    beauty: {
      displayName: "Beauty",
      alias: "Performa",
      description: "Cara kamu membawa diri\u2014rapi, percaya diri, dan persuasif saat meminta dukungan orang lain.",
      max: 100,
      initial: 46,
      color: "#f472b6",
      colorStrong: "#ec4899",
      colorSoft: "rgba(244, 114, 182, 0.22)"
    },
    networking: {
      displayName: "Networking",
      alias: "Jaringan Sosial",
      description: "Kemampuan menjalin dukungan lintas komunitas dan menjaga kepercayaan mereka.",
      max: 100,
      initial: 36,
      color: "#34d399",
      colorStrong: "#10b981",
      colorSoft: "rgba(52, 211, 153, 0.22)"
    },
    confidence: {
      displayName: "Confidence",
      alias: "Kepercayaan Diri",
      description: "Keberanian berbicara terbuka soal situasi keluarga dan menegosiasikan bantuan yang kamu butuhkan.",
      max: 100,
      initial: 42,
      color: "#60a5fa",
      colorStrong: "#3b82f6",
      colorSoft: "rgba(96, 165, 250, 0.22)"
    },
    deviancy: {
      displayName: "Deviancy",
      alias: "Inovasi",
      description: "Kesediaan mencoba strategi tak lazim demi menciptakan ruang aman dan solusi baru.",
      max: 100,
      initial: 28,
      color: "#fb7185",
      colorStrong: "#f43f5e",
      colorSoft: "rgba(251, 113, 133, 0.22)"
    },
    ingenuity: {
      displayName: "Ingenuity",
      alias: "Kecakapan Bisnis",
      description: "Kepekaan melihat peluang usaha, menaksir risiko, dan menumbuhkan sumber pendapatan baru.",
      max: 100,
      initial: 38,
      color: "#14b8a6",
      colorStrong: "#0f766e",
      colorSoft: "rgba(20, 184, 166, 0.22)"
    },
    resilience: {
      displayName: "Resilience",
      alias: "Resiliensi",
      description: "Kemampuan bertahan di bawah tekanan fisik dan mental tanpa kehilangan arah.",
      max: 100,
      initial: 44,
      color: "#f59e0b",
      colorStrong: "#d97706",
      colorSoft: "rgba(245, 158, 11, 0.22)"
    },
    assertiveness: {
      displayName: "Assertiveness",
      alias: "Ketegasan",
      description: "Ketahanan saat menetapkan batas, menagih komitmen, dan menghadapi intimidasi.",
      max: 100,
      initial: 30,
      color: "#a3e635",
      colorStrong: "#84cc16",
      colorSoft: "rgba(163, 230, 53, 0.22)"
    }
  };
  var statsOrder = [
    "awareness",
    "purity",
    "physique",
    "willpower",
    "beauty",
    "networking",
    "confidence",
    "deviancy",
    "ingenuity",
    "resilience",
    "assertiveness"
  ];
  var tierLabels = ["", "Pemula", "Terkondisi", "Tangkas", "Berdaya", "Visioner"];
  function createInitialStats() {
    return Object.fromEntries(
      statsOrder.map((key) => [key, { ...baseStats[key], value: baseStats[key].initial }])
    );
  }
  function getTier(value, max) {
    const ratio = value / max;
    if (ratio < 0.2) return 1;
    if (ratio < 0.4) return 2;
    if (ratio < 0.6) return 3;
    if (ratio < 0.8) return 4;
    return 5;
  }

  // scripts/util/format.js
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
  function formatChange(amount) {
    return amount > 0 ? `+${amount}` : String(amount);
  }

  // scripts/config/status.js
  var statusConfig = {
    fatherHealth: {
      alias: "Kesehatan Ayah",
      min: 0,
      max: 100,
      meter: true,
      positiveIsGood: true,
      formatValue: (value) => `${Math.round(value)}%`,
      formatChange: (amount) => formatSignedPercent(amount, 1),
      describeState: (value) => {
        if (value >= 85) return "Ayah bernafas stabil dan demamnya mulai turun.";
        if (value >= 65) return "Perawatanmu membuat kondisinya cukup terkendali.";
        if (value >= 45) return "Ayah masih demam; butuh pengawasan rutin.";
        if (value >= 25) return "Napasnya berat\u2014perlu tindakan segera dan kompres baru.";
        return "Ayah kritis, segera cari bantuan medis.";
      }
    },
    stress: {
      alias: "Stres",
      min: 0,
      max: 100,
      meter: true,
      positiveIsGood: false,
      formatValue: (value) => `${Math.round(value)}/100`,
      formatChange: (amount) => formatSignedNumber(amount, 1),
      describeState: (value) => {
        if (value <= 25) return "Pikiranmu cukup jernih untuk mengambil keputusan.";
        if (value <= 50) return "Ada tekanan, tapi masih bisa kamu kendalikan.";
        if (value <= 75) return "Stres menumpuk\u2014carilah ruang untuk menenangkan diri.";
        return "Stres memuncak dan bisa memicu keputusan impulsif.";
      }
    },
    fatigue: {
      alias: "Fatigue",
      min: 0,
      max: 100,
      meter: true,
      positiveIsGood: false,
      formatValue: (value) => `${Math.round(value)}/100`,
      formatChange: (amount) => formatSignedNumber(amount, 1),
      describeState: (value) => {
        if (value <= 25) return "Tubuhmu terasa bugar dan responsif.";
        if (value <= 50) return "Tenaga mulai menurun, tapi masih bisa diajak kompromi.";
        if (value <= 75) return "Kelelahan berat; tindakan fisik jadi lebih lambat.";
        return "Tubuh hampir tumbang\u2014prioritaskan istirahat segera.";
      }
    },
    trauma: {
      alias: "Trauma",
      min: 0,
      max: 100,
      meter: true,
      positiveIsGood: false,
      formatValue: (value) => `${Math.round(value)}/100`,
      formatChange: (amount) => formatSignedNumber(amount, 1),
      describeState: (value) => {
        if (value <= 20) return "Mentalmu cukup kuat menghadapi tekanan.";
        if (value <= 45) return "Ingatan buruk mulai mengusik fokusmu.";
        if (value <= 70) return "Trauma aktif; cari dukungan atau teknik penenang.";
        return "Beban trauma berat dan menggerogoti ketahananmu.";
      }
    },
    money: {
      alias: "Uang Tunai",
      positiveIsGood: true,
      formatValue: (value) => formatCurrency(value),
      formatChange: (amount) => formatCurrencyChange(amount),
      describeState: (value) => {
        if (value >= 1e7) return "Kas cukup untuk menutup beberapa cicilan ke depan.";
        if (value >= 5e6) return "Ada ruang gerak untuk negosiasi dalam waktu dekat.";
        if (value >= 1e6) return "Dana minim\u2014alokasikan dengan hati-hati.";
        if (value > 0) return "Sisa uang hampir habis, setiap keputusan sangat berisiko.";
        return "Kas kosong; perlu pemasukan darurat atau bantuan.";
      }
    },
    debt: {
      alias: "Utang Aktif",
      positiveIsGood: false,
      formatValue: (value) => formatCurrency(value),
      formatChange: (amount) => formatCurrencyChange(amount),
      describeState: (value) => {
        if (value <= 2e7) return "Utang tinggal sedikit lagi untuk dilunasi.";
        if (value <= 5e7) return "Kemajuan terasa; teruskan strategi pembayaranmu.";
        if (value <= 8e7) return "Utang masih besar tapi mulai terkontrol.";
        return "Bunga membuat utang makin berat\u2014butuh rencana agresif.";
      }
    },
    debtInterestRate: {
      alias: "Bunga Harian",
      positiveIsGood: false,
      formatValue: (value) => `${(value * 100).toFixed(2)}%`,
      formatChange: (amount) => formatSignedPercent(amount * 100, 2),
      describeState: (value) => {
        if (value <= 5e-3) return "Bunga lunak\u2014tahan sampai cicilan lunas.";
        if (value <= 0.01) return "Bunga masih bisa dinegosiasikan.";
        if (value <= 0.02) return "Bunga mencekik, pertimbangkan renegosiasi.";
        return "Bunga sangat tinggi dan menguras pembayaranmu.";
      }
    }
  };
  var statusOrder = [
    "fatherHealth",
    "stress",
    "fatigue",
    "trauma",
    "money",
    "debt",
    "debtInterestRate"
  ];

  // scripts/game/actions.js
  var actionLibrary = {
    bacaTagihan: {
      label: "Teliti tumpukan tagihan",
      time: 0.75,
      traits: ["mental", "planning"],
      baseEffects: { awareness: 4, willpower: -1, deviancy: 1 },
      statusChanges: { stress: 3 },
      narrative: () => "Ada daftar utang dari tiga koperasi. Totalnya 80 juta rupiah. Besok adalah tenggat terakhir salah satu tagihan.",
      after: (state) => {
        state.flags.reviewedBills = true;
      }
    },
    rekamKronologi: {
      label: "Susun kronologi intimidasi",
      time: 0.5,
      traits: ["mental", "documentation"],
      condition: (state) => !state.flags.hasChronology,
      baseEffects: { awareness: 2, confidence: 1, assertiveness: 1 },
      statusChanges: { stress: -2 },
      narrative: () => "Kamu menyiapkan ponsel untuk merekam dan menuliskan kronologi detail. Jika mereka memaksa masuk, kamu punya bukti.",
      after: (state) => {
        state.flags.hasChronology = true;
      }
    },
    hubungiDina: {
      label: "Hubungi Dina minta bantuan",
      time: 0.25,
      traits: ["social"],
      condition: (state) => !state.flags.awaitingDina && !state.flags.dinaArrived,
      baseEffects: { networking: 3, willpower: 1, beauty: 1 },
      statusChanges: { stress: -3 },
      narrative: () => "Dina menjawab dengan suara kantuk. Ia siap meminjamkan lima juta dan berjanji mampir begitu fajar.",
      after: (state) => {
        state.flags.awaitingDina = true;
        return "Ada harapan baru: Dina akan datang membawa bantuan dan makanan hangat.";
      }
    },
    laporKeDina: {
      label: "Lapor perkembangan ke Dina",
      time: 0.5,
      traits: ["social", "mental", "recovery"],
      condition: (state) => state.flags.dinaArrived,
      baseEffects: { networking: 1, purity: 1, willpower: 1 },
      statusChanges: { stress: -4, trauma: -2 },
      narrative: () => "Kamu menelepon Dina, menjelaskan kondisi Ayah dan strategi pembayaranmu. Suaranya tenang dan menegaskan kamu tidak sendirian.",
      after: (state) => {
        state.flags.safeWithSupport = true;
        state.flags.dinaSupportAvailable = true;
        if ((state.flags.dinaLoanOutstanding || 0) > 0) {
          state.flags.dinaLoanDue = { day: state.day + 5, hour: 20 };
        }
        return "Dina mencatat jadwal cicilanmu dan siap mengingatkan bila kamu lengah.";
      }
    },
    cicilKeDina: {
      label: "Transfer cicilan ke Dina (Rp500.000)",
      time: 0.25,
      traits: ["financial", "social"],
      condition: (state) => state.flags.dinaArrived && (state.flags.dinaLoanOutstanding || 0) > 0 && state.money >= 5e5,
      baseEffects: { purity: 1, willpower: 1 },
      statusChanges: (state) => {
        const outstanding = state.flags.dinaLoanOutstanding || 0;
        const amount = Math.min(5e5, outstanding);
        return { money: -amount, stress: -3 };
      },
      narrative: () => "Kamu mentransfer sejumlah uang ke rekening Dina dan menyisipkan pesan terima kasih serta update perkembangan.",
      after: (state) => {
        const outstanding = state.flags.dinaLoanOutstanding || 0;
        const amount = Math.min(5e5, outstanding);
        state.flags.dinaLoanOutstanding = Math.max(0, outstanding - amount);
        if (state.flags.dinaLoanOutstanding <= 0) {
          state.flags.dinaLoanOutstanding = 0;
          state.flags.dinaLoanDue = null;
          return "Pinjaman Dina lunas. Ia mengirim stiker pelukan dan meminta kamu fokus merawat Ayah.";
        }
        state.flags.dinaLoanDue = { day: state.day + 7, hour: 20 };
        return `Sisa pinjaman ke Dina tinggal ${formatCurrency(state.flags.dinaLoanOutstanding)}.`;
      }
    },
    latihanNapas: {
      label: "Latihan pernapasan 4-7-8",
      time: 0.25,
      traits: ["recovery", "mental"],
      condition: (state) => state.stress >= 25,
      baseEffects: { willpower: 1, purity: 1 },
      statusChanges: { stress: -6, trauma: -2, fatigue: -1 },
      narrative: () => "Kamu memejamkan mata dan menjalankan pola napas 4-7-8. Dada terasa sedikit lebih ringan."
    },
    bayarDebtSebagian: {
      label: "Transfer cicilan darurat (Rp2.000.000)",
      time: 0.25,
      traits: ["financial", "mental"],
      condition: (state) => state.money >= 2e6 && state.debt > 0,
      baseEffects: { purity: 1, willpower: 1 },
      statusChanges: { money: -2e6, debt: -2e6, stress: -4 },
      narrative: () => "Kamu membuka aplikasi bank dan mentransfer dua juta sebagai penegasan niat baik kepada debt collector."
    },
    periksaAyah: {
      label: "Periksa kondisi Ayah",
      time: 0.5,
      traits: ["care", "physical"],
      baseEffects: { purity: 2, resilience: 2, willpower: 1, beauty: 1, physique: 1 },
      statusChanges: { fatherHealth: 8, stress: -4, fatigue: 2 },
      narrative: () => "Ayah demam. Kamu mengganti kompres dan mengusap dahinya hingga napasnya kembali teratur.",
      after: (state) => {
        state.hoursSinceFatherCare = 0;
      }
    },
    istirahatPendek: {
      label: "Rebah sejenak sambil berjaga",
      time: 0.75,
      traits: ["recovery"],
      condition: (state) => state.fatigue >= 25,
      baseEffects: { resilience: -1, willpower: 1 },
      statusChanges: { fatigue: -14, stress: -3 },
      narrative: () => "Kamu menyandarkan kepala di tepi ranjang tanpa benar-benar tidur. Setidaknya ototmu beristirahat sebentar."
    },
    masakSup: {
      label: "Masak sup jahe hangat",
      time: 1,
      traits: ["care", "physical"],
      baseEffects: { purity: 1, beauty: 1, physique: 1 },
      statusChanges: { fatigue: -5, stress: -2, fatherHealth: 3 },
      narrative: () => "Aroma jahe memenuhi dapur. Sup hangat siap kamu bawa untuk membantu Ayah menelan obat."
    },
    siapkanObat: {
      label: "Siapkan obat dan air hangat",
      time: 0.5,
      traits: ["care", "mental"],
      condition: (state) => !state.flags.preparedMedicine,
      baseEffects: { purity: 1, resilience: 1 },
      statusChanges: { fatherHealth: 4, fatigue: 1 },
      narrative: () => "Kamu menyusun obat penurun demam dan segelas air hangat, memastikan dosisnya aman.",
      after: (state) => {
        state.flags.preparedMedicine = true;
      }
    },
    pantauPenagih: {
      label: "Pantau penagih dari balik tirai",
      time: 0.25,
      traits: ["vigilance", "mental"],
      baseEffects: { awareness: 3, confidence: -1, resilience: 1 },
      statusChanges: { stress: 3 },
      narrative: () => "Lewat tirai, kamu melihat dua orang lelaki bersandar di motor dengan map merah khas penagih."
    },
    kunciRumah: {
      label: "Periksa dan kunci seluruh pintu",
      time: 0.5,
      traits: ["physical", "security"],
      baseEffects: { awareness: 2, resilience: 1 },
      statusChanges: { stress: -2 },
      narrative: () => "Kamu memastikan semua pintu dan jendela terkunci rapat, menambah gembok cadangan di gerendel depan.",
      after: (state) => {
        state.flags.houseSecured = true;
        return "Perasaan aman sedikit meningkat meski mereka masih menunggu di luar.";
      }
    },
    hadapiPenagih: {
      label: "Hadapi penagih lewat pintu",
      time: 1,
      condition: (state) => state.flags.debtCollectorKnock && !state.flags.confrontedCollector,
      baseEffects: { confidence: 2, assertiveness: 3, willpower: -1 },
      statusChanges: { stress: 4, trauma: 4 },
      narrative: () => "Kamu berbicara tegas dari balik pintu, menolak intimidasi dan menegaskan kondisi Ayah yang sakit.",
      after: (state) => {
        state.flags.confrontedCollector = true;
        return "Suara mereka mereda, tapi ancaman untuk kembali besok masih terdengar.";
      }
    },
    susunRencana: {
      label: "Susun rencana cicilan realistis",
      time: 1.5,
      traits: ["planning", "mental"],
      condition: (state) => !state.flags.planPrepared,
      baseEffects: { awareness: 2, deviancy: 2, willpower: 1 },
      statusChanges: { stress: 2, fatigue: 3 },
      narrative: () => "Kamu membuka spreadsheet dan menghitung ulang pemasukan. Menjual kamera dan menambah shift kerja jadi opsi utama.",
      after: (state) => {
        state.flags.planPrepared = true;
      }
    },
    risetUsahaRumahan: {
      label: "Riset peluang usaha tetangga",
      time: 1.25,
      traits: ["planning", "business", "mental"],
      condition: (state) => !state.flags.homeBusinessPlan,
      baseEffects: { ingenuity: 4, networking: 1, confidence: 1 },
      statusChanges: { stress: 2, fatigue: 3 },
      narrative: () => "Kamu mendata menu siap saji favorit tetangga, menghitung modal bahan, dan menyiapkan daftar pemasok kecil.",
      after: (state) => {
        state.flags.homeBusinessPlan = true;
        state.flags.homeBusinessMomentum = 0;
        return "Catatan rapi ada di meja\u2014tinggal berani membuka pre-order pertama.";
      }
    },
    kirimRencana: {
      label: "Kirim rencana ke debt collector",
      time: 0.5,
      traits: ["planning", "social"],
      condition: (state) => state.flags.planPrepared && !state.flags.planSent,
      baseEffects: { assertiveness: 1, willpower: 1 },
      statusChanges: { stress: -2 },
      narrative: () => "Kamu mengirimkan rencana pembayaran lengkap dengan jadwal dan bukti pemasukan stabil.",
      after: (state) => {
        state.flags.planSent = true;
        state.flags.safeWithSupport = true;
        return "Balasan cepat datang: mereka akan cek ke kantor dan kembali pagi nanti.";
      }
    },
    kelolaPreOrder: {
      label: "Kelola pre-order camilan daring",
      time: 1.25,
      traits: ["business", "work"],
      condition: (state) => state.flags.homeBusinessPlan,
      baseEffects: { ingenuity: 2, resilience: 1, assertiveness: 1 },
      statusChanges: (state) => {
        const momentum = Math.min(state.flags.homeBusinessMomentum || 0, 4);
        const baseIncome = 36e4;
        const bonus = momentum * 4e4;
        return { money: baseIncome + bonus, fatigue: 5.5, stress: 2.5 };
      },
      narrative: () => "Kamu menyiapkan paket camilan, memotret, lalu membalas pesan titipan pesanan dari grup tetangga.",
      after: (state) => {
        state.flags.homeBusinessLaunched = true;
        const momentum = state.flags.homeBusinessMomentum || 0;
        state.flags.homeBusinessMomentum = Math.min(momentum + 1, 6);
        return "Pesanan terkumpul dan uang muka masuk ke dompet digital. Besok pagi kamu tinggal mengantar.";
      }
    },
    kerjaLembur: {
      label: "Kerjakan lembur daring",
      time: 2.25,
      traits: ["work", "mental"],
      baseEffects: { physique: -1, willpower: 2, ingenuity: 1 },
      statusChanges: { money: 32e4, fatigue: 7, stress: 4 },
      narrative: () => "Kamu menyelesaikan dua desain kilat untuk klien daring. Bayarannya lumayan, tapi mata terasa perih menahan kantuk."
    },
    rekamKontenMalam: {
      label: "Rekam konten update malam ini",
      time: 0.5,
      traits: ["social", "mental"],
      condition: (state) => !state.flags.creatorChannel,
      baseEffects: { confidence: 2, networking: 2, ingenuity: 1 },
      statusChanges: { stress: -2, fatigue: 1 },
      narrative: () => "Kamu merekam video pendek tentang kondisi Ayah dan rencana bertahan. Pesan empati berdatangan dari teman lama.",
      after: (state) => {
        state.flags.creatorChannel = true;
        state.flags.creatorMomentum = 1;
        return "Video itu dibagikan ulang. Beberapa orang bertanya bagaimana cara membantu secara langsung.";
      }
    },
    siaranDukungan: {
      label: "Siaran dukungan tengah malam",
      time: 1,
      traits: ["social", "business"],
      condition: (state) => state.flags.creatorChannel,
      baseEffects: { confidence: 1, networking: 2, assertiveness: 1 },
      statusChanges: (state) => {
        const momentum = Math.max(state.flags.creatorMomentum || 1, 1);
        const cappedMomentum = Math.min(momentum, 5);
        const baseIncome = 18e4;
        const bonus = (cappedMomentum - 1) * 4e4;
        const stressRelief = cappedMomentum >= 3 ? -1.5 : -1;
        const traumaShift = cappedMomentum >= 4 ? -0.5 : 0;
        return { money: baseIncome + bonus, stress: stressRelief, fatigue: 4, trauma: traumaShift };
      },
      narrative: () => "Lewat siaran singkat kamu berbagi kabar terbaru, menerima doa, dan mengingatkan penonton soal kondisi Ayah.",
      after: (state) => {
        const momentum = state.flags.creatorMomentum || 1;
        const increment = momentum >= 3 ? 0.5 : 1;
        state.flags.creatorMomentum = Math.min(momentum + increment, 6);
        return "Penonton mengirim tip kecil dan menawarkan membagikan kanalmu ke komunitas dukungan lain.";
      }
    },
    tulisJurnal: {
      label: "Tulis jurnal penguat diri",
      time: 0.5,
      traits: ["mental", "recovery"],
      baseEffects: { purity: 1, beauty: 1 },
      statusChanges: { trauma: -4, stress: -3 },
      narrative: () => "Kamu menuangkan rasa takut dan harapan dalam jurnal. Kata-kata itu menegaskan kembali alasanmu bertahan."
    }
  };

  // scripts/story/locations.js
  var locations = {
    ruangKeluarga: {
      name: "Ruang Keluarga",
      description: (state) => {
        const parts = [
          "Lampu temaram menyinari sofa dan meja kayu kecil.",
          state.flags.reviewedBills ? "Tumpukan amplop sudah tersusun menurut jatuh tempo, siap dipakai bernegosiasi." : "Tumpukan amplop tagihan menunggu di meja rendah, siap menenggelamkanmu dalam angka."
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
        { type: "action", id: "laporKeDina" },
        { type: "action", id: "cicilKeDina" },
        { type: "action", id: "rekamKontenMalam" },
        { type: "action", id: "siaranDukungan" },
        { type: "action", id: "latihanNapas" },
        { type: "action", id: "bayarDebtSebagian" },
        { type: "action", id: "tulisJurnal" }
      ],
      connections: ["kamarAyah", "dapur", "halaman", "ruangKerja"]
    },
    kamarAyah: {
      name: "Kamar Ayah",
      description: (state) => {
        const parts = [
          "Ayah terbaring pucat ditemani aroma minyak kayu putih.",
          state.fatherHealth < 40 ? "Kulitnya panas dan napasnya berat; kamu harus sering mengganti kompres." : "Setelah perawatanmu, nafasnya mulai lebih teratur meski demam belum turun sepenuhnya."
        ];
        return parts.join(" ");
      },
      actions: [
        { type: "action", id: "periksaAyah" },
        { type: "action", id: "istirahatPendek" },
        { type: "action", id: "latihanNapas" }
      ],
      connections: ["ruangKeluarga"]
    },
    dapur: {
      name: "Dapur",
      description: (state) => {
        const parts = [
          "Kompor tua menyala redup, aroma jahe dan bawang memenuhi udara.",
          state.flags.preparedMedicine ? "Obat dan gelas air hangat tersusun rapi di nampan." : "Kamu bisa menyiapkan obat atau masakan hangat kapan saja."
        ];
        return parts.join(" ");
      },
      actions: [
        { type: "action", id: "masakSup" },
        { type: "action", id: "siapkanObat" },
        { type: "action", id: "latihanNapas" }
      ],
      connections: ["ruangKeluarga"]
    },
    halaman: {
      name: "Halaman Depan",
      description: (state) => {
        const parts = [
          "Dua motor parkir di luar pagar. Suara mesin sesekali dinyalakan untuk menekanmu."
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
        { type: "action", id: "hadapiPenagih" }
      ],
      connections: ["ruangKeluarga"]
    },
    ruangKerja: {
      name: "Ruang Kerja",
      description: (state) => {
        const parts = [
          "Laptop tua menyala dengan spreadsheet terbuka. Kertas catatan penuh coretan strategi."
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
        { type: "action", id: "risetUsahaRumahan" },
        { type: "action", id: "kelolaPreOrder" },
        { type: "action", id: "kerjaLembur" },
        { type: "action", id: "tulisJurnal" }
      ],
      connections: ["ruangKeluarga"]
    }
  };

  // scripts/story/events.js
  var scheduledEvents = [
    {
      id: "debtCollectorKnock",
      condition: (state) => state.day === 1 && state.hour >= 23 && !state.flags.debtCollectorKnock,
      narrative: () => 'Ketukan keras menghantam pintu depan. "Bayar sekarang atau kami tunggu sampai pagi," suara berat terdengar.',
      baseEffects: { awareness: 2, assertiveness: 1 },
      statusChanges: { stress: 8, trauma: 4 },
      after: (state) => {
        state.flags.debtCollectorKnock = true;
        state.flags.safeWithSupport = false;
        state.flags.nextCollectorVisit = { day: state.day + 1, hour: 9 };
      }
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
      narrative: () => "Ponselmu bergetar. Pesan dari debt collector: mereka akan datang siang nanti dan menuntut minimal sepuluh juta.",
      baseEffects: { willpower: -1, awareness: 1 },
      statusChanges: { stress: 6, trauma: 2 },
      after: (state) => {
        state.flags.nextCollectorVisit = null;
        state.flags.collectorUltimatum = true;
        state.flags.safeWithSupport = false;
      }
    },
    {
      id: "dinaArrives",
      condition: (state) => state.flags.awaitingDina && state.hour >= 6,
      narrative: () => 'Dina muncul mengenakan hoodie dan membawa termos. "Aku pinjami lima juta, tapi tolong kabari progresnya tiap beberapa hari, ya," ujarnya.',
      baseEffects: { networking: 2, willpower: 1, purity: 1 },
      statusChanges: { money: 5e6, stress: -6, fatigue: -3, fatherHealth: 4 },
      after: (state) => {
        state.flags.awaitingDina = false;
        state.flags.dinaArrived = true;
        state.flags.dinaSupportAvailable = true;
        state.flags.safeWithSupport = true;
        state.flags.dinaLoanOutstanding = (state.flags.dinaLoanOutstanding || 0) + 5e6;
        state.flags.dinaLoanDue = { day: state.day + 10, hour: 20 };
      }
    },
    {
      id: "dinaReminder",
      condition: (state) => {
        const outstanding = state.flags.dinaLoanOutstanding || 0;
        const due = state.flags.dinaLoanDue;
        if (!due || outstanding <= 0) return false;
        if (state.day > due.day) return true;
        if (state.day === due.day && state.hour >= due.hour) return true;
        return false;
      },
      narrative: () => "Notifikasi baru: Dina menanyakan kabar Ayah dan progress pengembalian pinjaman. Ia berharap ada cicilan kecil dalam beberapa hari.",
      statusChanges: { stress: 5 },
      after: (state) => {
        state.flags.dinaSupportAvailable = true;
        state.flags.safeWithSupport = true;
        if (state.flags.dinaLoanOutstanding > 0) {
          state.flags.dinaLoanDue = { day: state.day + 3, hour: 21 };
        } else {
          state.flags.dinaLoanDue = null;
        }
      }
    }
  ];
  var randomEvents = [
    {
      id: "neighbourSoup",
      condition: (state) => state.location === "dapur" && !state.flags.safeWithSupport,
      chance: (state) => state.hour >= 5 && state.hour <= 8 ? 0.35 : 0.15,
      narrative: () => "Ketukan pelan di pintu belakang. Bu Siti dari rumah sebelah menyerahkan termos sup dan menawarkan diri jadi saksi jika dibutuhkan.",
      baseEffects: { networking: 1, purity: 1 },
      statusChanges: { stress: -5, fatigue: -4, fatherHealth: 3 },
      after: (state) => {
        state.flags.safeWithSupport = true;
      }
    },
    {
      id: "rtSupport",
      condition: (state) => state.location === "halaman" && state.flags.debtCollectorKnock,
      chance: () => 0.25,
      narrative: () => 'Pak RT mengirim pesan: "Jika mereka datang lagi, hubungi saya. Saya sudah bicara dengan RW soal perlindungan hukum."',
      baseEffects: { networking: 2, confidence: 1 },
      statusChanges: { stress: -3, trauma: -2 },
      after: (state) => {
        state.flags.safeWithSupport = true;
      }
    },
    {
      id: "extraGig",
      condition: (state) => state.location === "ruangKerja" && !state.flags.extraGigTaken,
      chance: () => 0.3,
      narrative: () => "Notifikasi email masuk: klien lama menawarkan proyek desain kilat dengan tenggat besok siang.",
      baseEffects: { deviancy: 1, awareness: 1 },
      statusChanges: { money: 65e4, stress: 2, fatigue: 2 },
      after: (state) => {
        state.flags.extraGigTaken = true;
      }
    }
  ];

  // scripts/ui/modalSystem.js
  var FOCUSABLE_SELECTORS = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "audio[controls]",
    "video[controls]",
    "[contenteditable]",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");
  var DRAG_EXCLUDE_SELECTOR = 'button, a[href], input, select, textarea, label, [role="button"], [role="link"], [role="tab"], [data-modal-drag-ignore]';
  var lockedModalCount = 0;
  var resizeListenerAttached = false;
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function parsePositiveNumber(value) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }
  function parseDimension(value) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  function syncDocumentState() {
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) {
      return;
    }
    const hasOpenModal = lockedModalCount > 0;
    html.classList.toggle("modal-open", hasOpenModal);
    body.classList.toggle("modal-open", hasOpenModal);
    if (hasOpenModal) {
      const scrollbarGap = clamp(window.innerWidth - html.clientWidth, 0, 48);
      if (scrollbarGap > 0) {
        body.style.setProperty("--modal-scrollbar-gap", `${scrollbarGap}px`);
      } else {
        body.style.removeProperty("--modal-scrollbar-gap");
      }
      body.dataset.modalLocked = "true";
      if (!body.dataset.previousOverflow) {
        body.dataset.previousOverflow = body.style.overflow || "";
      }
      body.style.overflow = "hidden";
    } else {
      body.style.removeProperty("--modal-scrollbar-gap");
      if (body.dataset.modalLocked) {
        body.style.overflow = body.dataset.previousOverflow || "";
      }
      delete body.dataset.modalLocked;
      delete body.dataset.previousOverflow;
    }
  }
  function handleWindowResize() {
    if (lockedModalCount > 0) {
      syncDocumentState();
    }
  }
  function ensureResizeListener() {
    if (!resizeListenerAttached) {
      window.addEventListener("resize", handleWindowResize, { passive: true });
      resizeListenerAttached = true;
    }
  }
  function getFocusableElements(container) {
    if (!container) {
      return [];
    }
    const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
    return elements.filter((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      if (element.hasAttribute("disabled")) {
        return false;
      }
      if (element.getAttribute("aria-hidden") === "true") {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0;
    });
  }
  function createModalHost(container, config = {}) {
    if (!container) {
      throw new Error("Modal host requires a valid container element");
    }
    const originalParent = container.parentElement;
    let hostPlaceholder = null;
    if (originalParent && container.parentNode !== document.body) {
      hostPlaceholder = document.createComment("modal-host-anchor");
      originalParent.replaceChild(hostPlaceholder, container);
      document.body.appendChild(container);
    }
    const options = {
      labelledBy: config.labelledBy || null,
      describedBy: config.describedBy || null,
      role: config.role || "dialog",
      size: config.size || "md",
      tone: config.tone || "midnight",
      trapFocus: config.trapFocus !== false,
      closeOnBackdrop: config.closeOnBackdrop !== false,
      closeOnEscape: config.closeOnEscape !== false,
      lockScroll: config.lockScroll !== false,
      draggable: config.draggable === true,
      dragHandle: typeof config.dragHandle === "string" ? config.dragHandle : null,
      resizable: config.resizable === true,
      minWidth: parsePositiveNumber(config.minWidth) ?? 420,
      minHeight: parsePositiveNumber(config.minHeight) ?? 320,
      maxWidth: parsePositiveNumber(config.maxWidth) ?? null,
      maxHeight: parsePositiveNumber(config.maxHeight) ?? null,
      onOpen: typeof config.onOpen === "function" ? config.onOpen : null,
      onClose: typeof config.onClose === "function" ? config.onClose : null
    };
    let requestCloseHandler = typeof config.onRequestClose === "function" ? config.onRequestClose : null;
    container.innerHTML = "";
    container.classList.add("modal-host");
    container.dataset.modalSize = options.size;
    container.dataset.modalTone = options.tone;
    container.dataset.modalMode = options.lockScroll ? "modal" : "floating";
    container.dataset.modalOverlay = options.lockScroll ? "scrim" : "none";
    if (options.draggable) {
      container.dataset.modalDraggable = "true";
    }
    container.setAttribute("role", options.role);
    if (options.labelledBy) {
      container.setAttribute("aria-labelledby", options.labelledBy);
    }
    if (options.describedBy) {
      container.setAttribute("aria-describedby", options.describedBy);
    }
    container.setAttribute("aria-modal", "false");
    container.setAttribute("aria-hidden", "true");
    container.hidden = true;
    container.dataset.open = "false";
    const layer = document.createElement("div");
    layer.className = "modal-layer";
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "presentation");
    const surface = document.createElement("div");
    surface.className = "modal-surface";
    surface.setAttribute("role", "document");
    surface.tabIndex = -1;
    layer.appendChild(overlay);
    layer.appendChild(surface);
    container.appendChild(layer);
    let isOpen = false;
    let focusableElements = [];
    let previouslyFocusedElement = null;
    let dragState = null;
    let resizeHandle = null;
    let resizeState = null;
    let hasManualWidth = false;
    let hasManualHeight = false;
    function updateContainerState() {
      container.dataset.open = isOpen ? "true" : "false";
      container.setAttribute("aria-hidden", isOpen ? "false" : "true");
      container.setAttribute("aria-modal", isOpen ? "true" : "false");
      if (isOpen) {
        container.removeAttribute("hidden");
      } else if (!container.hasAttribute("hidden")) {
        container.setAttribute("hidden", "");
      }
    }
    function refreshFocusCycle() {
      if (options.trapFocus === false) {
        focusableElements = [];
        return;
      }
      focusableElements = getFocusableElements(surface);
    }
    function focusInitialElement() {
      refreshFocusCycle();
      const target = focusableElements[0] || surface;
      window.requestAnimationFrame(() => {
        target.focus({ preventScroll: true });
      });
    }
    function parseOffset(value) {
      const numeric = Number.parseFloat(value);
      return Number.isFinite(numeric) ? numeric : 0;
    }
    function getCurrentOffsets() {
      return {
        x: parseOffset(surface.style.getPropertyValue("--modal-offset-x")),
        y: parseOffset(surface.style.getPropertyValue("--modal-offset-y"))
      };
    }
    function applyOffset(offsetX, offsetY) {
      surface.style.setProperty("--modal-offset-x", `${offsetX}px`);
      surface.style.setProperty("--modal-offset-y", `${offsetY}px`);
    }
    function resetPosition() {
      surface.style.removeProperty("--modal-offset-x");
      surface.style.removeProperty("--modal-offset-y");
      surface.classList.remove("is-dragging");
    }
    function constrainToViewport(width, height, offsetX, offsetY) {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || width;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || height;
      const surfaceWidth = width ?? surface.getBoundingClientRect().width;
      const surfaceHeight = height ?? surface.getBoundingClientRect().height;
      const halfWidth = surfaceWidth / 2;
      const halfHeight = surfaceHeight / 2;
      const marginX = Math.min(48, Math.max(16, Math.floor(viewportWidth * 0.05)));
      const marginY = Math.min(48, Math.max(16, Math.floor(viewportHeight * 0.08)));
      const minCenterX = marginX + halfWidth;
      const maxCenterX = viewportWidth - marginX - halfWidth;
      const minCenterY = marginY + halfHeight;
      const maxCenterY = viewportHeight - marginY - halfHeight;
      const viewportCenterX = viewportWidth / 2;
      const viewportCenterY = viewportHeight / 2;
      let clampedOffsetX = offsetX;
      let clampedOffsetY = offsetY;
      if (minCenterX <= maxCenterX) {
        const minOffsetX = minCenterX - viewportCenterX;
        const maxOffsetX = maxCenterX - viewportCenterX;
        clampedOffsetX = clamp(offsetX, minOffsetX, maxOffsetX);
      } else {
        clampedOffsetX = 0;
      }
      if (minCenterY <= maxCenterY) {
        const minOffsetY = minCenterY - viewportCenterY;
        const maxOffsetY = maxCenterY - viewportCenterY;
        clampedOffsetY = clamp(offsetY, minOffsetY, maxOffsetY);
      } else {
        clampedOffsetY = 0;
      }
      return { x: clampedOffsetX, y: clampedOffsetY };
    }
    function commitConstrainedOffsets({ width, height } = {}) {
      const { x, y } = getCurrentOffsets();
      const constrained = constrainToViewport(width, height, x, y);
      applyOffset(constrained.x, constrained.y);
    }
    function getSizeConstraints() {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const marginX = Math.min(48, Math.max(16, Math.floor(viewportWidth * 0.05)));
      const marginY = Math.min(48, Math.max(16, Math.floor(viewportHeight * 0.08)));
      const availableWidth = Math.max(280, viewportWidth - marginX * 2);
      const availableHeight = Math.max(240, viewportHeight - marginY * 2);
      let maxWidth = options.maxWidth ? Math.min(options.maxWidth, availableWidth) : availableWidth;
      let maxHeight = options.maxHeight ? Math.min(options.maxHeight, availableHeight) : availableHeight;
      let minWidth = Math.min(options.minWidth, availableWidth);
      let minHeight = Math.min(options.minHeight, availableHeight);
      if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
        maxWidth = availableWidth;
      }
      if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
        maxHeight = availableHeight;
      }
      if (minWidth > maxWidth) {
        minWidth = maxWidth;
      }
      if (minHeight > maxHeight) {
        minHeight = maxHeight;
      }
      return {
        minWidth: Math.max(240, minWidth),
        minHeight: Math.max(200, minHeight),
        maxWidth: Math.max(240, maxWidth),
        maxHeight: Math.max(200, maxHeight)
      };
    }
    function getCurrentSize() {
      const rect = surface.getBoundingClientRect();
      const inlineWidth = parseDimension(surface.style.width);
      const inlineHeight = parseDimension(surface.style.height);
      const width = inlineWidth ?? rect.width;
      const height = inlineHeight ?? rect.height;
      return { width, height, inlineWidth, inlineHeight, rect };
    }
    function applySize(width, height, { manual = false } = {}) {
      if (Number.isFinite(width)) {
        const rounded = Math.max(0, Math.round(width));
        surface.style.width = `${rounded}px`;
        if (manual) {
          hasManualWidth = true;
        }
      }
      if (Number.isFinite(height)) {
        const rounded = Math.max(0, Math.round(height));
        surface.style.height = `${rounded}px`;
        if (manual) {
          hasManualHeight = true;
        }
      }
    }
    function clearSurfaceSize() {
      surface.style.removeProperty("width");
      surface.style.removeProperty("height");
      hasManualWidth = false;
      hasManualHeight = false;
    }
    function clampSizeToViewport() {
      if (!options.resizable) {
        return;
      }
      const { width, height, inlineWidth, inlineHeight } = getCurrentSize();
      const constraints = getSizeConstraints();
      const enforceMinWidth = hasManualWidth || inlineWidth !== null;
      const enforceMinHeight = hasManualHeight || inlineHeight !== null;
      const minWidth = enforceMinWidth ? constraints.minWidth : Math.min(width, constraints.maxWidth);
      const minHeight = enforceMinHeight ? constraints.minHeight : Math.min(height, constraints.maxHeight);
      const clampedWidth = clamp(width, minWidth, constraints.maxWidth);
      const clampedHeight = clamp(height, minHeight, constraints.maxHeight);
      const widthNeedsUpdate = enforceMinWidth || inlineWidth !== null || clampedWidth !== width;
      const heightNeedsUpdate = enforceMinHeight || inlineHeight !== null || clampedHeight !== height;
      if (widthNeedsUpdate) {
        applySize(clampedWidth, null);
      }
      if (heightNeedsUpdate) {
        applySize(null, clampedHeight);
      }
      commitConstrainedOffsets({ width: clampedWidth, height: clampedHeight });
    }
    function stopDragging() {
      if (!dragState) {
        return;
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      surface.releasePointerCapture?.(dragState.pointerId);
      surface.classList.remove("is-dragging");
      dragState = null;
    }
    function handlePointerMove(event) {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }
      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      const desiredOffsetX = dragState.baseOffsetX + deltaX;
      const desiredOffsetY = dragState.baseOffsetY + deltaY;
      const constrained = constrainToViewport(
        dragState.width,
        dragState.height,
        desiredOffsetX,
        desiredOffsetY
      );
      applyOffset(constrained.x, constrained.y);
    }
    function handlePointerUp(event) {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }
      const { width, height } = dragState;
      stopDragging();
      commitConstrainedOffsets({ width, height });
    }
    function beginDrag(event) {
      if (event.button !== 0 || !options.draggable) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (options.dragHandle) {
        const handle = target.closest(options.dragHandle);
        if (!handle || !surface.contains(handle)) {
          return;
        }
      }
      if (target.closest(DRAG_EXCLUDE_SELECTOR)) {
        return;
      }
      const rect = surface.getBoundingClientRect();
      const offsets = getCurrentOffsets();
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseOffsetX: offsets.x,
        baseOffsetY: offsets.y,
        width: rect.width,
        height: rect.height
      };
      surface.setPointerCapture?.(event.pointerId);
      surface.classList.add("is-dragging");
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
      event.preventDefault();
    }
    function handleSurfacePointerDown(event) {
      beginDrag(event);
    }
    surface.addEventListener("pointerdown", handleSurfacePointerDown);
    function stopResizing({ commit = true } = {}) {
      if (!resizeState) {
        return;
      }
      window.removeEventListener("pointermove", handleResizePointerMove);
      window.removeEventListener("pointerup", handleResizePointerUp);
      window.removeEventListener("pointercancel", handleResizePointerUp);
      resizeHandle?.releasePointerCapture?.(resizeState.pointerId);
      surface.classList.remove("is-resizing");
      if (commit) {
        clampSizeToViewport();
      }
      resizeState = null;
    }
    function handleResizePointerMove(event) {
      if (!resizeState || event.pointerId !== resizeState.pointerId) {
        return;
      }
      const deltaX = event.clientX - resizeState.startX;
      const deltaY = event.clientY - resizeState.startY;
      const constraints = getSizeConstraints();
      const desiredWidth = resizeState.baseWidth + deltaX;
      const desiredHeight = resizeState.baseHeight + deltaY;
      const width = clamp(desiredWidth, constraints.minWidth, constraints.maxWidth);
      const height = clamp(desiredHeight, constraints.minHeight, constraints.maxHeight);
      applySize(width, height, { manual: true });
      commitConstrainedOffsets({ width, height });
    }
    function handleResizePointerUp(event) {
      if (!resizeState || event.pointerId !== resizeState.pointerId) {
        return;
      }
      stopResizing();
    }
    function handleResizePointerDown(event) {
      if (event.button !== 0 || !options.resizable) {
        return;
      }
      if (!(event.currentTarget instanceof HTMLElement)) {
        return;
      }
      const rect = surface.getBoundingClientRect();
      resizeState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseWidth: rect.width,
        baseHeight: rect.height
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      surface.classList.add("is-resizing");
      window.addEventListener("pointermove", handleResizePointerMove);
      window.addEventListener("pointerup", handleResizePointerUp);
      window.addEventListener("pointercancel", handleResizePointerUp);
      event.stopPropagation();
      event.preventDefault();
    }
    function ensureResizeHandle() {
      if (!options.resizable) {
        return;
      }
      if (resizeHandle && surface.contains(resizeHandle)) {
        return;
      }
      if (resizeHandle) {
        resizeHandle.removeEventListener("pointerdown", handleResizePointerDown);
        resizeHandle = null;
      }
      const handle = document.createElement("div");
      handle.className = "modal-resize-handle";
      handle.setAttribute("aria-hidden", "true");
      handle.tabIndex = -1;
      surface.appendChild(handle);
      handle.addEventListener("pointerdown", handleResizePointerDown);
      resizeHandle = handle;
    }
    function destroyResizeHandle() {
      if (!resizeHandle) {
        return;
      }
      resizeHandle.removeEventListener("pointerdown", handleResizePointerDown);
      if (resizeHandle.parentNode === surface) {
        resizeHandle.parentNode.removeChild(resizeHandle);
      }
      resizeHandle = null;
    }
    function syncResizableState() {
      if (options.resizable) {
        surface.dataset.resizable = "true";
        ensureResizeHandle();
        if (isOpen) {
          clampSizeToViewport();
        }
      } else {
        stopResizing({ commit: false });
        destroyResizeHandle();
        delete surface.dataset.resizable;
        clearSurfaceSize();
      }
    }
    function handleViewportResize() {
      if (!isOpen) {
        return;
      }
      if (options.resizable) {
        clampSizeToViewport();
      } else if (options.draggable) {
        commitConstrainedOffsets();
      }
    }
    window.addEventListener("resize", handleViewportResize, { passive: true });
    window.addEventListener("orientationchange", handleViewportResize, { passive: true });
    syncResizableState();
    function openModal() {
      if (isOpen) {
        return;
      }
      resetPosition();
      previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      isOpen = true;
      updateContainerState();
      syncResizableState();
      if (options.lockScroll) {
        lockedModalCount += 1;
        ensureResizeListener();
        syncDocumentState();
      }
      if (options.resizable) {
        clampSizeToViewport();
      } else if (options.draggable) {
        commitConstrainedOffsets();
      }
      focusInitialElement();
      options.onOpen?.();
    }
    function closeModal({ restoreFocus = true } = {}) {
      if (!isOpen) {
        return;
      }
      isOpen = false;
      updateContainerState();
      stopResizing({ commit: false });
      stopDragging();
      resetPosition();
      if (options.lockScroll) {
        lockedModalCount = Math.max(0, lockedModalCount - 1);
        syncDocumentState();
      }
      options.onClose?.();
      const shouldRestoreFocus = restoreFocus && previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function";
      if (shouldRestoreFocus) {
        previouslyFocusedElement.focus();
      }
      previouslyFocusedElement = null;
    }
    function handleFocusTrap(event) {
      if (!isOpen || options.trapFocus === false || event.key !== "Tab") {
        return;
      }
      refreshFocusCycle();
      if (!focusableElements.length) {
        event.preventDefault();
        surface.focus({ preventScroll: true });
        return;
      }
      const currentIndex = focusableElements.indexOf(event.target);
      const lastIndex = focusableElements.length - 1;
      if (event.shiftKey) {
        if (currentIndex <= 0) {
          event.preventDefault();
          focusableElements[lastIndex].focus();
        }
      } else {
        if (currentIndex === lastIndex) {
          event.preventDefault();
          focusableElements[0].focus();
        }
      }
    }
    function requestClose(reason) {
      if (requestCloseHandler) {
        const result = requestCloseHandler(reason);
        if (result === false) {
          return;
        }
      }
      closeModal();
    }
    function handleKeydown(event) {
      if (!isOpen) {
        return;
      }
      if (event.key === "Escape" && options.closeOnEscape !== false) {
        event.preventDefault();
        requestClose("escape");
        return;
      }
      handleFocusTrap(event);
    }
    function handlePointerDown(event) {
      if (!isOpen || options.closeOnBackdrop === false) {
        return;
      }
      if (event.target === overlay) {
        event.preventDefault();
        requestClose("backdrop");
      }
    }
    container.addEventListener("keydown", handleKeydown);
    overlay.addEventListener("pointerdown", handlePointerDown);
    const controller = {
      open: openModal,
      close(options2) {
        closeModal(options2);
      },
      toggle(force) {
        const shouldOpen = typeof force === "boolean" ? force : !isOpen;
        if (shouldOpen) {
          openModal();
        } else {
          closeModal();
        }
      },
      isOpen: () => isOpen,
      requestClose,
      refreshFocusTrap: refreshFocusCycle,
      resetPosition,
      setSize(size) {
        if (!size) return;
        container.dataset.modalSize = size;
      },
      setTone(tone) {
        if (!tone) return;
        container.dataset.modalTone = tone;
      },
      setCloseHandler(handler) {
        requestCloseHandler = typeof handler === "function" ? handler : null;
      },
      updateConfig(next = {}) {
        let layoutChanged = false;
        if (typeof next.labelledBy === "string") {
          container.setAttribute("aria-labelledby", next.labelledBy);
        }
        if (typeof next.describedBy === "string") {
          container.setAttribute("aria-describedby", next.describedBy);
        }
        if (typeof next.trapFocus === "boolean") {
          options.trapFocus = next.trapFocus;
        }
        if (typeof next.closeOnBackdrop === "boolean") {
          options.closeOnBackdrop = next.closeOnBackdrop;
        }
        if (typeof next.closeOnEscape === "boolean") {
          options.closeOnEscape = next.closeOnEscape;
        }
        if (typeof next.lockScroll === "boolean") {
          options.lockScroll = next.lockScroll;
          container.dataset.modalMode = options.lockScroll ? "modal" : "floating";
          container.dataset.modalOverlay = options.lockScroll ? "scrim" : "none";
          if (isOpen && options.draggable && !options.resizable) {
            commitConstrainedOffsets();
          }
        }
        if (typeof next.draggable === "boolean") {
          options.draggable = next.draggable;
          if (options.draggable) {
            container.dataset.modalDraggable = "true";
            if (isOpen) {
              commitConstrainedOffsets();
            }
          } else {
            delete container.dataset.modalDraggable;
            stopDragging();
            if (isOpen) {
              resetPosition();
            }
          }
        }
        if (typeof next.dragHandle === "string" || next.dragHandle === null) {
          options.dragHandle = typeof next.dragHandle === "string" ? next.dragHandle : null;
        }
        if (typeof next.resizable === "boolean") {
          options.resizable = next.resizable;
          layoutChanged = true;
        }
        const minWidth = parsePositiveNumber(next.minWidth);
        if (minWidth !== null) {
          options.minWidth = minWidth;
          layoutChanged = true;
        }
        const minHeight = parsePositiveNumber(next.minHeight);
        if (minHeight !== null) {
          options.minHeight = minHeight;
          layoutChanged = true;
        }
        if (next.maxWidth === null) {
          options.maxWidth = null;
          layoutChanged = true;
        } else {
          const maxWidth = parsePositiveNumber(next.maxWidth);
          if (maxWidth !== null) {
            options.maxWidth = maxWidth;
            layoutChanged = true;
          }
        }
        if (next.maxHeight === null) {
          options.maxHeight = null;
          layoutChanged = true;
        } else {
          const maxHeight = parsePositiveNumber(next.maxHeight);
          if (maxHeight !== null) {
            options.maxHeight = maxHeight;
            layoutChanged = true;
          }
        }
        if (typeof next.onOpen === "function") {
          options.onOpen = next.onOpen;
        }
        if (typeof next.onClose === "function") {
          options.onClose = next.onClose;
        }
        if (layoutChanged) {
          syncResizableState();
          if (!options.resizable && options.draggable && isOpen) {
            commitConstrainedOffsets();
          }
        }
      },
      destroy() {
        overlay.removeEventListener("pointerdown", handlePointerDown);
        container.removeEventListener("keydown", handleKeydown);
        surface.removeEventListener("pointerdown", handleSurfacePointerDown);
        window.removeEventListener("resize", handleViewportResize);
        window.removeEventListener("orientationchange", handleViewportResize);
        stopResizing({ commit: false });
        destroyResizeHandle();
        delete surface.dataset.resizable;
        clearSurfaceSize();
        closeModal({ restoreFocus: false });
        container.innerHTML = "";
        container.classList.remove("modal-host");
        container.removeAttribute("role");
        container.removeAttribute("aria-hidden");
        container.removeAttribute("aria-modal");
        container.removeAttribute("aria-labelledby");
        container.removeAttribute("aria-describedby");
        delete container.dataset.modalSize;
        delete container.dataset.modalTone;
        delete container.dataset.modalMode;
        delete container.dataset.modalOverlay;
        delete container.dataset.modalDraggable;
        delete container.dataset.open;
        if (hostPlaceholder && hostPlaceholder.parentNode) {
          hostPlaceholder.parentNode.replaceChild(container, hostPlaceholder);
          hostPlaceholder = null;
        } else if (originalParent && !originalParent.contains(container)) {
          originalParent.appendChild(container);
        }
      },
      get surface() {
        return surface;
      },
      get overlay() {
        return overlay;
      },
      get container() {
        return container;
      }
    };
    return controller;
  }

  // scripts/ui/statsPanel.js
  var TITLE_ID = "statsDialogTitle";
  var statElements = /* @__PURE__ */ new Map();
  var containerRef = null;
  var gridRef = null;
  var closeButtonRef = null;
  var modalController = null;
  var onRequestCloseRef = null;
  function handleCloseClick(event) {
    event?.preventDefault?.();
    if (modalController) {
      modalController.requestClose("action");
      return;
    }
    onRequestCloseRef?.();
  }
  function initializeStatsUI(container, stats2, options = {}) {
    if (!container) {
      containerRef = null;
      gridRef = null;
      closeButtonRef = null;
      modalController?.destroy?.();
      modalController = null;
      onRequestCloseRef = null;
      statElements.clear();
      return;
    }
    onRequestCloseRef = typeof options.onRequestClose === "function" ? options.onRequestClose : null;
    if (closeButtonRef) {
      closeButtonRef.removeEventListener("click", handleCloseClick);
    }
    modalController?.destroy?.();
    modalController = null;
    containerRef = container;
    containerRef.classList.add("stats-panel");
    modalController = createModalHost(containerRef, {
      labelledBy: TITLE_ID,
      size: "wide",
      tone: "midnight",
      trapFocus: false,
      closeOnBackdrop: false,
      lockScroll: false,
      draggable: true,
      dragHandle: ".stats-modal__header",
      resizable: true,
      minWidth: 520,
      minHeight: 420,
      onRequestClose: () => {
        if (onRequestCloseRef) {
          onRequestCloseRef();
        }
        return true;
      }
    });
    const surface = modalController.surface;
    surface.classList.add("stats-modal");
    surface.innerHTML = `
    <header class="stats-modal__header">
      <div class="stats-modal__titles">
        <p class="stats-modal__subtitle">Profil Kepribadian</p>
        <h2 class="stats-modal__title" id="${TITLE_ID}">Stat Karakter</h2>
      </div>
      <button type="button" class="stats-modal__close" aria-label="Tutup stat">
        <span aria-hidden="true">\u2715</span>
      </button>
    </header>
    <div class="stats-modal__body">
      <div class="stats-grid" role="list"></div>
    </div>
  `;
    gridRef = surface.querySelector(".stats-grid");
    closeButtonRef = surface.querySelector(".stats-modal__close");
    closeButtonRef?.addEventListener("click", handleCloseClick);
    statElements.clear();
    gridRef.innerHTML = "";
    statsOrder.forEach((key) => {
      const stat = stats2[key];
      if (!stat) return;
      const card = document.createElement("article");
      card.className = "stat-card";
      card.dataset.stat = key;
      card.setAttribute("role", "listitem");
      if (stat.color) {
        card.style.setProperty("--stat-color", stat.color);
      }
      if (stat.colorStrong) {
        card.style.setProperty("--stat-color-strong", stat.colorStrong);
      }
      if (stat.colorSoft) {
        card.style.setProperty("--stat-color-soft", stat.colorSoft);
      }
      card.tabIndex = 0;
      card.setAttribute(
        "aria-label",
        `${stat.displayName} (${stat.alias}). ${stat.description} Nilai awal ${stat.initial}.`
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
      gridRef.appendChild(card);
      statElements.set(key, { card, bar, progress, value, tier });
    });
    modalController.refreshFocusTrap();
  }
  function onStatsVisibilityChange(visible) {
    if (!containerRef || !modalController) {
      return;
    }
    if (visible) {
      modalController.open();
      window.requestAnimationFrame(() => {
        closeButtonRef?.focus?.();
      });
    } else {
      modalController.close({ restoreFocus: false });
    }
  }
  function updateStatsUI(stats2) {
    if (!statElements.size) {
      return;
    }
    statsOrder.forEach((key) => {
      const stat = stats2[key];
      const elements = statElements.get(key);
      if (!stat || !elements) return;
      const percent = Math.round(stat.value / stat.max * 100);
      elements.bar.style.width = `${percent}%`;
      elements.progress.setAttribute("aria-valuenow", String(stat.value));
      elements.progress.setAttribute("aria-valuetext", `${stat.value} dari ${stat.max}`);
      elements.value.textContent = Math.round(stat.value);
      const tierLevel = getTier(stat.value, stat.max);
      elements.tier.textContent = `Level ${tierLevel} \u2022 ${tierLabels[tierLevel]}`;
      elements.card.dataset.tier = String(tierLevel);
    });
  }

  // scripts/util/math.js
  function clamp2(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function normalizeValue(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    const rounded = Number(value.toFixed(2));
    return Math.abs(rounded) < 0.01 ? 0 : rounded;
  }

  // scripts/ui/statusPanel.js
  var statusElements = /* @__PURE__ */ new Map();
  var containerRef2 = null;
  function initializeStatusPanel(container, worldState2) {
    if (!container) {
      containerRef2 = null;
      statusElements.clear();
      return;
    }
    containerRef2 = container;
    containerRef2.innerHTML = "";
    statusElements.clear();
    statusOrder.forEach((key) => {
      const meta = statusConfig[key];
      if (!meta) return;
      const card = document.createElement("article");
      card.className = "status-card";
      card.dataset.metric = key;
      card.tabIndex = 0;
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
      const description = document.createElement("p");
      description.className = "status-description sr-only";
      const descriptionId = `status-${key}-description`;
      description.id = descriptionId;
      const initialValue = Number(worldState2[key] ?? meta.min ?? 0);
      description.textContent = meta.describeState?.(initialValue, worldState2) ?? "";
      card.dataset.tooltip = description.textContent ?? "";
      if (description.textContent) {
        card.setAttribute("aria-describedby", descriptionId);
      }
      card.appendChild(description);
      containerRef2.appendChild(card);
      statusElements.set(key, { card, value, meterFill, description });
    });
    updateStatusPanel(worldState2);
  }
  function updateStatusPanel(worldState2) {
    if (!statusElements.size) {
      return;
    }
    statusOrder.forEach((key) => {
      const meta = statusConfig[key];
      const elements = statusElements.get(key);
      if (!meta || !elements) return;
      const value = Number(worldState2[key] ?? 0);
      elements.value.textContent = meta.formatValue ? meta.formatValue(value) : String(value);
      if (meta.meter && elements.meterFill) {
        const min = typeof meta.min === "number" ? meta.min : 0;
        const max = typeof meta.max === "number" ? meta.max : 100;
        const percent = (value - min) / (max - min) * 100;
        elements.meterFill.style.width = `${clamp2(percent, 0, 100)}%`;
      }
      if (elements.description) {
        const description = meta.describeState?.(value, worldState2) ?? "";
        elements.description.textContent = description;
        if (description) {
          elements.card.dataset.tooltip = description;
          elements.card.setAttribute("aria-describedby", elements.description.id);
        } else {
          elements.card.dataset.tooltip = "";
          elements.card.removeAttribute("aria-describedby");
        }
      }
    });
  }

  // scripts/ui/feedbackPanel.js
  function renderFeedback(container, aggregatedChanges, insights, getMetadata, defaultFormatter) {
    if (!container) {
      return;
    }
    container.innerHTML = "";
    if (aggregatedChanges.length) {
      const heading = document.createElement("h2");
      heading.textContent = "Perubahan Stat";
      container.appendChild(heading);
      const list = document.createElement("ul");
      list.className = "stat-changes";
      aggregatedChanges.forEach((change) => {
        const metadata = getMetadata(change.key);
        const alias = metadata?.alias ?? change.key;
        const positiveIsGood = metadata?.positiveIsGood !== false;
        const isPositive = change.amount > 0;
        const outcomePositive = isPositive && positiveIsGood || !isPositive && !positiveIsGood;
        const item = document.createElement("li");
        item.className = `stat-change ${outcomePositive ? "positive" : "negative"}`;
        const label = document.createElement("span");
        label.textContent = alias;
        const value = document.createElement("span");
        const formatter = metadata?.formatChange ?? defaultFormatter;
        value.textContent = formatter(change.amount);
        item.append(label, value);
        list.appendChild(item);
      });
      container.appendChild(list);
    }
    if (insights.length) {
      const heading = document.createElement("h2");
      heading.textContent = "Catatan Kondisi";
      container.appendChild(heading);
      const list = document.createElement("ul");
      list.className = "insights";
      insights.forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      });
      container.appendChild(list);
    }
  }

  // scripts/ui/storyRenderer.js
  function setStoryText(container, content) {
    if (!container) {
      return;
    }
    container.innerHTML = "";
    const paragraphs = Array.isArray(content) ? content.filter(Boolean) : String(content).split("\n").map((paragraph) => paragraph.trim()).filter(Boolean);
    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      container.appendChild(p);
    });
  }

  // scripts/ui/mapPanel.js
  var layout = [
    { id: "halaman", label: "Halaman", row: 2, col: 1 },
    { id: "ruangKeluarga", label: "Ruang Keluarga", row: 2, col: 2 },
    { id: "kamarAyah", label: "Kamar Ayah", row: 1, col: 2 },
    { id: "dapur", label: "Dapur", row: 3, col: 3 },
    { id: "ruangKerja", label: "Ruang Kerja", row: 1, col: 3 }
  ];
  var containerRef3 = null;
  var cellElements = /* @__PURE__ */ new Map();
  var connectionElements = /* @__PURE__ */ new Map();
  var roomMetadata = /* @__PURE__ */ new Map();
  var gridRows = Math.max(...layout.map((room) => room.row));
  var gridCols = Math.max(...layout.map((room) => room.col));
  var GRID_UNIT = 100;
  var travelHandler = null;
  var activeLocationId = null;
  function buildConnectionKey(a, b) {
    return [a, b].sort().join("::");
  }
  function handleCellClick(targetId) {
    if (!travelHandler) {
      return;
    }
    if (targetId === activeLocationId) {
      return;
    }
    travelHandler(targetId);
  }
  function initializeMiniMap(container, options = {}) {
    if (!container) {
      containerRef3 = null;
      cellElements.clear();
      connectionElements.clear();
      roomMetadata.clear();
      travelHandler = null;
      activeLocationId = null;
      return;
    }
    containerRef3 = container;
    containerRef3.innerHTML = "";
    cellElements.clear();
    containerRef3.setAttribute("role", "group");
    containerRef3.setAttribute("aria-label", "Denah rumah dan jalur perpindahan");
    travelHandler = typeof options.onRequestTravel === "function" ? options.onRequestTravel : null;
    activeLocationId = null;
    const grid = document.createElement("div");
    grid.className = "mini-map-grid";
    grid.style.setProperty("--rows", String(gridRows));
    grid.style.setProperty("--cols", String(gridCols));
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlay.classList.add("mini-map-connections");
    overlay.setAttribute("viewBox", `0 0 ${gridCols * GRID_UNIT} ${gridRows * GRID_UNIT}`);
    overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");
    connectionElements.clear();
    roomMetadata.clear();
    layout.forEach((room) => {
      const cell = document.createElement("button");
      cell.className = "mini-map-cell";
      cell.type = "button";
      cell.dataset.location = room.id;
      cell.style.setProperty("--row", room.row);
      cell.style.setProperty("--col", room.col);
      cell.setAttribute("aria-label", room.label);
      cell.title = room.label;
      cell.addEventListener("click", () => handleCellClick(room.id));
      const name = document.createElement("span");
      name.className = "mini-map-label";
      name.textContent = room.label;
      cell.appendChild(name);
      grid.appendChild(cell);
      cellElements.set(room.id, cell);
      roomMetadata.set(room.id, { label: room.label });
    });
    containerRef3.appendChild(overlay);
    containerRef3.appendChild(grid);
    const positions = /* @__PURE__ */ new Map();
    layout.forEach((room) => {
      positions.set(room.id, {
        x: (room.col - 0.5) * GRID_UNIT,
        y: (room.row - 0.5) * GRID_UNIT
      });
    });
    const seen = /* @__PURE__ */ new Set();
    Object.entries(locations).forEach(([fromId, location]) => {
      if (!positions.has(fromId)) return;
      (location.connections || []).forEach((targetId) => {
        if (!positions.has(targetId)) return;
        const key = buildConnectionKey(fromId, targetId);
        if (seen.has(key)) return;
        seen.add(key);
        const start = positions.get(fromId);
        const end = positions.get(targetId);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(start.x));
        line.setAttribute("y1", String(start.y));
        line.setAttribute("x2", String(end.x));
        line.setAttribute("y2", String(end.y));
        line.dataset.from = fromId;
        line.dataset.to = targetId;
        overlay.appendChild(line);
        connectionElements.set(key, line);
      });
    });
  }
  function updateMiniMap(activeLocation) {
    if (!cellElements.size) {
      return;
    }
    activeLocationId = activeLocation;
    const current = locations[activeLocation];
    const reachable = new Set(current?.connections || []);
    cellElements.forEach((cell, id) => {
      const isActive = id === activeLocation;
      const isAdjacent = reachable.has(id);
      const canTravel = isAdjacent;
      const metadata = roomMetadata.get(id);
      const labelParts = [metadata?.label ?? id];
      cell.classList.toggle("active", isActive);
      cell.classList.toggle("adjacent", isAdjacent);
      if (isActive) {
        cell.setAttribute("aria-current", "true");
        labelParts.push("Lokasi saat ini.");
      } else {
        cell.removeAttribute("aria-current");
        if (canTravel) {
          labelParts.push("Klik untuk berpindah.");
        } else {
          labelParts.push("Belum bisa diakses langsung.");
        }
      }
      if (isActive || canTravel) {
        cell.disabled = false;
        cell.removeAttribute("aria-disabled");
      } else {
        cell.disabled = true;
        cell.setAttribute("aria-disabled", "true");
      }
      const label = labelParts.join(" ").trim();
      cell.setAttribute("aria-label", label);
      cell.title = label;
    });
    connectionElements.forEach((line) => {
      if (!line) return;
      const { from, to } = line.dataset;
      if (from === activeLocation || to === activeLocation) {
        line.classList.add("active");
      } else {
        line.classList.remove("active");
      }
    });
  }

  // scripts/ui/journal.js
  var STORAGE_KEY = "jalanKeluar:journalSnapshot";
  var TITLE_ID2 = "journalDialogTitle";
  var TIMESTAMP_ID = "journalDialogTimestamp";
  var buttonRef = null;
  var panelRef = null;
  var modalController2 = null;
  var providerRef = () => [];
  var openLabel = "Lihat Jurnal";
  var closeLabel = "Sembunyikan Jurnal";
  var contentRef = null;
  var timestampRef = null;
  var closeButtonRef2 = null;
  var fullViewLinkRef = null;
  var journalVisible = false;
  var lastSnapshot = null;
  function getStorage(type) {
    try {
      if (typeof window !== "undefined" && window[type]) {
        return window[type];
      }
    } catch (error) {
      console.warn(`Penyimpanan ${type} tidak tersedia untuk jurnal.`, error);
    }
    return null;
  }
  function getSessionStorage() {
    return getStorage("sessionStorage");
  }
  function getLocalStorage() {
    return getStorage("localStorage");
  }
  function getAvailableStorages() {
    return [
      { storage: getSessionStorage(), type: "session" },
      { storage: getLocalStorage(), type: "local" }
    ].filter(({ storage }) => Boolean(storage));
  }
  function sanitizeEntries(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries.map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const sanitized = {
        title: typeof entry.title === "string" ? entry.title : void 0,
        time: typeof entry.time === "string" ? entry.time : void 0,
        description: typeof entry.description === "string" ? entry.description : void 0
      };
      if (Array.isArray(entry.items)) {
        sanitized.items = entry.items.map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const note = {
            text: typeof item.text === "string" ? item.text : void 0
          };
          if (typeof item.time === "string") {
            note.time = item.time;
          }
          return note;
        }).filter(Boolean);
        if (!sanitized.items.length) {
          delete sanitized.items;
        }
      }
      return sanitized;
    }).filter(Boolean);
  }
  function storeSnapshot(entries) {
    const sanitizedEntries = sanitizeEntries(entries);
    const payload = {
      entries: sanitizedEntries,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const storages = getAvailableStorages();
    if (!storages.length) {
      console.warn("Penyimpanan web tidak tersedia untuk jurnal. Versi layar penuh mungkin tidak sinkron.");
      return payload;
    }
    storages.forEach(({ storage, type }) => {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn(`Gagal menyimpan data jurnal ke penyimpanan ${type}.`, error);
      }
    });
    return payload;
  }
  function getJournalTargetUrl() {
    return buttonRef?.getAttribute("data-journal-url") || "journal.html";
  }
  function formatTimestamp(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short"
    }).format(date);
  }
  function updateTimestampDisplay(value) {
    if (!timestampRef) {
      return;
    }
    const formatted = formatTimestamp(value);
    if (formatted) {
      timestampRef.textContent = `Diperbarui terakhir: ${formatted}`;
    } else {
      timestampRef.textContent = "Diperbarui terakhir: belum tersedia";
    }
  }
  function updateButtonState() {
    if (!buttonRef) {
      return;
    }
    const expanded = journalVisible ? "true" : "false";
    buttonRef.setAttribute("aria-expanded", expanded);
    buttonRef.setAttribute("aria-pressed", expanded);
    buttonRef.textContent = journalVisible ? closeLabel : openLabel;
  }
  function handleToggleButtonClick(event) {
    event?.preventDefault?.();
    setJournalVisibility(!journalVisible);
  }
  function handleCloseClick2(event) {
    event?.preventDefault?.();
    setJournalVisibility(false);
  }
  function handleFullViewClick() {
    storeSnapshot(providerRef());
  }
  function setJournalVisibility(visible) {
    journalVisible = Boolean(visible && modalController2);
    updateButtonState();
    if (!modalController2) {
      return;
    }
    if (journalVisible) {
      if (contentRef) {
        renderJournalEntries(contentRef, lastSnapshot?.entries ?? []);
      }
      updateTimestampDisplay(lastSnapshot?.generatedAt);
      modalController2.open();
      window.requestAnimationFrame(() => {
        closeButtonRef2?.focus?.();
      });
    } else {
      modalController2.close({ restoreFocus: false });
      if (buttonRef) {
        const active = document.activeElement;
        if (active instanceof HTMLElement && panelRef?.contains(active)) {
          buttonRef.focus({ preventScroll: true });
        }
      }
    }
  }
  function destroyModal() {
    closeButtonRef2?.removeEventListener("click", handleCloseClick2);
    closeButtonRef2 = null;
    fullViewLinkRef?.removeEventListener("click", handleFullViewClick);
    fullViewLinkRef = null;
    contentRef = null;
    timestampRef = null;
    modalController2?.destroy?.();
    modalController2 = null;
    panelRef = null;
    journalVisible = false;
    updateButtonState();
  }
  function setupModal(panel) {
    if (!panel) {
      destroyModal();
      return;
    }
    if (modalController2) {
      destroyModal();
    }
    panelRef = panel;
    panelRef.classList.add("journal-panel");
    modalController2 = createModalHost(panelRef, {
      labelledBy: TITLE_ID2,
      size: "wide",
      tone: "midnight",
      trapFocus: false,
      closeOnBackdrop: false,
      lockScroll: false,
      draggable: true,
      dragHandle: ".journal-modal__header",
      resizable: true,
      minWidth: 560,
      minHeight: 420,
      onRequestClose: () => {
        setJournalVisibility(false);
        return true;
      }
    });
    const surface = modalController2.surface;
    surface.classList.add("journal-modal");
    surface.innerHTML = `
    <header class="journal-modal__header">
      <div class="journal-modal__titles">
        <p class="journal-modal__subtitle">Catatan Strategi</p>
        <h2 class="journal-modal__title" id="${TITLE_ID2}">Jurnal Malam Ini</h2>
        <p class="journal-modal__timestamp" id="${TIMESTAMP_ID}" aria-live="polite"></p>
      </div>
      <button type="button" class="journal-modal__close" aria-label="Tutup jurnal">
        <span aria-hidden="true">\u2715</span>
      </button>
    </header>
    <div class="journal-modal__body">
      <div class="journal-modal__content"></div>
      <footer class="journal-modal__footer">
        <a class="journal-modal__link" href="${getJournalTargetUrl()}" target="_blank" rel="noopener">
          Buka versi layar penuh
        </a>
      </footer>
    </div>
  `;
    contentRef = surface.querySelector(".journal-modal__content");
    timestampRef = surface.querySelector(`#${TIMESTAMP_ID}`);
    closeButtonRef2 = surface.querySelector(".journal-modal__close");
    fullViewLinkRef = surface.querySelector(".journal-modal__link");
    closeButtonRef2?.addEventListener("click", handleCloseClick2);
    fullViewLinkRef?.addEventListener("click", handleFullViewClick);
    modalController2.refreshFocusTrap?.();
  }
  function initializeJournal(button, panel, provider) {
    if (buttonRef) {
      buttonRef.removeEventListener("click", handleToggleButtonClick);
    }
    buttonRef = button || null;
    providerRef = typeof provider === "function" ? provider : () => [];
    openLabel = "Lihat Jurnal";
    closeLabel = "Sembunyikan Jurnal";
    if (buttonRef) {
      openLabel = buttonRef.textContent?.trim() || openLabel;
      const customClose = buttonRef.getAttribute("data-close-label");
      if (typeof customClose === "string" && customClose.trim()) {
        closeLabel = customClose.trim();
      }
      buttonRef.setAttribute("aria-haspopup", "dialog");
      if (panel?.id) {
        buttonRef.setAttribute("aria-controls", panel.id);
      }
      buttonRef.addEventListener("click", handleToggleButtonClick);
    }
    setupModal(panel || null);
    journalVisible = false;
    updateButtonState();
    refreshJournal();
  }
  function refreshJournal() {
    lastSnapshot = storeSnapshot(providerRef());
    if (contentRef && lastSnapshot) {
      renderJournalEntries(contentRef, lastSnapshot.entries);
    }
    updateTimestampDisplay(lastSnapshot?.generatedAt);
  }
  function closeJournal() {
    clearJournalSnapshot();
    setJournalVisibility(false);
  }
  function clearJournalSnapshot() {
    const storages = getAvailableStorages();
    storages.forEach(({ storage, type }) => {
      try {
        storage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn(`Gagal menghapus data jurnal dari penyimpanan ${type}.`, error);
      }
    });
  }
  function renderJournalEntries(container, entries) {
    if (!container) {
      return;
    }
    const listContainer = container;
    listContainer.innerHTML = "";
    const sanitizedEntries = sanitizeEntries(entries);
    if (!sanitizedEntries.length) {
      const empty = document.createElement("p");
      empty.className = "journal-empty";
      empty.textContent = "Jurnal masih kosong. Catatan akan muncul ketika ada agenda yang perlu diwaspadai.";
      listContainer.appendChild(empty);
      return;
    }
    const intro = document.createElement("p");
    intro.className = "journal-description";
    intro.textContent = "Catatan waktu dan ancaman penting yang perlu kamu ingat selama malam ini.";
    listContainer.appendChild(intro);
    const list = document.createElement("ol");
    list.className = "journal-list";
    sanitizedEntries.forEach((entry) => {
      const item = document.createElement("li");
      if (entry.title) {
        const title = document.createElement("h3");
        title.textContent = entry.title;
        item.appendChild(title);
      }
      if (entry.time) {
        const time = document.createElement("p");
        time.className = "journal-time";
        time.textContent = entry.time;
        item.appendChild(time);
      }
      if (entry.description) {
        const description = document.createElement("p");
        description.textContent = entry.description;
        item.appendChild(description);
      }
      if (Array.isArray(entry.items) && entry.items.length) {
        const notes = document.createElement("ul");
        notes.className = "journal-sublist";
        entry.items.forEach((note) => {
          if (!note) {
            return;
          }
          const row = document.createElement("li");
          if (note.text) {
            const noteText = document.createElement("span");
            noteText.className = "journal-subtext";
            noteText.textContent = note.text;
            row.appendChild(noteText);
          }
          if (note.time) {
            const noteTime = document.createElement("span");
            noteTime.className = "journal-subtime";
            noteTime.textContent = note.time;
            row.appendChild(noteTime);
          }
          if (row.childElementCount > 0) {
            notes.appendChild(row);
          }
        });
        if (notes.childElementCount > 0) {
          item.appendChild(notes);
        }
      }
      list.appendChild(item);
    });
    listContainer.appendChild(list);
  }

  // scripts/util/time.js
  var weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  var months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  function formatTime(hour, minute = 0) {
    const normalizedHour = (Math.floor(hour) % 24 + 24) % 24;
    const normalizedMinute = (minute % 60 + 60) % 60;
    return `${String(normalizedHour).padStart(2, "0")}:${String(normalizedMinute).padStart(2, "0")}`;
  }
  function formatCalendarDate(state) {
    const weekday = weekdays[state.weekdayIndex % weekdays.length];
    const monthName = months[state.monthIndex % months.length];
    return `${weekday}, ${state.dayOfMonth} ${monthName} ${state.year}`;
  }
  function formatDuration(hours = 1) {
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} menit`;
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) {
      return `${h} jam`;
    }
    return `${h} jam ${m} menit`;
  }
  function getDaysInMonth(monthIndex, year) {
    const thirtyOne = /* @__PURE__ */ new Set([0, 2, 4, 6, 7, 9, 11]);
    if (monthIndex === 1) {
      const isLeap = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      return isLeap ? 29 : 28;
    }
    return thirtyOne.has(monthIndex) ? 31 : 30;
  }
  function advanceCalendarDay(state) {
    state.weekdayIndex = (state.weekdayIndex + 1) % weekdays.length;
    state.dayOfMonth += 1;
    const daysInMonth = getDaysInMonth(state.monthIndex, state.year);
    if (state.dayOfMonth > daysInMonth) {
      state.dayOfMonth = 1;
      state.monthIndex += 1;
      if (state.monthIndex >= months.length) {
        state.monthIndex = 0;
        state.year += 1;
      }
    }
  }

  // scripts/ui/themeToggle.js
  var STORAGE_KEY2 = "jalanKeluar:theme";
  var THEMES = /* @__PURE__ */ new Set(["dark", "light"]);
  var buttonRef2 = null;
  var mediaQueryRef = null;
  var currentTheme = "dark";
  var hasStoredPreference = false;
  function getStoredTheme() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY2);
      if (value && THEMES.has(value)) {
        return value;
      }
    } catch (error) {
      console.warn("Gagal membaca preferensi tema dari penyimpanan.", error);
    }
    return null;
  }
  function persistTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY2, theme);
    } catch (error) {
      console.warn("Gagal menyimpan preferensi tema.", error);
    }
  }
  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function updateButton(theme) {
    if (!buttonRef2) {
      return;
    }
    const isLight = theme === "light";
    buttonRef2.setAttribute("aria-pressed", String(isLight));
    buttonRef2.setAttribute("aria-label", isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang");
    buttonRef2.dataset.theme = theme;
    const icon = buttonRef2.querySelector(".theme-toggle__icon");
    const label = buttonRef2.querySelector(".theme-toggle__label");
    if (icon) {
      icon.textContent = isLight ? "\u2600\uFE0F" : "\u{1F319}";
    }
    if (label) {
      label.textContent = isLight ? "Mode Terang" : "Mode Gelap";
    }
  }
  function applyTheme(theme, { persist = true } = {}) {
    if (!THEMES.has(theme)) {
      theme = "dark";
    }
    currentTheme = theme;
    document.documentElement.dataset.theme = theme;
    if (persist) {
      persistTheme(theme);
      hasStoredPreference = true;
    }
    updateButton(theme);
  }
  function handleButtonClick(event) {
    event?.preventDefault?.();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, { persist: true });
  }
  function handleSystemChange(event) {
    if (hasStoredPreference) {
      return;
    }
    const theme = event.matches ? "light" : "dark";
    applyTheme(theme, { persist: false });
  }
  function initializeThemeToggle(button) {
    if (buttonRef2) {
      buttonRef2.removeEventListener("click", handleButtonClick);
    }
    buttonRef2 = button ?? null;
    const storedTheme = getStoredTheme();
    hasStoredPreference = storedTheme !== null;
    const initialTheme = storedTheme ?? getSystemTheme();
    applyTheme(initialTheme, { persist: false });
    if (buttonRef2) {
      buttonRef2.addEventListener("click", handleButtonClick);
      updateButton(initialTheme);
    }
    if (mediaQueryRef) {
      mediaQueryRef.removeEventListener("change", handleSystemChange);
    }
    if (window.matchMedia) {
      mediaQueryRef = window.matchMedia("(prefers-color-scheme: light)");
      mediaQueryRef.addEventListener("change", handleSystemChange);
    }
  }

  // scripts/game/engine.js
  var stats = createInitialStats();
  var allStatsMetadata = /* @__PURE__ */ new Map();
  var worldState = createInitialWorldState();
  var gameEnded = false;
  var currentEnding = null;
  var conditionNoteMap = /* @__PURE__ */ new Map();
  var conditionNoteSequence = 0;
  var showInsightsInFeedback = true;
  var statsElement;
  var statusSummaryElement;
  var statusMetricsElement;
  var storyElement;
  var feedbackElement;
  var choicesElement;
  var restartButton;
  var toggleStatsButton;
  var journalButton;
  var journalPanel;
  var miniMapContainer;
  var themeToggleButton;
  var statsPanelVisible = false;
  var ACTION_HOTKEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var TRAVEL_HOTKEYS = Array.from("abcdefghijklmnopqrstuvwxyz");
  var choiceHotkeys = /* @__PURE__ */ new Map();
  var hotkeyListenerAttached = false;
  function normalizeHotkey(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
  }
  function isTextEntryElement(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }
    const tagName = element.tagName;
    return element.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
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
    if (typeof button?.focus === "function") {
      button.focus({ preventScroll: true });
    }
    handler?.();
  }
  function ensureChoiceHotkeyListener() {
    if (hotkeyListenerAttached) {
      return;
    }
    window.addEventListener("keydown", handleChoiceHotkey, { passive: false });
    hotkeyListenerAttached = true;
  }
  function clearChoiceHotkeys() {
    choiceHotkeys.clear();
  }
  function registerChoiceHotkey(key, button, handler) {
    const normalized = normalizeHotkey(key);
    if (!normalized || !button || typeof handler !== "function") {
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
  function initializeGame() {
    detachUiHandlers();
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
        colorSoft: stat.colorSoft
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
        colorSoft: meta.colorSoft ?? fallbackColorSoft
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
      money: 13e5,
      debt: 82e6,
      debtInterestRate: 45e-4,
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
        homeBusinessPlan: false,
        homeBusinessLaunched: false,
        homeBusinessMomentum: 0,
        creatorChannel: false,
        creatorMomentum: 0
      }
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
    const introText = "Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar. Para penagih masih berjaga di depan pagar.";
    renderScene([introText], []);
  }
  function updateStatusSummary() {
    const location = locations[worldState.location];
    const clock = formatTime(worldState.hour, worldState.minute);
    const calendar = formatCalendarDate(worldState);
    if (statusSummaryElement) {
      const summaryParts = [
        `Hari ${worldState.day} (${calendar})`,
        clock,
        location?.name ?? "Lokasi tidak dikenal"
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
      statusSummaryElement.textContent = summaryParts.join(" \u2022 ");
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
      const next = clamp2(previous + amount, 0, stat.max);
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
    const rawBaseEffects = typeof action.baseEffects === "function" ? action.baseEffects(state) : action.baseEffects || {};
    const rawStatusChanges = typeof action.statusChanges === "function" ? action.statusChanges(state) : action.statusChanges || {};
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
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 0.7 : value * 1.15);
        adjustChange(statusChanges, "fatigue", (value) => value + 2.5);
        notes.push("Kelelahan tinggi membuat gerakanmu melambat dan hasilnya berkurang.");
      } else if (fatigue <= 30) {
        adjustMultiple(statusChanges, ["fatherHealth"], (value) => value * 1.2);
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 1.25 : value * 0.85);
        adjustChange(statusChanges, "fatigue", (value) => value - 2);
        notes.push("Tubuh yang masih segar membuat upaya fisikmu lebih efektif.");
      }
    }
    if (traits.has("work")) {
      if (fatigue >= 65) {
        adjustChange(statusChanges, "money", (value) => value * 0.85);
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 1.1 : value);
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
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 0.7 : value * 1.15);
        incrementEffect(baseEffects, "willpower", 0.5);
        notes.push("Tekad tinggi membantumu tetap fokus di tengah tekanan.");
        focusedWillpower = true;
      } else if (willpower <= 40) {
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 1.2 : value * 0.85);
        notes.push("Tekad yang melemah membuat tekanan terasa lebih berat.");
      }
    }
    if (traits.has("planning") || traits.has("documentation")) {
      if (awareness >= 65) {
        incrementEffect(baseEffects, "awareness", 1);
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 0.85 : value);
        notes.push("Kewaspadaan tinggi memudahkanmu memilah informasi penting.");
      } else if (awareness <= 35) {
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 1.15 : value * 0.9);
        notes.push("Kurang fokus membuat analisis terasa melelahkan.");
      }
    }
    if (traits.has("recovery")) {
      if (stressLevel >= 80) {
        adjustChange(statusChanges, "fatigue", (value) => value * 0.8);
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 0.9 : value);
        notes.push("Stres tinggi membuat pemulihan tidak maksimal.");
      } else if (willpower >= 65) {
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 1.2 : value);
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
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 1.2 : value * 0.9);
        notes.push("Pembawaan percaya diri membuat interaksi berjalan mulus.");
      } else if (beauty <= 35) {
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 1.1 : value * 0.85);
        notes.push("Rasa canggung sedikit mengurangi hasil interaksimu.");
      }
      if (confidence >= 60) {
        adjustChange(statusChanges, "money", (value) => typeof value === "number" ? value * 1.08 : value);
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 1.1 : value);
        notes.push("Kepercayaan diri tinggi membuat ajakanmu lebih meyakinkan.");
      } else if (confidence <= 30) {
        adjustChange(statusChanges, "money", (value) => typeof value === "number" ? value * 0.92 : value);
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
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 0.85 : value);
        notes.push("Jaringanmu membantu meredakan tekanan menghadapi pelanggan.");
      } else if (networking <= 30) {
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 1.15 : value);
        notes.push("Jangkauan sempit membuat usaha sampingan terasa melelahkan.");
      }
    }
    return { baseEffects, statusChanges, notes };
  }
  function aggregateChanges(changes) {
    const combined = /* @__PURE__ */ new Map();
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
        colorSoft: metadata.colorSoft
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
        aggregate.fatherHealth = (aggregate.fatherHealth || 0) + applyStatusDelta("fatherHealth", -1.5 * portion);
      }
      if (worldState.stress >= 80) {
        aggregate.trauma = (aggregate.trauma || 0) + applyStatusDelta("trauma", 0.6 * portion);
      }
    }
    if (statusMetricsElement) {
      updateStatusPanel(worldState);
    }
    updateStatusSummary();
    return Object.entries(aggregate).map(([key, amount]) => ({ key, amount: normalizeValue(amount) })).filter((entry) => entry.amount !== 0);
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
    if (!button || !header || typeof onActivate !== "function") {
      return;
    }
    const badge = document.createElement("span");
    badge.className = "choice-key";
    badge.textContent = key.toUpperCase();
    badge.setAttribute("aria-hidden", "true");
    header.prepend(badge);
    const baseLabel = (ariaLabel || button.getAttribute("aria-label") || button.textContent || "").trim();
    const sentence = baseLabel.endsWith(".") ? baseLabel : baseLabel ? `${baseLabel}.` : "";
    const hotkeyLabel = key.toUpperCase();
    const ariaText = `${sentence ? `${sentence} ` : ""}Pintasan keyboard ${hotkeyLabel}.`.trim();
    if (ariaText) {
      button.setAttribute("aria-label", ariaText);
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
          const positiveOutcome = segment.amount > 0 && segment.positiveIsGood || segment.amount < 0 && !segment.positiveIsGood;
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
            separator.textContent = "\u2022";
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
      growth.push("Ketahanan mentalmu stabil\u2014manfaatkan untuk negosiasi yang menegangkan.");
    }
    if (worldState.money >= 5e6 && worldState.debt > 0) {
      financial.push("Dana yang ada cukup untuk menawar cicilan darurat agar penagih mereda.");
    }
    if (worldState.debt <= 4e7) {
      financial.push("Utang mulai terpangkas signifikan. Jaga momentum pembayaranmu.");
    } else if (worldState.debt >= 9e7) {
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
          financial.push("Dina menunggu kabar pembayaran\u2014segera kirim cicilan agar kepercayaannya terjaga.");
        } else if (hoursRemaining <= 24) {
          financial.push("Jatuh tempo cicilan Dina tinggal kurang dari sehari. Sisihkan dana sekarang.");
        } else {
          financial.push(`Sisa pinjaman Dina ${formatCurrency(dinaOutstanding)}. Atur cicilan sebelum tenggat berikutnya.`);
        }
      }
    } else if (worldState.flags.dinaArrived && dinaOutstanding === 0) {
      financial.push("Pinjaman Dina sudah lunas\u2014kamu bebas fokus ke strategi jangka panjang.");
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
      growth.push("Kecakapan bisnismu masih terbatas\u2014riset usaha rumahan bisa membuka peluang baru.");
    }
    if (!worldState.flags.homeBusinessPlan && ingenuityStat >= 45) {
      strategy.push("Coba riset usaha rumahan; tetangga siap membantu pre-order jika kamu menawarkan solusi hangat.");
    } else if (worldState.flags.homeBusinessPlan) {
      if (!worldState.flags.homeBusinessLaunched) {
        strategy.push("Rencana usaha sudah siap. Mulai buka pre-order agar pemasukan tambahan mengalir.");
      } else {
        const momentum = worldState.flags.homeBusinessMomentum || 0;
        if (momentum >= 3) {
          strategy.push("Pre-order tetangga mulai stabil\u2014atur jadwal agar bebanmu tidak menumpuk.");
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
        formatChange
      );
      if (shouldShowInsights) {
        showInsightsInFeedback = false;
      }
    }
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
        narrative: "Tanpa perawatan intensif, Ayah tiba-tiba tidak sadarkan diri. Kamu panik menelepon ambulans sambil merasa gagal menjaga rumah.",
        statusChanges: { stress: 12, trauma: 12 }
      };
    }
    if (worldState.trauma >= 95 || worldState.stress >= 100) {
      return {
        label: "Akhir: Tumbang oleh Tekanan",
        narrative: "Tubuhmu gemetar hebat dan pandangan menghitam. Beban psikologis malam ini membuatmu roboh sebelum bantuan tiba."
      };
    }
    if (worldState.debt <= 0) {
      return {
        label: "Akhir: Jalan Keluar Terbuka",
        narrative: "Transfer terakhir menghapus saldo utang. Untuk pertama kalinya dalam berbulan-bulan, rumah terasa sunyi tanpa ancaman.",
        baseEffects: { purity: 3, willpower: 3 }
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
        description: "Penagih akan kembali memastikan tagihanmu. Siapkan strategi bicara atau dana dadakan agar tekanan tidak meningkat."
      });
    }
    if (worldState.flags.nextCollectorVisit) {
      entries.push({
        title: "Ultimatum Kolektor",
        time: formatFutureSchedule(worldState.flags.nextCollectorVisit),
        description: "Mereka menagih minimal sepuluh juta. Pastikan ada rencana pembayaran atau dukungan tetangga yang siap membantumu."
      });
    }
    if (worldState.flags.awaitingDina) {
      entries.push({
        title: "Kedatangan Dina",
        time: "Sekitar pukul 06.00",
        description: "Dina membawa bantuan finansial dan dukungan emosional. Catat kebutuhan prioritas sebelum ia tiba."
      });
    }
    if (worldState.flags.dinaLoanOutstanding > 0 && worldState.flags.dinaLoanDue) {
      entries.push({
        title: "Jatuh Tempo Cicilan Dina",
        time: formatFutureSchedule(worldState.flags.dinaLoanDue),
        description: `Sisa pinjaman ${formatCurrency(worldState.flags.dinaLoanOutstanding)}. Kirim cicilan agar kepercayaan tetap terjaga.`
      });
    }
    const conditionNotes = getConditionNotesForJournal();
    if (conditionNotes.length) {
      const latest = conditionNotes[0];
      entries.push({
        title: "Catatan Kondisi",
        time: `Diperbarui ${latest.time}`,
        items: conditionNotes.map((note) => ({ text: note.text, time: note.time }))
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
    const label = `${calendar} \u2022 ${time}`;
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
    toggleStatsButton.textContent = statsPanelVisible ? "Sembunyikan Stat Karakter" : "Tampilkan Stat Karakter";
  }

  // scripts/main.js
  function startGame() {
    initializeGame();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startGame, { once: true });
  } else {
    startGame();
  }
  return __toCommonJS(main_exports);
})();
