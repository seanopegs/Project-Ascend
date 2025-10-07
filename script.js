const storyElement = document.getElementById("story");
const choicesElement = document.getElementById("choices");
const restartButton = document.getElementById("restart");

const storyNodes = {
  intro: {
    text: `Sudah lewat tengah malam. Rumah kecilmu sunyi, hanya terdengar napas berat Ayah dari kamar.
Tumpukan amplop tagihan menunggu di meja. Hari ini debt collector berkali-kali datang. Kamu tak bisa pergi jauh, mereka mengawasi.`,
    choices: [
      { text: "Periksa kondisi Ayah", next: "checkFather" },
      { text: "Buka tumpukan tagihan", next: "checkBills" },
      { text: "Lihat dari jendela", next: "lookOutside" },
    ],
  },
  checkFather: {
    text: `Ayah demam. Kamu mengganti kompres dan menaruh obat di dekatnya.
Saat itu ponselmu bergetar — pesan dari debt collector, menanyakan kapan kamu akan bayar.`,
    choices: [
      { text: "Balas dengan sopan", next: "replyCollector" },
      { text: "Abaikan dan fokus ke Ayah", next: "stayWithFather" },
    ],
  },
  checkBills: {
    text: `Ada daftar utang dari tiga koperasi. Totalnya 80 juta rupiah.
Besok adalah tenggat terakhir salah satu tagihan.`,
    choices: [
      { text: "Telepon sahabatmu Dina", next: "callFriend" },
      { text: "Susun rencana bayar cicilan", next: "planInstallment" },
      { text: "Tarik napas, kembali ke Ayah", next: "checkFather" },
    ],
  },
  lookOutside: {
    text: `Lewat tirai, kamu melihat dua orang lelaki bersandar di motor. Salah satunya memegang map merah — identitas debt collector langganan.
Mereka menunggu tanda kamu keluar.`,
    choices: [
      { text: "Kunci pintu dan jendela", next: "lockDoors" },
      { text: "Kirimi pesan suara bahwa Ayah sakit", next: "voiceMessage" },
    ],
  },
  replyCollector: {
    text: `Kamu mengetik: "Maaf, Ayah saya sakit. Saya akan kirim kabar besok." Balasan cepat datang: "Kami butuh kepastian sekarang."` ,
    choices: [
      { text: "Tawarkan pembayaran sebagian", next: "partialOffer" },
      { text: "Minta waktu tiga hari", next: "askThreeDays" },
    ],
  },
  stayWithFather: {
    text: `Kamu duduk menggenggam tangan Ayah. Rasanya ingin menangis, tapi kamu tahu harus tegar.
Di kejauhan terdengar ketukan pintu pelan.`,
    choices: [
      { text: "Buka pintu", next: "openDoor" },
      { text: "Diam dan berharap mereka pergi", next: "silentDoor" },
    ],
  },
  callFriend: {
    text: `Dina menjawab dengan suara kantuk. "Aku bisa pinjamkan lima juta, tapi aku baru gajian lusa," katanya.`,
    choices: [
      { text: "Setujui dan atur janji", next: "acceptHelp" },
      { text: "Tolak karena tak ingin merepotkan", next: "declineHelp" },
    ],
  },
  planInstallment: {
    text: `Kamu membuka spreadsheet di laptop tua. Jika menambah shift kerja online dan menjual kamera, kamu bisa kumpulkan 10 juta minggu ini.`,
    choices: [
      { text: "Kirim rencana ke debt collector", next: "sendPlan" },
      { text: "Simpan dulu, fokus rawat Ayah", next: "stayWithFather" },
    ],
  },
  lockDoors: {
    text: `Kamu memastikan semua pintu terkunci. Kamu dengar salah satu dari mereka berkata, "Dia masih di dalam."` ,
    choices: [
      { text: "Siapkan rekaman pembicaraan", next: "prepareRecording" },
      { text: "Cari bantuan RT lewat pesan", next: "callNeighbour" },
    ],
  },
  voiceMessage: {
    text: `Kamu mengirim pesan suara penuh harap. Balasan hanya emoji jam pasir. Mereka tetap menunggu.` ,
    choices: [
      { text: "Kembali ke dalam dan pikirkan rencana", next: "planInstallment" },
      { text: "Kirim lokasi ke Dina", next: "callFriend" },
    ],
  },
  partialOffer: {
    text: `Kamu tawarkan 5 juta besok pagi jika mereka memberi jaminan tertulis. Mereka menolak: "Minimal setengah malam ini."` ,
    choices: [
      { text: "Coba negosiasi ulang", next: "negotiation" },
      { text: "Hubungi ketua RT", next: "callNeighbour" },
    ],
  },
  askThreeDays: {
    text: `"Tiga hari saja," katamu. Mereka menjawab, "Besok kami bawa penagih lebih banyak."` ,
    choices: [
      { text: "Tetap tenang dan susun bukti", next: "prepareRecording" },
      { text: "Minta Dina datang", next: "acceptHelp" },
    ],
  },
  openDoor: {
    text: `Kamu membuka pintu. Debt collector berdiri dengan senyum tipis. "Kalau nggak bayar, kami tunggu di sini sampai pagi."` ,
    choices: [
      { text: "Rekam percakapan dan jelaskan kondisi", next: "prepareRecording" },
      { text: "Tutup pintu tanpa bicara", next: "silentDoor" },
    ],
  },
  silentDoor: {
    text: `Ketukan berhenti setelah beberapa menit. Tapi kamu tahu mereka belum pergi.` ,
    choices: [
      { text: "Cari cara melapor", next: "callNeighbour" },
      { text: "Susun barang berharga yang bisa digadai", next: "gatherItems" },
    ],
  },
  acceptHelp: {
    text: `Dina berjanji akan datang pagi-pagi membawa pinjaman, juga mengantar makanan untuk Ayah.` ,
    choices: [
      { text: "Gabungkan dengan rencana cicilan", next: "sendPlan" },
      { text: "Gunakan untuk nego ulang", next: "negotiation" },
    ],
  },
  declineHelp: {
    text: `Kamu menolak, tetapi begitu menutup telepon rasa menyesal menghantui. Kamu sendirian.` ,
    choices: [
      { text: "Telepon kembali Dina", next: "callFriend" },
      { text: "Fokus cari cara lain", next: "gatherItems" },
    ],
  },
  sendPlan: {
    text: `Kamu kirimkan rencana pembayaran lengkap dengan jadwal dan bukti pemasukan.
Tak lama kemudian, pesan datang: "Kami akan cek ke kantor. Pagi kami kembali."` ,
    choices: [
      { text: "Gunakan waktu untuk rawat Ayah", next: "goodEnding" },
      { text: "Tetap berjaga semalaman", next: "keepWatch" },
    ],
  },
  negotiation: {
    text: `Kamu mengajak mereka bicara melalui pintu tertutup, menekankan bahwa Ayah sakit dan kamu punya bukti cicilan stabil.
Setelah perdebatan panjang, mereka akhirnya berkata, "Besok pagi jangan lupa siapkan minimal 10 juta."` ,
    choices: [
      { text: "Terima syarat dan fokus menyiapkan dana", next: "keepWatch" },
      { text: "Laporkan perilaku mereka", next: "callNeighbour" },
    ],
  },
  prepareRecording: {
    text: `Kamu menyiapkan ponsel untuk merekam, juga menuliskan kronologi. Jika mereka memaksa masuk, kamu akan punya bukti hukum.` ,
    choices: [
      { text: "Hubungi LBH setempat", next: "legalAid" },
      { text: "Simpan bukti dan temani Ayah", next: "goodEnding" },
    ],
  },
  callNeighbour: {
    text: `Ketua RT menjawab, "Saya akan ke sana dengan Pak RW. Jangan buka pintu sebelum kami datang."` ,
    choices: [
      { text: "Tunggu kedatangan mereka", next: "communityHelp" },
      { text: "Sambil menunggu, susun bukti", next: "prepareRecording" },
    ],
  },
  gatherItems: {
    text: `Kamu mengumpulkan barang berharga: laptop, kamera, cincin ibu. Cukup untuk menutup sebagian utang.` ,
    choices: [
      { text: "Rencanakan penjualan keesokan pagi", next: "keepWatch" },
      { text: "Pikirkan cara lain", next: "planInstallment" },
    ],
  },
  legalAid: {
    text: `Petugas LBH mengatakan akan membantu jika ada bukti intimidasi. Mereka menyarankanmu merekam dan tidak memberikan barang berharga tanpa kwitansi.` ,
    choices: [
      { text: "Tenang dan fokus ke Ayah", next: "goodEnding" },
      { text: "Bagikan info ini ke Dina", next: "acceptHelp" },
    ],
  },
  communityHelp: {
    text: `Ketua RT dan Pak RW datang, berbicara langsung dengan debt collector. Mereka mengingatkan prosedur hukum.
Para penagih mundur, berjanji kembali besok siang dengan surat resmi.` ,
    choices: [
      { text: "Gunakan malam untuk merawat Ayah", next: "goodEnding" },
      { text: "Tetap siaga jika mereka kembali", next: "keepWatch" },
    ],
  },
  keepWatch: {
    text: `Malam terasa panjang, namun kamu punya rencana. Meski lelah, kamu tak lagi merasa sendirian. Besok kamu siap menghadapi mereka.` ,
    ending: true,
    label: "Akhir: Bertahan dengan Rencana",
  },
  goodEnding: {
    text: `Kamu duduk di samping Ayah, memegang tangannya. Di meja ada rencana pembayaran, dukungan Dina, dan kontak bantuan hukum.
Kamu sadar: jalan keluar mungkin belum jelas, tapi kamu sudah mengambil langkah pertama.` ,
    ending: true,
    label: "Akhir: Secercah Harapan",
  },
};

function renderNode(key) {
  const node = storyNodes[key];
  if (!node) return;

  storyElement.textContent = node.text;
  storyElement.focus();
  choicesElement.innerHTML = "";

  if (node.ending) {
    const endingLabel = document.createElement("p");
    endingLabel.className = "subtitle";
    endingLabel.textContent = node.label;
    choicesElement.appendChild(endingLabel);
    restartButton.hidden = false;
    restartButton.focus();
    return;
  }

  node.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "button";
    button.type = "button";
    button.textContent = choice.text;
    button.addEventListener("click", () => renderNode(choice.next));
    choicesElement.appendChild(button);
  });

  restartButton.hidden = true;
}

restartButton.addEventListener("click", () => {
  renderNode("intro");
});

renderNode("intro");
