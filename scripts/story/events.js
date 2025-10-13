export const scheduledEvents = [
  {
    id: "debtCollectorKnock",
    condition: (state) => state.day === 1 && state.hour >= 23 && !state.flags.debtCollectorKnock,
    narrative: () =>
      "Ketukan keras menghantam pintu depan. \"Bayar sekarang atau kami tunggu sampai pagi,\" suara berat terdengar.",
    baseEffects: { awareness: 2, assertiveness: 1 },
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
      "Dina muncul mengenakan hoodie dan membawa termos. \"Aku pinjami lima juta, tapi tolong kabari progresnya tiap beberapa hari, ya,\" ujarnya.",
    baseEffects: { networking: 2, willpower: 1, purity: 1 },
    statusChanges: { money: 5_000_000, stress: -6, fatigue: -3, fatherHealth: 4 },
    after: (state) => {
      state.flags.awaitingDina = false;
      state.flags.dinaArrived = true;
      state.flags.dinaSupportAvailable = true;
      state.flags.safeWithSupport = true;
      state.flags.dinaLoanOutstanding = (state.flags.dinaLoanOutstanding || 0) + 5_000_000;
      state.flags.dinaLoanDue = { day: state.day + 10, hour: 20 };
    },
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
    narrative: () =>
      "Notifikasi baru: Dina menanyakan kabar Ayah dan progress pengembalian pinjaman. Ia berharap ada cicilan kecil dalam beberapa hari.",
    statusChanges: { stress: 5 },
    after: (state) => {
      state.flags.dinaSupportAvailable = true;
      state.flags.safeWithSupport = true;
      if (state.flags.dinaLoanOutstanding > 0) {
        state.flags.dinaLoanDue = { day: state.day + 3, hour: 21 };
      } else {
        state.flags.dinaLoanDue = null;
      }
    },
  },
  {
    id: "sleepWarningStage1",
    condition: (state) => state.hoursSinceRest >= 18 && (state.flags.sleepDeprivationStage || 0) < 1,
    narrative: () =>
      "Kelopak matamu terasa berat dan konsentrasi buyar. Jika memaksa terjaga, kamu akan makin ceroboh.",
    statusChanges: { stress: 5, fatigue: 4 },
    after: (state) => {
      state.flags.sleepDeprivationStage = 1;
      return "Cari jeda istirahat sungguhan sebelum tubuhmu benar-benar menyerah.";
    },
  },
  {
    id: "sleepWarningStage2",
    condition: (state) => state.hoursSinceRest >= 30 && (state.flags.sleepDeprivationStage || 0) < 2,
    narrative: () =>
      "Pusing hebat membuatmu limbung. Tubuh protes karena sudah lebih dari sehari penuh tanpa tidur.",
    statusChanges: { stress: 7, fatigue: 7, trauma: 2 },
    after: (state) => {
      state.flags.sleepDeprivationStage = 2;
      return "Sinyal bahaya semakin jelas—tidur bergantian bukan lagi pilihan, tetapi kebutuhan.";
    },
  },
  {
    id: "sleepWarningStage3",
    condition: (state) => state.hoursSinceRest >= 42 && (state.flags.sleepDeprivationStage || 0) < 3,
    narrative: () =>
      "Kamu mulai mengalami halusinasi suara mesin yang tidak ada. Refleksmu menurun drastis.",
    statusChanges: { stress: 9, fatigue: 9, trauma: 4 },
    after: (state) => {
      state.flags.sleepDeprivationStage = 3;
      return "Jika tidak tidur sekarang, kamu bisa membuat keputusan fatal.";
    },
  },
  {
    id: "sleepWarningCollapse",
    condition: (state) => state.hoursSinceRest >= 54 && (state.flags.sleepDeprivationStage || 0) < 4,
    narrative: () =>
      "Tubuhmu mendadak jatuh ke lantai selama beberapa menit micro-sleep. Kamu terbangun dengan dada berdebar.",
    statusChanges: { stress: 12, fatigue: 12, trauma: 6, fatherHealth: -6 },
    after: (state) => {
      state.flags.sleepDeprivationStage = 4;
      state.hoursSinceRest = Math.max(0, state.hoursSinceRest - 1.5);
      return "Ayah sempat dibiarkan tanpa pengawasan. Jangan biarkan ini terulang.";
    },
  },
  {
    id: "careWarningStage1",
    condition: (state) => state.hoursSinceFatherCare >= 4 && (state.flags.careEscalationStage || 0) < 1,
    narrative: () =>
      "Ayah mulai menggigil lagi. Kompres terasa hangat dan harus diganti sebelum demamnya naik.",
    statusChanges: { fatherHealth: -4, stress: 4 },
    after: (state) => {
      state.flags.careEscalationStage = 1;
    },
  },
  {
    id: "careWarningStage2",
    condition: (state) => state.hoursSinceFatherCare >= 6 && (state.flags.careEscalationStage || 0) < 2,
    narrative: () =>
      "Napas Ayah terdengar berat. Jika terlambat lebih lama, kondisinya bisa anjlok dan butuh rumah sakit.",
    statusChanges: { fatherHealth: -8, stress: 6, trauma: 2 },
    after: (state) => {
      state.flags.careEscalationStage = 2;
      return "Kamu harus segera kembali ke kamar Ayah atau minta bala bantuan.";
    },
  },
  {
    id: "careWarningStage3",
    condition: (state) => state.hoursSinceFatherCare >= 8 && (state.flags.careEscalationStage || 0) < 3,
    narrative: () =>
      "Ayah mengigau memanggil namamu. Kulitnya semakin panas dan kamu mendengar batuk kering yang dalam.",
    statusChanges: { fatherHealth: -14, stress: 8, trauma: 4 },
    after: (state) => {
      state.flags.careEscalationStage = 3;
      return "Satu langkah lagi menuju krisis medis. Jangan tinggalkan Ayah terlalu lama.";
    },
  },
  {
    id: "collectorEscalationWarning",
    condition: (state) =>
      state.flags.debtCollectorKnock && state.day >= 2 && (state.flags.collectorEscalationStage || 0) < 1,
    narrative: () =>
      "Telepon dari nomor tak dikenal masuk berkali-kali. Penagih memperingatkan akan membawa rekan lebih banyak besok siang.",
    statusChanges: { stress: 7, trauma: 3 },
    after: (state) => {
      state.flags.collectorEscalationStage = 1;
      state.flags.nextCollectorVisit = { day: state.day + 1, hour: 11 };
      return "Kamu punya kurang dari sehari untuk menyiapkan pembayaran atau strategi perlindungan.";
    },
  },
  {
    id: "collectorEscalationRaid",
    condition: (state) =>
      (state.flags.collectorEscalationStage || 0) >= 1 && state.day >= 3 && !state.flags.houseSecured,
    narrative: () =>
      "Suara rantai pagar bergesek. Penagih mencoba memaksa masuk karena melihat rumah tidak terkunci rapat.",
    statusChanges: { stress: 10, trauma: 6 },
    after: (state) => {
      state.flags.collectorEscalationStage = 2;
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day, hour: Math.min(state.hour + 3, 22) };
      return "Segera kunci rumah atau cari saksi. Mereka bisa kembali kapan saja malam ini.";
    },
  },
];

export const randomEvents = [
  {
    id: "neighbourSoup",
    condition: (state) => state.location === "dapur" && !state.flags.safeWithSupport,
    chance: (state) => (state.hour >= 5 && state.hour <= 8 ? 0.35 : 0.15),
    narrative: () =>
      "Ketukan pelan di pintu belakang. Bu Siti dari rumah sebelah menyerahkan termos sup dan menawarkan diri jadi saksi jika dibutuhkan.",
    baseEffects: { networking: 1, purity: 1 },
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
    baseEffects: { networking: 2, confidence: 1 },
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
