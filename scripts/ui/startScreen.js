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

export function setupStartScreen(controller) {
  if (!controller) {
    return;
  }

  const startScreen = document.getElementById("startScreen");
  const appShell = document.getElementById("appShell");
  const newGameButton = document.getElementById("startNewGame");
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
    if (newGameButton) {
      focusElement(newGameButton);
    }
  }

  function refreshAutosaveInfo() {
    const snapshot = controller.getCachedSnapshot?.();
    updateStatusDisplay(statusElement, snapshot);
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

  if (newGameButton) {
    newGameButton.addEventListener("click", startNewGame);
  }

  window.addEventListener("projectAscend:autosave", () => {
    const snapshot = refreshAutosaveInfo();
    if (!startScreen.hidden && snapshot) {
      clearMessage(messageElement);
    }
  });

  const snapshot = refreshAutosaveInfo();
  // IMPORTANT: The auto-load logic is now handled in main.js
  // But if main.js FAILS to load (e.g. invalid version), we fallback here.
  // However, we want to ensure we don't accidentally show the start screen if main.js is about to hide it.

  // Actually, main.js runs AFTER startScreen setup usually, or startScreen setup is called BY main.js.
  // In main.js: setupStartScreen is called BEFORE auto-resume check.
  // So showStartScreen() WILL be called.
  // Then auto-resume happens, and it hides it.
  // This might cause a flicker.
  // Ideally, main.js should decide whether to call setupStartScreen or just run the game.

  // But to be safe and respect "everything automatic", if there is a snapshot, we could try to load it here?
  // No, main.js logic is better for separation.

  // Let's just ensure showStartScreen is called, but we know main.js will hide it immediately if save exists.
  showStartScreen();
}
