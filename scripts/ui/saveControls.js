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

function getFileName(snapshot) {
  const source = snapshot?.meta?.type === "manual" ? "manual" : "autosave";
  const timestamp = snapshot?.savedAt || new Date().toISOString();
  const date = new Date(timestamp);
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = Number.isNaN(date.getTime())
    ? "unknown"
    : `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(
        date.getMinutes(),
      )}${pad(date.getSeconds())}`;
  return `project-ascend-${source}-${stamp}.json`;
}

function triggerDownload(snapshot) {
  try {
    const data = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getFileName(snapshot);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
    return anchor.download;
  } catch (error) {
    console.error("Gagal membuat berkas unduhan.", error);
    throw new Error("Gagal membuat berkas simpanan.");
  }
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

  const button = document.getElementById("manualSaveButton");
  const statusElement = document.getElementById("saveStatus");

  if (statusElement) {
    updateStatus(statusElement, controller.getCachedSnapshot?.());
  }

  if (button) {
    button.addEventListener("click", () => {
      try {
        const snapshot = controller.getSnapshot?.({
          type: "manual",
          source: "manual-save",
        });
        if (!snapshot) {
          throw new Error("Snapshot tidak tersedia.");
        }
        const fileName = triggerDownload(snapshot);
        if (statusElement) {
          statusElement.textContent = `Berkas simpanan diunduh: ${fileName}`;
        }
      } catch (error) {
        console.error("Gagal menyiapkan unduhan simpanan.", error);
        if (statusElement) {
          statusElement.textContent = error?.message || "Gagal mengunduh simpanan.";
        }
      }
    });
  }

  window.addEventListener("projectAscend:autosave", (event) => {
    updateStatus(statusElement, event.detail || controller.getCachedSnapshot?.());
  });
}
