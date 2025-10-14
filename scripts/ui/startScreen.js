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

function setHtmlOverlayState(visible) {
  if (visible) {
    document.documentElement.setAttribute("data-start-screen", "visible");
  } else {
    document.documentElement.removeAttribute("data-start-screen");
  }
}

function updateStatusDisplay(statusElement, snapshot) {
  if (!statusElement) {
    return;
  }
  if (!snapshot) {
    statusElement.textContent =
      "Belum ada progres tersimpan. Mulai permainan baru untuk memulai perjalananmu.";
    return;
  }
  const summary = snapshot.meta?.summary || "Progres tersimpan ditemukan.";
  const savedAt = formatSavedAt(snapshot.savedAt || snapshot.meta?.savedAt);
  if (savedAt) {
    statusElement.textContent = `${summary}\nTerakhir diperbarui ${savedAt}`;
  } else {
    statusElement.textContent = summary;
  }
}

function updateContinueState(button, snapshot) {
  if (!button) {
    return;
  }
  if (snapshot) {
    button.disabled = false;
    button.removeAttribute("aria-disabled");
  } else {
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
  }
}

function clearMessage(messageElement) {
  if (messageElement) {
    messageElement.textContent = "";
  }
}

function setMessage(messageElement, text) {
  if (messageElement) {
    messageElement.textContent = text;
  }
}

function focusElement(element) {
  if (!element || typeof element.focus !== "function") {
    return;
  }
  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
  }
}

function readSnapshotFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => {
      reject(new Error("Gagal membaca berkas simpanan."));
    });
    reader.addEventListener("load", () => {
      try {
        const data = JSON.parse(reader.result);
        resolve(data);
      } catch (error) {
        reject(new Error("Format berkas tidak valid atau rusak."));
      }
    });
    reader.readAsText(file);
  });
}

export function setupStartScreen(controller) {
  if (!controller) {
    return;
  }

  const startScreen = document.getElementById("startScreen");
  const appShell = document.getElementById("appShell");
  const newGameButton = document.getElementById("startNewGame");
  const continueButton = document.getElementById("startContinue");
  const loadButton = document.getElementById("startLoad");
  const fileInput = document.getElementById("startLoadInput");
  const statusElement = document.getElementById("startScreenStatus");
  const messageElement = document.getElementById("startScreenMessage");

  if (!startScreen || !appShell) {
    return;
  }

  function hideStartScreen() {
    setHtmlOverlayState(false);
    startScreen.hidden = true;
    appShell.removeAttribute("aria-hidden");
    clearMessage(messageElement);
  }

  function showStartScreen() {
    setHtmlOverlayState(true);
    startScreen.hidden = false;
    appShell.setAttribute("aria-hidden", "true");
    focusElement(newGameButton);
  }

  function refreshAutosaveInfo() {
    const snapshot = controller.getCachedSnapshot?.();
    updateStatusDisplay(statusElement, snapshot);
    updateContinueState(continueButton, snapshot);
    return snapshot;
  }

  async function startNewGame() {
    clearMessage(messageElement);
    try {
      controller.startNewGame?.();
      hideStartScreen();
    } catch (error) {
      console.error("Gagal memulai permainan baru.", error);
      setMessage(messageElement, "Terjadi masalah saat memulai permainan baru.");
    }
  }

  async function continueGame() {
    clearMessage(messageElement);
    const snapshot = controller.getCachedSnapshot?.();
    if (!snapshot) {
      setMessage(messageElement, "Tidak ditemukan simpanan otomatis untuk dilanjutkan.");
      refreshAutosaveInfo();
      return;
    }
    try {
      controller.loadSnapshot?.(snapshot, { source: "continue" });
      hideStartScreen();
    } catch (error) {
      console.error("Gagal memuat simpanan otomatis.", error);
      setMessage(messageElement, error?.message || "Simpan otomatis tidak dapat dimuat.");
      refreshAutosaveInfo();
    }
  }

  async function handleFileSelection(event) {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) {
      return;
    }
    clearMessage(messageElement);
    setMessage(messageElement, `Memuat ${file.name}…`);
    try {
      const data = await readSnapshotFile(file);
      controller.loadSnapshot?.(data, { source: "load-file" });
      hideStartScreen();
      setTimeout(() => {
        setMessage(messageElement, "");
      }, 0);
    } catch (error) {
      console.error("Gagal memuat berkas simpanan.", error);
      setMessage(messageElement, error?.message || "Berkas simpanan tidak valid.");
      refreshAutosaveInfo();
    }
  }

  function handleLoadClick() {
    clearMessage(messageElement);
    if (fileInput) {
      fileInput.click();
    }
  }

  if (newGameButton) {
    newGameButton.addEventListener("click", startNewGame);
  }
  if (continueButton) {
    continueButton.addEventListener("click", continueGame);
  }
  if (loadButton && fileInput) {
    loadButton.addEventListener("click", handleLoadClick);
    fileInput.addEventListener("change", handleFileSelection);
  }

  window.addEventListener("projectAscend:autosave", () => {
    const snapshot = refreshAutosaveInfo();
    if (!startScreen.hidden && snapshot) {
      clearMessage(messageElement);
    }
  });

  refreshAutosaveInfo();
  showStartScreen();
}
