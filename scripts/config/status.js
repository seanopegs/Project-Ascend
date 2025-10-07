import { formatCurrency, formatCurrencyChange, formatSignedNumber, formatSignedPercent } from "../util/format.js";

export const statusConfig = {
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
      if (value >= 25) return "Napasnya berat—perlu tindakan segera dan kompres baru.";
      return "Ayah kritis, segera cari bantuan medis.";
    },
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
      if (value <= 75) return "Stres menumpuk—carilah ruang untuk menenangkan diri.";
      return "Stres memuncak dan bisa memicu keputusan impulsif.";
    },
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
      return "Tubuh hampir tumbang—prioritaskan istirahat segera.";
    },
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
    },
  },
  money: {
    alias: "Uang Tunai",
    positiveIsGood: true,
    formatValue: (value) => formatCurrency(value),
    formatChange: (amount) => formatCurrencyChange(amount),
    describeState: (value) => {
      if (value >= 10_000_000) return "Kas cukup untuk menutup beberapa cicilan ke depan.";
      if (value >= 5_000_000) return "Ada ruang gerak untuk negosiasi dalam waktu dekat.";
      if (value >= 1_000_000) return "Dana minim—alokasikan dengan hati-hati.";
      if (value > 0) return "Sisa uang hampir habis, setiap keputusan sangat berisiko.";
      return "Kas kosong; perlu pemasukan darurat atau bantuan.";
    },
  },
  debt: {
    alias: "Utang Aktif",
    positiveIsGood: false,
    formatValue: (value) => formatCurrency(value),
    formatChange: (amount) => formatCurrencyChange(amount),
    describeState: (value) => {
      if (value <= 20_000_000) return "Utang tinggal sedikit lagi untuk dilunasi.";
      if (value <= 50_000_000) return "Kemajuan terasa; teruskan strategi pembayaranmu.";
      if (value <= 80_000_000) return "Utang masih besar tapi mulai terkontrol.";
      return "Bunga membuat utang makin berat—butuh rencana agresif.";
    },
  },
  debtInterestRate: {
    alias: "Bunga Harian",
    positiveIsGood: false,
    formatValue: (value) => `${(value * 100).toFixed(2)}%`,
    formatChange: (amount) => formatSignedPercent(amount * 100, 2),
    describeState: (value) => {
      if (value <= 0.005) return "Bunga lunak—tahan sampai cicilan lunas.";
      if (value <= 0.01) return "Bunga masih bisa dinegosiasikan.";
      if (value <= 0.02) return "Bunga mencekik, pertimbangkan renegosiasi.";
      return "Bunga sangat tinggi dan menguras pembayaranmu.";
    },
  },
};

export const statusOrder = [
  "fatherHealth",
  "stress",
  "fatigue",
  "trauma",
  "money",
  "debt",
  "debtInterestRate",
];
