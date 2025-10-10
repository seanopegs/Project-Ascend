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

function renderSnapshot(container, timestampElement) {
  const snapshot = loadJournalSnapshot();
  const entries = snapshot?.entries ?? [];
  renderJournalEntries(container, entries);

  if (!timestampElement) {
    return;
  }
  const formatted = formatTimestamp(snapshot?.generatedAt);
  if (formatted) {
    timestampElement.textContent = `Diperbarui terakhir: ${formatted}`;
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
