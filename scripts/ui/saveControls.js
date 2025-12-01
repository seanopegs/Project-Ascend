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

function updateStatus(statusElement, meta) {
  if (!statusElement) return;

  if (!meta) {
     // Optional: Hide or show "Not saved"
     statusElement.textContent = "";
     return;
  }

  const savedAt = formatSavedAt(meta.timestamp || meta.savedAt);
  const summary = meta.summary;

  if (savedAt && summary) {
    statusElement.textContent = `Simpan otomatis ${savedAt} • ${summary}`;
  } else if (savedAt) {
    statusElement.textContent = `Simpan otomatis ${savedAt}.`;
  } else {
    statusElement.textContent = "Progres otomatis telah disimpan.";
  }
}

export function setupSaveControls(controller) {
  if (!controller) return;

  const statusElement = document.getElementById("saveStatus");

  if (statusElement) {
    updateStatus(statusElement, controller.getSaveMeta());
  }

  window.addEventListener("projectAscend:autosave", (event) => {
    // event.detail contains the full snapshot
    const snapshot = event.detail;
    const meta = snapshot ? {
        timestamp: snapshot.savedAt,
        summary: snapshot.meta?.summary
    } : null;
    updateStatus(statusElement, meta);
  });
}
