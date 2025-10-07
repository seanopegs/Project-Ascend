export const baseStats = {
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

export const statsOrder = [
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

export const tierLabels = ["", "Pemula", "Terkondisi", "Tangkas", "Berdaya", "Visioner"];

export function createInitialStats() {
  return Object.fromEntries(
    statsOrder.map((key) => [key, { ...baseStats[key], value: baseStats[key].initial }]),
  );
}

export function getTier(value, max) {
  const ratio = value / max;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.8) return 4;
  return 5;
}
