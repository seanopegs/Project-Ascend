import { loadJournalSnapshot, renderJournalEntries } from "./ui/journal.js";
import { initializeThemeToggle } from "./ui/themeToggle.js";

function formatTimestamp(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function setupBackButton(button) {
  if (!button) {
    return;
  }
  button.addEventListener("click", (event) => {
    event?.preventDefault?.();
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("index.html");
  });
}

function getFallbackJournalEntries() {
  return [
    {
      title: "Ketukan Penagih",
      time: "Malam ini pukul 23.00",
      description:
        "Penagih akan kembali memastikan tagihanmu. Siapkan strategi bicara atau dana dadakan agar tekanan tidak meningkat.",
    },
  ];
}

function renderSnapshot(container, timestampElement) {
  const snapshot = loadJournalSnapshot();
  const storedEntries = snapshot?.entries ?? [];
  const usingFallback = !storedEntries.length;
  const entries = usingFallback ? getFallbackJournalEntries() : storedEntries;
  renderJournalEntries(container, entries);

  if (usingFallback && container) {
    const notice = document.createElement("p");
    notice.className = "journal-page__notice";
    notice.textContent =
      "Belum ada catatan dari sesi permainan. Menampilkan rencana awal untuk membantumu memulai.";
    container.prepend(notice);
  }

  if (!timestampElement) {
    return;
  }
  const formatted = formatTimestamp(snapshot?.generatedAt);
  if (formatted) {
    timestampElement.textContent = `Diperbarui terakhir: ${formatted}`;
  } else if (usingFallback) {
    timestampElement.textContent = "Diperbarui terakhir: menggunakan catatan pembuka";
  } else {
    timestampElement.textContent = "Diperbarui terakhir: tidak diketahui";
  }
}

function initializeJournalPage() {
  const themeToggle = document.getElementById("themeToggle");
  initializeThemeToggle(themeToggle);

  const backButton = document.getElementById("journalBack");
  const content = document.getElementById("journalContent");
  const timestamp = document.getElementById("journalTimestamp");

  setupBackButton(backButton);
  renderSnapshot(content, timestamp);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeJournalPage, { once: true });
} else {
  initializeJournalPage();
}
