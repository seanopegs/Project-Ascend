function getTotalCollectorPayments(state) {
  return state?.flags?.totalCollectorPayments || 0;
}

function hasPaidMinimum(state, amount) {
  return getTotalCollectorPayments(state) >= amount;
}

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
  {
    id: "collectorMorningPressure",
    condition: (state) =>
      state.flags.debtCollectorKnock && !state.flags.collectorMorningPressure && state.day >= 2 && state.hour >= 9,
    narrative: () =>
      "Bel pintu dibunyikan bertubi-tubi. Dua penagih memaksa video call, menuntut jadwal pembayaran konkret sebelum siang.",
    baseEffects: { assertiveness: -1, resilience: -1 },
    statusChanges: { stress: 9, trauma: 3, fatherHealth: -2 },
    after: (state) => {
      state.flags.collectorMorningPressure = true;
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day, hour: Math.min(state.hour + 9, 21) };
      return "Mereka meminta bukti transfer minimal tiga juta sebelum matahari terbenam.";
    },
  },
  {
    id: "collectorPenaltyDay2",
    condition: (state) =>
      state.day >= 2 && state.hour >= 12 && !state.flags.collectorPenaltyDay2 && !hasPaidMinimum(state, 2_000_000),
    narrative: () =>
      "Notifikasi rekening berbunyi. Koperasi menambahkan denda keterlambatan dan ancaman kunjungan lapangan tambahan.",
    statusChanges: { debt: 1_200_000, stress: 8, trauma: 2 },
    after: (state) => {
      state.flags.collectorPenaltyDay2 = true;
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day, hour: Math.min(state.hour + 6, 23) };
      return "Tanpa cicilan hari ini, dendanya akan berlipat ganda besok.";
    },
  },
  {
    id: "collectorLegalThreat",
    condition: (state) =>
      state.day >= 3 && state.hour >= 9 && !state.flags.collectorLegalThreat && !hasPaidMinimum(state, 5_000_000),
    narrative: () =>
      "Amplop merah diselipkan di bawah pintu. Isi surat mengabarkan rencana penarikan aset dan intimidasi hukum.",
    baseEffects: { willpower: -1, assertiveness: 1 },
    statusChanges: { stress: 10, trauma: 5 },
    after: (state) => {
      state.flags.collectorLegalThreat = true;
      state.flags.collectorUltimatum = true;
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day, hour: Math.min(state.hour + 5, 21) };
      return "Untuk meredakan surat ancaman itu, kolektor meminta bukti transfer minimal lima juta.";
    },
  },
  {
    id: "collectorAccountFreeze",
    condition: (state) =>
      state.day >= 3 && state.hour >= 18 && !state.flags.collectorAccountFreeze && !hasPaidMinimum(state, 7_000_000),
    narrative: () =>
      "SMS bank masuk: sebagian saldo rekeningmu dibekukan atas permintaan koperasi. Mereka menahan dana sampai ada cicilan baru.",
    statusChanges: (state) => {
      const withheld = Math.min(state.money, 1_000_000);
      return { money: -withheld, stress: 10, trauma: 6 };
    },
    after: (state) => {
      state.flags.collectorAccountFreeze = true;
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day + 1, hour: 9 };
      return "Akses rekening utama terhambat. Kamu harus mencari sumber uang lain secepatnya.";
    },
  },
  {
    id: "collectorAssetSeizure",
    condition: (state) =>
      state.day >= 4 && state.hour >= 9 && !state.flags.collectorAssetSeizure && !hasPaidMinimum(state, 10_000_000),
    narrative: () =>
      "Mobil bak terbuka berhenti di depan rumah. Mereka mengancam mengangkut barang elektronik jika tak ada transfer besar hari ini.",
    statusChanges: (state) => {
      const cashLoss = Math.min(state.money, 2_000_000);
      return { money: -cashLoss, debt: 3_500_000, stress: 14, trauma: 8, fatherHealth: -6 };
    },
    after: (state) => {
      state.flags.collectorAssetSeizure = true;
      state.flags.collectorEscalationStage = Math.max(state.flags.collectorEscalationStage || 0, 3);
      state.flags.safeWithSupport = false;
      state.flags.nextCollectorVisit = { day: state.day, hour: Math.min(state.hour + 3, 20) };
      return "Ini peringatan terakhir sebelum mereka membawa paksa barang dari rumah.";
    },
  },
  {
    id: "collectorDefaultJudgement",
    condition: (state) =>
      state.day >= 7 &&
      state.debt >= 30_000_000 &&
      !state.flags.collectorDefaultJudgement,
    narrative: () =>
      "Seorang petugas kelurahan mengantar surat penetapan wanprestasi. Pengadilan memberi tenggat 48 jam untuk menyetor minimal lima belas juta sebelum juru sita turun tangan.",
    baseEffects: { willpower: -2, awareness: 1 },
    statusChanges: { stress: 12, trauma: 6 },
    after: (state) => {
      state.flags.collectorDefaultJudgement = true;
      state.flags.safeWithSupport = false;
      state.flags.collectorUltimatum = true;
      state.flags.defaultJudgementDeadline = { day: state.day + 2, hour: 12 };
      state.flags.nextCollectorVisit = { day: state.day + 1, hour: 8 };
      return "Surat itu jelas: tanpa transfer besar dalam dua hari, penyitaan paksa akan dimulai.";
    },
  },
  {
    id: "collectorDefaultRaid",
    condition: (state) => {
      const deadline = state.flags.defaultJudgementDeadline;
      if (!deadline || state.debt <= 0 || state.flags.collectorDefaultRaid) return false;
      if (state.day > deadline.day) return true;
      if (state.day === deadline.day && state.hour >= deadline.hour) return true;
      return false;
    },
    narrative: () =>
      "Truk bak terbuka dan dua petugas berseragam tiba. Mereka menunjukkan salinan penetapan dan mulai mengangkut peralatan elektronik tanpa menunggu persetujuanmu.",
    statusChanges: (state) => {
      const confiscatedCash = Math.min(state.money, 3_000_000);
      return { money: -confiscatedCash, debt: 5_000_000, stress: 18, trauma: 9, fatherHealth: -10 };
    },
    after: (state) => {
      state.flags.collectorDefaultRaid = true;
      state.flags.defaultJudgementDeadline = null;
      state.flags.safeWithSupport = false;
      state.flags.forcedEviction = true;
      return "Rumah porak-poranda dan Ayah terguncang. Tanpa solusi cepat, tidak ada lagi yang bisa kamu pertahankan.";
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
  {
    id: "cousinVoiceNote",
    condition: (state) => state.location === "ruangKeluarga" && state.hour >= 7,
    chance: () => 0.2,
    narrative: () =>
      "Voice note dari sepupumu masuk. Ia menawarkan meminjamkan motor untuk mengantar pesanan atau kabur jika situasi memburu.",
    baseEffects: { networking: 1, confidence: 1 },
    statusChanges: { stress: -2, fatigue: -1 },
    after: (state) => {
      state.flags.safeWithSupport = true;
    },
  },
  {
    id: "volunteerMedic",
    condition: (state) => state.location === "kamarAyah" && state.flags.debtCollectorKnock,
    chance: () => 0.18,
    narrative: () =>
      "Relawan medis dari puskesmas menelepon menawarkan kunjungan pagi jika kamu bisa menutup biaya transport kecil.",
    baseEffects: { purity: 1, resilience: 1 },
    statusChanges: { fatherHealth: 5, money: -150_000, stress: -3 },
    after: (state) => {
      state.flags.safeWithSupport = true;
    },
  },
  {
    id: "legalClinic",
    condition: (state) => state.location === "ruangKerja" && state.flags.hasChronology,
    chance: () => 0.22,
    narrative: () =>
      "DM Instagram masuk dari klinik hukum kampus. Mereka bersedia memberi draft surat keberatan jika kamu mengirim kronologi. ",
    baseEffects: { assertiveness: 1, networking: 1 },
    statusChanges: { stress: -4, trauma: -2 },
    after: (state) => {
      state.flags.safeWithSupport = true;
    },
  },
];
