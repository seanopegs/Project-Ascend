import { formatCurrency } from "../util/format.js";

export const actionLibrary = {
  bacaTagihan: {
    label: "Teliti tumpukan tagihan",
    time: 0.75,
    traits: ["mental", "planning"],
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
    time: 0.5,
    traits: ["mental", "documentation"],
    condition: (state) => !state.flags.hasChronology,
    baseEffects: { awareness: 2, confidence: 1, assertiveness: 1 },
    statusChanges: { stress: -2 },
    narrative: () =>
      "Kamu menyiapkan ponsel untuk merekam dan menuliskan kronologi detail. Jika mereka memaksa masuk, kamu punya bukti.",
    after: (state) => {
      state.flags.hasChronology = true;
    },
  },
  hubungiDina: {
    label: "Hubungi Dina minta bantuan",
    time: 0.25,
    traits: ["social"],
    condition: (state) => !state.flags.awaitingDina && !state.flags.dinaArrived,
    baseEffects: { networking: 3, willpower: 1, beauty: 1 },
    statusChanges: { stress: -3 },
    narrative: () =>
      "Dina menjawab dengan suara kantuk. Ia siap meminjamkan lima juta dan berjanji mampir begitu fajar.",
    after: (state) => {
      state.flags.awaitingDina = true;
      return "Ada harapan baru: Dina akan datang membawa bantuan dan makanan hangat.";
    },
  },
  laporKeDina: {
    label: "Lapor perkembangan ke Dina",
    time: 0.5,
    traits: ["social", "mental", "recovery"],
    condition: (state) => state.flags.dinaArrived,
    baseEffects: { networking: 1, purity: 1, willpower: 1 },
    statusChanges: { stress: -4, trauma: -2 },
    narrative: () =>
      "Kamu menelepon Dina, menjelaskan kondisi Ayah dan strategi pembayaranmu. Suaranya tenang dan menegaskan kamu tidak sendirian.",
    after: (state) => {
      state.flags.safeWithSupport = true;
      state.flags.dinaSupportAvailable = true;
      if ((state.flags.dinaLoanOutstanding || 0) > 0) {
        state.flags.dinaLoanDue = { day: state.day + 5, hour: 20 };
      }
      return "Dina mencatat jadwal cicilanmu dan siap mengingatkan bila kamu lengah.";
    },
  },
  cicilKeDina: {
    label: "Transfer cicilan ke Dina (Rp500.000)",
    time: 0.25,
    traits: ["financial", "social"],
    condition: (state) =>
      state.flags.dinaArrived && (state.flags.dinaLoanOutstanding || 0) > 0 && state.money >= 500_000,
    baseEffects: { purity: 1, willpower: 1 },
    statusChanges: (state) => {
      const outstanding = state.flags.dinaLoanOutstanding || 0;
      const amount = Math.min(500_000, outstanding);
      return { money: -amount, stress: -3 };
    },
    narrative: () =>
      "Kamu mentransfer sejumlah uang ke rekening Dina dan menyisipkan pesan terima kasih serta update perkembangan.",
    after: (state) => {
      const outstanding = state.flags.dinaLoanOutstanding || 0;
      const amount = Math.min(500_000, outstanding);
      state.flags.dinaLoanOutstanding = Math.max(0, outstanding - amount);
      if (state.flags.dinaLoanOutstanding <= 0) {
        state.flags.dinaLoanOutstanding = 0;
        state.flags.dinaLoanDue = null;
        return "Pinjaman Dina lunas. Ia mengirim stiker pelukan dan meminta kamu fokus merawat Ayah.";
      }
      state.flags.dinaLoanDue = { day: state.day + 7, hour: 20 };
      return `Sisa pinjaman ke Dina tinggal ${formatCurrency(state.flags.dinaLoanOutstanding)}.`;
    },
  },
  latihanNapas: {
    label: "Latihan pernapasan 4-7-8",
    time: 0.25,
    traits: ["recovery", "mental"],
    condition: (state) => state.stress >= 25,
    baseEffects: { willpower: 1, purity: 1 },
    statusChanges: { stress: -6, trauma: -2, fatigue: -1 },
    narrative: () =>
      "Kamu memejamkan mata dan menjalankan pola napas 4-7-8. Dada terasa sedikit lebih ringan.",
  },
  bayarDebtSebagian: {
    label: "Transfer cicilan darurat (Rp2.000.000)",
    time: 0.25,
    traits: ["financial", "mental"],
    condition: (state) => state.money >= 2_000_000 && state.debt > 0,
    baseEffects: { purity: 1, willpower: 1 },
    statusChanges: { money: -2_000_000, debt: -2_000_000, stress: -4 },
    narrative: () =>
      "Kamu membuka aplikasi bank dan mentransfer dua juta sebagai penegasan niat baik kepada debt collector.",
  },
  periksaAyah: {
    label: "Periksa kondisi Ayah",
    time: 0.5,
    traits: ["care", "physical"],
    baseEffects: { purity: 2, resilience: 2, willpower: 1, beauty: 1, physique: 1 },
    statusChanges: { fatherHealth: 8, stress: -4, fatigue: 2 },
    narrative: () =>
      "Ayah demam. Kamu mengganti kompres dan mengusap dahinya hingga napasnya kembali teratur.",
    after: (state) => {
      state.hoursSinceFatherCare = 0;
    },
  },
  istirahatPendek: {
    label: "Rebah sejenak sambil berjaga",
    time: 0.75,
    traits: ["recovery"],
    condition: (state) => state.fatigue >= 25,
    baseEffects: { resilience: -1, willpower: 1 },
    statusChanges: { fatigue: -14, stress: -3 },
    narrative: () =>
      "Kamu menyandarkan kepala di tepi ranjang tanpa benar-benar tidur. Setidaknya ototmu beristirahat sebentar.",
  },
  masakSup: {
    label: "Masak sup jahe hangat",
    time: 1,
    traits: ["care", "physical"],
    baseEffects: { purity: 1, beauty: 1, physique: 1 },
    statusChanges: { fatigue: -5, stress: -2, fatherHealth: 3 },
    narrative: () =>
      "Aroma jahe memenuhi dapur. Sup hangat siap kamu bawa untuk membantu Ayah menelan obat.",
  },
  siapkanObat: {
    label: "Siapkan obat dan air hangat",
    time: 0.5,
    traits: ["care", "mental"],
    condition: (state) => !state.flags.preparedMedicine,
    baseEffects: { purity: 1, resilience: 1 },
    statusChanges: { fatherHealth: 4, fatigue: 1 },
    narrative: () =>
      "Kamu menyusun obat penurun demam dan segelas air hangat, memastikan dosisnya aman.",
    after: (state) => {
      state.flags.preparedMedicine = true;
    },
  },
  pantauPenagih: {
    label: "Pantau penagih dari balik tirai",
    time: 0.25,
    traits: ["vigilance", "mental"],
    baseEffects: { awareness: 3, confidence: -1, resilience: 1 },
    statusChanges: { stress: 3 },
    narrative: () =>
      "Lewat tirai, kamu melihat dua orang lelaki bersandar di motor dengan map merah khas penagih.",
  },
  kunciRumah: {
    label: "Periksa dan kunci seluruh pintu",
    time: 0.5,
    traits: ["physical", "security"],
    baseEffects: { awareness: 2, resilience: 1 },
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
    baseEffects: { confidence: 2, assertiveness: 3, willpower: -1 },
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
    time: 1.5,
    traits: ["planning", "mental"],
    condition: (state) => !state.flags.planPrepared,
    baseEffects: { awareness: 2, deviancy: 2, willpower: 1 },
    statusChanges: { stress: 2, fatigue: 3 },
    narrative: () =>
      "Kamu membuka spreadsheet dan menghitung ulang pemasukan. Menjual kamera dan menambah shift kerja jadi opsi utama.",
    after: (state) => {
      state.flags.planPrepared = true;
    },
  },
  risetUsahaRumahan: {
    label: "Riset peluang usaha tetangga",
    time: 1.25,
    traits: ["planning", "business", "mental"],
    condition: (state) => !state.flags.homeBusinessPlan,
    baseEffects: { ingenuity: 4, networking: 1, confidence: 1 },
    statusChanges: { stress: 2, fatigue: 3 },
    narrative: () =>
      "Kamu mendata menu siap saji favorit tetangga, menghitung modal bahan, dan menyiapkan daftar pemasok kecil.",
    after: (state) => {
      state.flags.homeBusinessPlan = true;
      state.flags.homeBusinessMomentum = 0;
      return "Catatan rapi ada di meja—tinggal berani membuka pre-order pertama.";
    },
  },
  kirimRencana: {
    label: "Kirim rencana ke debt collector",
    time: 0.5,
    traits: ["planning", "social"],
    condition: (state) => state.flags.planPrepared && !state.flags.planSent,
    baseEffects: { assertiveness: 1, willpower: 1 },
    statusChanges: { stress: -2 },
    narrative: () =>
      "Kamu mengirimkan rencana pembayaran lengkap dengan jadwal dan bukti pemasukan stabil.",
    after: (state) => {
      state.flags.planSent = true;
      state.flags.safeWithSupport = true;
      return "Balasan cepat datang: mereka akan cek ke kantor dan kembali pagi nanti.";
    },
  },
  kelolaPreOrder: {
    label: "Kelola pre-order camilan daring",
    time: 1.25,
    traits: ["business", "work"],
    condition: (state) => state.flags.homeBusinessPlan,
    baseEffects: { ingenuity: 2, resilience: 1, assertiveness: 1 },
    statusChanges: (state) => {
      const momentum = Math.min(state.flags.homeBusinessMomentum || 0, 4);
      const baseIncome = 360_000;
      const bonus = momentum * 40_000;
      return { money: baseIncome + bonus, fatigue: 5.5, stress: 2.5 };
    },
    narrative: () =>
      "Kamu menyiapkan paket camilan, memotret, lalu membalas pesan titipan pesanan dari grup tetangga.",
    after: (state) => {
      state.flags.homeBusinessLaunched = true;
      const momentum = state.flags.homeBusinessMomentum || 0;
      state.flags.homeBusinessMomentum = Math.min(momentum + 1, 6);
      return "Pesanan terkumpul dan uang muka masuk ke dompet digital. Besok pagi kamu tinggal mengantar.";
    },
  },
  kerjaLembur: {
    label: "Kerjakan lembur daring",
    time: 2.25,
    traits: ["work", "mental"],
    baseEffects: { physique: -1, willpower: 2, ingenuity: 1 },
    statusChanges: { money: 320_000, fatigue: 7, stress: 4 },
    narrative: () =>
      "Kamu menyelesaikan dua desain kilat untuk klien daring. Bayarannya lumayan, tapi mata terasa perih menahan kantuk.",
  },
  rekamKontenMalam: {
    label: "Rekam konten update malam ini",
    time: 0.5,
    traits: ["social", "mental"],
    condition: (state) => !state.flags.creatorChannel,
    baseEffects: { confidence: 2, networking: 2, ingenuity: 1 },
    statusChanges: { stress: -2, fatigue: 1 },
    narrative: () =>
      "Kamu merekam video pendek tentang kondisi Ayah dan rencana bertahan. Pesan empati berdatangan dari teman lama.",
    after: (state) => {
      state.flags.creatorChannel = true;
      state.flags.creatorMomentum = 1;
      return "Video itu dibagikan ulang. Beberapa orang bertanya bagaimana cara membantu secara langsung.";
    },
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
      const baseIncome = 180_000;
      const bonus = (cappedMomentum - 1) * 40_000;
      const stressRelief = cappedMomentum >= 3 ? -1.5 : -1;
      const traumaShift = cappedMomentum >= 4 ? -0.5 : 0;
      return { money: baseIncome + bonus, stress: stressRelief, fatigue: 4, trauma: traumaShift };
    },
    narrative: () =>
      "Lewat siaran singkat kamu berbagi kabar terbaru, menerima doa, dan mengingatkan penonton soal kondisi Ayah.",
    after: (state) => {
      const momentum = state.flags.creatorMomentum || 1;
      const increment = momentum >= 3 ? 0.5 : 1;
      state.flags.creatorMomentum = Math.min(momentum + increment, 6);
      return "Penonton mengirim tip kecil dan menawarkan membagikan kanalmu ke komunitas dukungan lain.";
    },
  },
  tulisJurnal: {
    label: "Tulis jurnal penguat diri",
    time: 0.5,
    traits: ["mental", "recovery"],
    baseEffects: { purity: 1, beauty: 1 },
    statusChanges: { trauma: -4, stress: -3 },
    narrative: () =>
      "Kamu menuangkan rasa takut dan harapan dalam jurnal. Kata-kata itu menegaskan kembali alasanmu bertahan.",
  },
};
