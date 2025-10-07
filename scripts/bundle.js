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
      initial: 45
    },
    purity: {
      displayName: "Purity",
      alias: "Integritas",
      description: "Menjaga kompas moral dan tujuan jangka panjang agar tetap lurus saat mengambil keputusan sulit.",
      max: 100,
      initial: 55
    },
    physique: {
      displayName: "Physique",
      alias: "Kebugaran",
      description: "Stamina fisik untuk merawat Ayah, bekerja lembur, dan bertahan dari malam yang panjang.",
      max: 100,
      initial: 48
    },
    willpower: {
      displayName: "Willpower",
      alias: "Tekad",
      description: "Kekuatan mental menghadapi tekanan psikologis, rasa takut, dan ancaman yang datang bertubi-tubi.",
      max: 100,
      initial: 52
    },
    beauty: {
      displayName: "Beauty",
      alias: "Performa",
      description: "Cara kamu membawa diri\u2014rapi, percaya diri, dan persuasif saat meminta dukungan orang lain.",
      max: 100,
      initial: 46
    },
    promiscuity: {
      displayName: "Promiscuity",
      alias: "Keluwesan Relasi",
      description: "Kemampuan menjalin jaringan dukungan lintas komunitas tanpa ragu menjelaskan kebutuhanmu.",
      max: 100,
      initial: 35
    },
    exhibitionism: {
      displayName: "Exhibitionism",
      alias: "Keberanian Tampil",
      description: "Kesiapanmu berbicara terbuka soal situasi keluarga kepada orang lain atau otoritas.",
      max: 100,
      initial: 32
    },
    deviancy: {
      displayName: "Deviancy",
      alias: "Inovasi",
      description: "Kesediaan mencoba strategi tak lazim demi menciptakan ruang aman dan solusi baru.",
      max: 100,
      initial: 28
    },
    masochism: {
      displayName: "Masochism",
      alias: "Daya Tahan Tekanan",
      description: "Kemampuan menerima lelah, takut, dan malu sementara demi visi yang lebih besar untuk keluarga.",
      max: 100,
      initial: 44
    },
    sadism: {
      displayName: "Sadism",
      alias: "Ketegasan Menghadapi",
      description: "Kemauan menekan balik dan menetapkan batas tegas terhadap pihak yang menindas.",
      max: 100,
      initial: 20
    }
  };
  var statsOrder = [
    "awareness",
    "purity",
    "physique",
    "willpower",
    "beauty",
    "promiscuity",
    "exhibitionism",
    "deviancy",
    "masochism",
    "sadism"
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
      baseEffects: { awareness: 2, exhibitionism: 1, sadism: 1 },
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
      baseEffects: { promiscuity: 3, willpower: 1, beauty: 1 },
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
      baseEffects: { promiscuity: 1, purity: 1, willpower: 1 },
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
      baseEffects: { purity: 2, masochism: 2, willpower: 1, beauty: 1 },
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
      baseEffects: { masochism: -1, willpower: 1 },
      statusChanges: { fatigue: -14, stress: -3 },
      narrative: () => "Kamu menyandarkan kepala di tepi ranjang tanpa benar-benar tidur. Setidaknya ototmu beristirahat sebentar."
    },
    masakSup: {
      label: "Masak sup jahe hangat",
      time: 1,
      traits: ["care", "physical"],
      baseEffects: { purity: 1, beauty: 1 },
      statusChanges: { fatigue: -5, stress: -2, fatherHealth: 3 },
      narrative: () => "Aroma jahe memenuhi dapur. Sup hangat siap kamu bawa untuk membantu Ayah menelan obat."
    },
    siapkanObat: {
      label: "Siapkan obat dan air hangat",
      time: 0.5,
      traits: ["care", "mental"],
      condition: (state) => !state.flags.preparedMedicine,
      baseEffects: { purity: 1, masochism: 1 },
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
      baseEffects: { awareness: 3, exhibitionism: -1, masochism: 1 },
      statusChanges: { stress: 3 },
      narrative: () => "Lewat tirai, kamu melihat dua orang lelaki bersandar di motor dengan map merah khas penagih."
    },
    kunciRumah: {
      label: "Periksa dan kunci seluruh pintu",
      time: 0.5,
      traits: ["physical", "security"],
      baseEffects: { awareness: 2, masochism: 1 },
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
      baseEffects: { exhibitionism: 2, sadism: 3, willpower: -1 },
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
    kirimRencana: {
      label: "Kirim rencana ke debt collector",
      time: 0.5,
      traits: ["planning", "social"],
      condition: (state) => state.flags.planPrepared && !state.flags.planSent,
      baseEffects: { sadism: 1, willpower: 1 },
      statusChanges: { stress: -2 },
      narrative: () => "Kamu mengirimkan rencana pembayaran lengkap dengan jadwal dan bukti pemasukan stabil.",
      after: (state) => {
        state.flags.planSent = true;
        state.flags.safeWithSupport = true;
        return "Balasan cepat datang: mereka akan cek ke kantor dan kembali pagi nanti.";
      }
    },
    kerjaLembur: {
      label: "Kerjakan lembur daring",
      time: 3,
      traits: ["work", "mental"],
      baseEffects: { physique: -2, willpower: 2 },
      statusChanges: { money: 18e4, fatigue: 10, stress: 5 },
      narrative: () => "Kamu menyelesaikan dua desain kilat untuk klien daring. Bayarannya lumayan, tapi mata terasa perih menahan kantuk."
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
      baseEffects: { awareness: 2, sadism: 1 },
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
      baseEffects: { promiscuity: 2, willpower: 1, purity: 1 },
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
      baseEffects: { promiscuity: 1, purity: 1 },
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
      baseEffects: { promiscuity: 2, exhibitionism: 1 },
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

  // scripts/ui/statsPanel.js
  var statElements = /* @__PURE__ */ new Map();
  var containerRef = null;
  function initializeStatsUI(container, stats2) {
    containerRef = container;
    containerRef.innerHTML = "";
    statElements.clear();
    statsOrder.forEach((key) => {
      const stat = stats2[key];
      if (!stat) return;
      const card = document.createElement("article");
      card.className = "stat-card";
      card.dataset.stat = key;
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
      containerRef.appendChild(card);
      statElements.set(key, { card, bar, progress, value, tier });
    });
  }
  function updateStatsUI(stats2) {
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
  function clamp(value, min, max) {
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
    containerRef2 = container;
    containerRef2.innerHTML = "";
    statusElements.clear();
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
      const description = document.createElement("p");
      description.className = "status-description";
      const initialValue = Number(worldState2[key] ?? meta.min ?? 0);
      description.textContent = meta.describeState?.(initialValue, worldState2) ?? "";
      card.appendChild(description);
      containerRef2.appendChild(card);
      statusElements.set(key, { card, value, meterFill, description });
    });
    updateStatusPanel(worldState2);
  }
  function updateStatusPanel(worldState2) {
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
        elements.meterFill.style.width = `${clamp(percent, 0, 100)}%`;
      }
      if (elements.description) {
        const description = meta.describeState?.(value, worldState2) ?? "";
        elements.description.textContent = description;
        elements.description.hidden = !description;
      }
    });
  }

  // scripts/ui/feedbackPanel.js
  function renderFeedback(container, aggregatedChanges, insights, getMetadata, defaultFormatter) {
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
  function initializeMiniMap(container) {
    containerRef3 = container;
    containerRef3.innerHTML = "";
    containerRef3.setAttribute("role", "img");
    containerRef3.setAttribute("aria-label", "Denah rumah");
    const grid = document.createElement("div");
    grid.className = "mini-map-grid";
    grid.style.setProperty("--rows", 3);
    grid.style.setProperty("--cols", 3);
    layout.forEach((room) => {
      const cell = document.createElement("div");
      cell.className = "mini-map-cell";
      cell.dataset.location = room.id;
      cell.style.setProperty("--row", room.row);
      cell.style.setProperty("--col", room.col);
      const name = document.createElement("span");
      name.className = "mini-map-label";
      name.textContent = room.label;
      cell.appendChild(name);
      grid.appendChild(cell);
      cellElements.set(room.id, cell);
    });
    containerRef3.appendChild(grid);
  }
  function updateMiniMap(activeLocation) {
    cellElements.forEach((cell, id) => {
      if (id === activeLocation) {
        cell.classList.add("active");
        cell.setAttribute("aria-current", "true");
      } else {
        cell.classList.remove("active");
        cell.removeAttribute("aria-current");
      }
    });
  }

  // scripts/ui/journal.js
  var panelRef = null;
  var buttonRef = null;
  var providerRef = () => [];
  var isOpen = false;
  function initializeJournal(button, panel, provider) {
    buttonRef = button;
    panelRef = panel;
    providerRef = provider;
    panelRef.setAttribute("role", "dialog");
    panelRef.setAttribute("aria-modal", "false");
    panelRef.hidden = true;
    isOpen = false;
    updateVisibility();
    buttonRef.addEventListener("click", () => {
      isOpen = !isOpen;
      updateVisibility();
      if (isOpen) {
        renderEntries();
      }
    });
  }
  function updateVisibility() {
    if (!panelRef || !buttonRef) return;
    panelRef.hidden = !isOpen;
    buttonRef.setAttribute("aria-expanded", String(isOpen));
    buttonRef.textContent = isOpen ? "Sembunyikan Jurnal" : "Lihat Jurnal";
  }
  function renderEntries() {
    if (!panelRef) return;
    const entries = providerRef() || [];
    panelRef.innerHTML = "";
    const heading = document.createElement("h2");
    heading.textContent = "Jurnal Visi Ke Depan";
    panelRef.appendChild(heading);
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "journal-empty";
      empty.textContent = "Tidak ada kejadian yang terjadwal dalam waktu dekat.";
      panelRef.appendChild(empty);
      return;
    }
    const list = document.createElement("ol");
    list.className = "journal-list";
    entries.forEach((entry) => {
      const item = document.createElement("li");
      const title = document.createElement("h3");
      title.textContent = entry.title;
      const time = document.createElement("p");
      time.className = "journal-time";
      time.textContent = entry.time;
      const description = document.createElement("p");
      description.textContent = entry.description;
      item.append(title, time, description);
      list.appendChild(item);
    });
    panelRef.appendChild(list);
  }
  function refreshJournal() {
    if (isOpen) {
      renderEntries();
    }
  }
  function closeJournal() {
    if (!isOpen) return;
    isOpen = false;
    updateVisibility();
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

  // scripts/game/engine.js
  var stats = createInitialStats();
  var allStatsMetadata = /* @__PURE__ */ new Map();
  var worldState = createInitialWorldState();
  var gameEnded = false;
  var currentEnding = null;
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
  function initializeGame() {
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
    resetGame();
  }
  function buildMetadata() {
    allStatsMetadata.clear();
    statsOrder.forEach((key) => {
      const stat = stats[key];
      allStatsMetadata.set(key, {
        alias: stat.alias,
        formatChange: (amount) => formatChange(Number(amount.toFixed(1))),
        positiveIsGood: true
      });
    });
    Object.entries(statusConfig).forEach(([key, meta]) => {
      allStatsMetadata.set(key, {
        alias: meta.alias,
        formatChange: meta.formatChange,
        positiveIsGood: meta.positiveIsGood ?? true
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
        collectorUltimatum: false
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
    resetStats();
    updateStatusSummary();
    updateStatusPanel(worldState);
    updateMiniMap(worldState.location);
    feedbackElement.innerHTML = "";
    statsElement.setAttribute("hidden", "");
    toggleStatsButton.setAttribute("aria-expanded", "false");
    toggleStatsButton.textContent = "Tampilkan Stat Karakter";
    closeJournal();
    const introText = "Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar. Para penagih masih berjaga di depan pagar.";
    renderScene([introText], []);
  }
  function updateStatusSummary() {
    const location = locations[worldState.location];
    const clock = formatTime(worldState.hour, worldState.minute);
    const calendar = formatCalendarDate(worldState);
    statusSummaryElement.textContent = `Hari ${worldState.day} (${calendar}) \u2022 ${clock} \u2022 ${location?.name ?? "Lokasi tidak dikenal"}`;
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
      }
    }
    if (traits.has("mental") || traits.has("planning") || traits.has("work")) {
      if (willpower >= 65) {
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 0.7 : value * 1.15);
        incrementEffect(baseEffects, "willpower", 0.5);
        notes.push("Tekad tinggi membantumu tetap fokus di tengah tekanan.");
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
    }
    if (traits.has("social")) {
      if (beauty >= 60) {
        adjustChange(statusChanges, "stress", (value) => value < 0 ? value * 1.2 : value * 0.9);
        notes.push("Pembawaan percaya diri membuat interaksi berjalan mulus.");
      } else if (beauty <= 35) {
        adjustChange(statusChanges, "stress", (value) => value > 0 ? value * 1.1 : value * 0.85);
        notes.push("Rasa canggung sedikit mengurangi hasil interaksimu.");
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
        aggregate.fatherHealth = (aggregate.fatherHealth || 0) + applyStatusDelta("fatherHealth", -1.5 * portion);
      }
      if (worldState.stress >= 80) {
        aggregate.trauma = (aggregate.trauma || 0) + applyStatusDelta("trauma", 0.6 * portion);
      }
    }
    updateStatusPanel(worldState);
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
      hints.push("Ketahanan mentalmu stabil\u2014manfaatkan untuk negosiasi yang menegangkan.");
    }
    if (worldState.money >= 5e6 && worldState.debt > 0) {
      hints.push("Dana yang ada cukup untuk menawar cicilan darurat agar penagih mereda.");
    }
    if (worldState.debt <= 4e7) {
      hints.push("Utang mulai terpangkas signifikan. Jaga momentum pembayaranmu.");
    } else if (worldState.debt >= 9e7) {
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
          hints.push("Dina menunggu kabar pembayaran\u2014segera kirim cicilan agar kepercayaannya terjaga.");
        } else if (hoursRemaining <= 24) {
          hints.push("Jatuh tempo cicilan Dina tinggal kurang dari sehari. Sisihkan dana sekarang.");
        } else {
          hints.push(`Sisa pinjaman Dina ${formatCurrency(dinaOutstanding)}. Atur cicilan sebelum tenggat berikutnya.`);
        }
      }
    } else if (worldState.flags.dinaArrived && dinaOutstanding === 0) {
      hints.push("Pinjaman Dina sudah lunas\u2014kamu bebas fokus ke strategi jangka panjang.");
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
      formatChange
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
    if (!entries.length) {
      entries.push({
        title: "Tenang sejenak",
        time: "Tidak ada tenggat dekat",
        description: "Manfaatkan waktu ini untuk memulihkan tenaga dan menyusun strategi jangka panjang."
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
