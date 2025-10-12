export const baseStats = {
  awareness: {
    displayName: "Awareness",
    alias: "Kewaspadaan",
    description:
      "Mengukur seberapa tajam kamu membaca ancaman finansial dan peluang bantuan di sekitar.",
    max: 100,
    initial: 45,
    color: "#38bdf8",
    colorStrong: "#0ea5e9",
    colorSoft: "rgba(56, 189, 248, 0.22)",
  },
  purity: {
    displayName: "Purity",
    alias: "Integritas",
    description:
      "Menjaga kompas moral dan tujuan jangka panjang agar tetap lurus saat mengambil keputusan sulit.",
    max: 100,
    initial: 55,
    color: "#a855f7",
    colorStrong: "#7c3aed",
    colorSoft: "rgba(168, 85, 247, 0.22)",
  },
  physique: {
    displayName: "Physique",
    alias: "Kebugaran",
    description:
      "Stamina fisik untuk merawat Ayah, bekerja lembur, dan bertahan dari malam yang panjang.",
    max: 100,
    initial: 48,
    color: "#f97316",
    colorStrong: "#ea580c",
    colorSoft: "rgba(249, 115, 22, 0.22)",
  },
  willpower: {
    displayName: "Willpower",
    alias: "Tekad",
    description:
      "Kekuatan mental menghadapi tekanan psikologis, rasa takut, dan ancaman yang datang bertubi-tubi.",
    max: 100,
    initial: 52,
    color: "#facc15",
    colorStrong: "#eab308",
    colorSoft: "rgba(250, 204, 21, 0.22)",
  },
  beauty: {
    displayName: "Beauty",
    alias: "Performa",
    description:
      "Cara kamu membawa diri—rapi, percaya diri, dan persuasif saat meminta dukungan orang lain.",
    max: 100,
    initial: 46,
    color: "#f472b6",
    colorStrong: "#ec4899",
    colorSoft: "rgba(244, 114, 182, 0.22)",
  },
  networking: {
    displayName: "Networking",
    alias: "Jaringan Sosial",
    description:
      "Kemampuan menjalin dukungan lintas komunitas dan menjaga kepercayaan mereka.",
    max: 100,
    initial: 36,
    color: "#34d399",
    colorStrong: "#10b981",
    colorSoft: "rgba(52, 211, 153, 0.22)",
  },
  confidence: {
    displayName: "Confidence",
    alias: "Kepercayaan Diri",
    description:
      "Keberanian berbicara terbuka soal situasi keluarga dan menegosiasikan bantuan yang kamu butuhkan.",
    max: 100,
    initial: 42,
    color: "#60a5fa",
    colorStrong: "#3b82f6",
    colorSoft: "rgba(96, 165, 250, 0.22)",
  },
  deviancy: {
    displayName: "Deviancy",
    alias: "Inovasi",
    description:
      "Kesediaan mencoba strategi tak lazim demi menciptakan ruang aman dan solusi baru.",
    max: 100,
    initial: 28,
    color: "#fb7185",
    colorStrong: "#f43f5e",
    colorSoft: "rgba(251, 113, 133, 0.22)",
  },
  ingenuity: {
    displayName: "Ingenuity",
    alias: "Kecakapan Bisnis",
    description:
      "Kepekaan melihat peluang usaha, menaksir risiko, dan menumbuhkan sumber pendapatan baru.",
    max: 100,
    initial: 38,
    color: "#14b8a6",
    colorStrong: "#0f766e",
    colorSoft: "rgba(20, 184, 166, 0.22)",
  },
  resilience: {
    displayName: "Resilience",
    alias: "Resiliensi",
    description:
      "Kemampuan bertahan di bawah tekanan fisik dan mental tanpa kehilangan arah.",
    max: 100,
    initial: 44,
    color: "#f59e0b",
    colorStrong: "#d97706",
    colorSoft: "rgba(245, 158, 11, 0.22)",
  },
  assertiveness: {
    displayName: "Assertiveness",
    alias: "Ketegasan",
    description:
      "Ketahanan saat menetapkan batas, menagih komitmen, dan menghadapi intimidasi.",
    max: 100,
    initial: 30,
    color: "#a3e635",
    colorStrong: "#84cc16",
    colorSoft: "rgba(163, 230, 53, 0.22)",
  },
};

export const statsOrder = [
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
  "assertiveness",
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
