const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatSavedAt(value) {
  if (!value) {
    return null;
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return DATE_FORMAT.format(date);
  } catch (error) {
    console.warn("Gagal memformat waktu simpanan.", error);
    return null;
  }
}

function formatStatus(snapshot) {
  if (!snapshot) {
    return "Belum ada simpanan otomatis.";
  }
  const savedAt = formatSavedAt(snapshot.savedAt || snapshot.meta?.savedAt);
  const summary = snapshot.meta?.summary;
  if (savedAt && summary) {
    return `Simpan otomatis ${savedAt} • ${summary}`;
  }
  if (savedAt) {
    return `Simpan otomatis ${savedAt}.`;
  }
  if (summary) {
    return `Simpan otomatis: ${summary}.`;
  }
  return "Progres otomatis telah disimpan.";
}

function updateStatus(statusElement, snapshot) {
  if (!statusElement) {
    return;
  }
  statusElement.textContent = formatStatus(snapshot);
}

export function setupSaveControls(controller) {
  if (!controller) {
    return;
  }

  const statusElement = document.getElementById("saveStatus");

  if (statusElement) {
    updateStatus(statusElement, controller.getCachedSnapshot?.());
  }

  window.addEventListener("projectAscend:autosave", (event) => {
    updateStatus(statusElement, event.detail || controller.getCachedSnapshot?.());
  });
}
