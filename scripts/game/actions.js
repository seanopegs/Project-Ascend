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
    time: 0.25,
    traits: ["social"],
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
  laporKeDina: {
    label: "Lapor perkembangan ke Dina",
    time: 0.5,
    traits: ["social", "mental", "recovery"],
    condition: (state) => state.flags.dinaArrived,
    baseEffects: { promiscuity: 1, purity: 1, willpower: 1 },
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
    time: 0.75,
    traits: ["recovery"],
    condition: (state) => state.fatigue >= 25,
    baseEffects: { masochism: -1, willpower: 1 },
    statusChanges: { fatigue: -14, stress: -3 },
    narrative: () =>
      "Kamu menyandarkan kepala di tepi ranjang tanpa benar-benar tidur. Setidaknya ototmu beristirahat sebentar.",
  },
  masakSup: {
    label: "Masak sup jahe hangat",
    time: 1,
    traits: ["care", "physical"],
    baseEffects: { purity: 1, beauty: 1 },
    statusChanges: { fatigue: -5, stress: -2, fatherHealth: 3 },
    narrative: () =>
      "Aroma jahe memenuhi dapur. Sup hangat siap kamu bawa untuk membantu Ayah menelan obat.",
  },
  siapkanObat: {
    label: "Siapkan obat dan air hangat",
    time: 0.5,
    traits: ["care", "mental"],
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
    time: 0.25,
    traits: ["vigilance", "mental"],
    baseEffects: { awareness: 3, exhibitionism: -1, masochism: 1 },
    statusChanges: { stress: 3 },
    narrative: () =>
      "Lewat tirai, kamu melihat dua orang lelaki bersandar di motor dengan map merah khas penagih.",
  },
  kunciRumah: {
    label: "Periksa dan kunci seluruh pintu",
    time: 0.5,
    traits: ["physical", "security"],
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
  kirimRencana: {
    label: "Kirim rencana ke debt collector",
    time: 0.5,
    traits: ["planning", "social"],
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
    time: 3,
    traits: ["work", "mental"],
    baseEffects: { physique: -2, willpower: 2 },
    statusChanges: { money: 180_000, fatigue: 10, stress: 5 },
    narrative: () =>
      "Kamu menyelesaikan dua desain kilat untuk klien daring. Bayarannya lumayan, tapi mata terasa perih menahan kantuk.",
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
