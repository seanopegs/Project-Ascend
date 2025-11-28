// scripts/story/locations/city.js
export const cityLocations = {
  terasRumah: {
    name: "Teras Rumah",
    description: (state) => {
      const parts = [
        "Udara malam terasa dingin. Pagar rumahmu tampak rapuh di bawah sorotan lampu jalan.",
      ];
      if (state.flags.debtCollectorKnock) {
        parts.push("Bekas puntung rokok para penagih berserakan di dekat selokan.");
      }
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "kunciRumah" },
      { type: "action", id: "pantauPenagih" },
    ],
    connections: ["ruangKeluarga", "jalanRaya"],
  },
  jalanRaya: {
    name: "Jalan Raya",
    description: (state) =>
      "Jalanan aspal yang sepi, hanya ada beberapa kendaraan lewat. Lampu kota berkelap-kelip di kejauhan.",
    actions: [],
    connections: ["terasRumah", "tamanKota", "pusatKota", "tokoKelontong"],
  },
  tamanKota: {
    name: "Taman Kota",
    description: (state) =>
      "Taman yang cukup terawat. Beberapa bangku kosong di bawah pohon beringin tua. Tempat yang baik untuk menenangkan diri.",
    actions: [
      { type: "action", id: "dudukTaman" },
      { type: "action", id: "cariInspirasi" },
    ],
    connections: ["jalanRaya"],
  },
  pusatKota: {
    name: "Pusat Kota",
    description: (state) =>
      "Pusat keramaian kota. Banyak toko tutup karena sudah malam, tapi beberapa kedai kopi dan minimarket masih buka.",
    actions: [
      { type: "action", id: "kerjaSampingan" },
    ],
    connections: ["jalanRaya", "cafe24Jam"],
  },
  tokoKelontong: {
    name: "Toko Kelontong",
    description: (state) =>
      "Toko kecil yang buka 24 jam. Menjual kebutuhan sehari-hari dengan harga sedikit lebih mahal.",
    actions: [
      { type: "action", id: "beliBahanMakanan" },
      { type: "action", id: "beliObat" },
    ],
    connections: ["jalanRaya"],
  },
  cafe24Jam: {
    name: "Kafe 24 Jam",
    description: (state) =>
      "Kafe dengan Wi-Fi kencang. Banyak pekerja lepas dan mahasiswa menghabiskan malam di sini.",
    actions: [
      { type: "action", id: "pesanKopi" },
      { type: "action", id: "kerjaRemote" },
    ],
    connections: ["pusatKota"],
  }
};
