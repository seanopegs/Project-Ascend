export const locations = {
  ruangKeluarga: {
    name: "Ruang Keluarga",
    description: (state) => {
      const parts = [
        "Lampu temaram menyinari sofa dan meja kayu kecil.",
        state.flags.reviewedBills
          ? "Tumpukan amplop sudah tersusun menurut jatuh tempo, siap dipakai bernegosiasi."
          : "Tumpukan amplop tagihan menunggu di meja rendah, siap menenggelamkanmu dalam angka.",
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
      { type: "action", id: "rekamKontenMalam" },
      { type: "action", id: "siaranDukungan" },
      { type: "action", id: "latihanNapas" },
      { type: "action", id: "bayarDebtSebagian" },
      { type: "action", id: "gadaiPerhiasan" },
      { type: "action", id: "tulisJurnal" },
    ],
    connections: ["kamarAyah", "dapur", "halaman", "ruangKerja"],
  },
  kamarAyah: {
    name: "Kamar Ayah",
    description: (state) => {
      const parts = [
        "Ayah terbaring pucat ditemani aroma minyak kayu putih.",
        state.fatherHealth < 40
          ? "Kulitnya panas dan napasnya berat; kamu harus sering mengganti kompres."
          : "Setelah perawatanmu, nafasnya mulai lebih teratur meski demam belum turun sepenuhnya.",
      ];
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "periksaAyah" },
      { type: "action", id: "istirahatPendek" },
      { type: "action", id: "tidurBergantian" },
      { type: "action", id: "latihanNapas" },
    ],
    connections: ["ruangKeluarga"],
  },
  dapur: {
    name: "Dapur",
    description: (state) => {
      const parts = [
        "Kompor tua menyala redup, aroma jahe dan bawang memenuhi udara.",
        state.flags.preparedMedicine
          ? "Obat dan gelas air hangat tersusun rapi di nampan."
          : "Kamu bisa menyiapkan obat atau masakan hangat kapan saja.",
      ];
      return parts.join(" ");
    },
    actions: [
      { type: "action", id: "masakSup" },
      { type: "action", id: "siapkanObat" },
      { type: "action", id: "latihanNapas" },
    ],
    connections: ["ruangKeluarga"],
  },
  halaman: {
    name: "Halaman Depan",
    description: (state) => {
      const parts = [
        "Dua motor parkir di luar pagar. Suara mesin sesekali dinyalakan untuk menekanmu.",
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
      { type: "action", id: "hadapiPenagih" },
    ],
    connections: ["ruangKeluarga"],
  },
  ruangKerja: {
    name: "Ruang Kerja",
    description: (state) => {
      const parts = [
        "Laptop tua menyala dengan spreadsheet terbuka. Kertas catatan penuh coretan strategi.",
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
      { type: "action", id: "risetUsahaRumahan" },
      { type: "action", id: "kelolaPreOrder" },
      { type: "action", id: "kerjaLembur" },
      { type: "action", id: "tulisJurnal" },
    ],
    connections: ["ruangKeluarga"],
  },
};
