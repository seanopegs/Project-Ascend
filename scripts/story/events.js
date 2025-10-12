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
