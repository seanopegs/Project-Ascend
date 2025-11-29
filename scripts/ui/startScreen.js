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

function isValidSnapshot(snapshot) {
  return !!(
    snapshot &&
    typeof snapshot === "object" &&
    snapshot.worldState &&
    typeof snapshot.worldState === "object"
  );
}

function updateContinueButton(button, snapshot) {
  if (!button) {
    return;
  }

  const hasSnapshot = isValidSnapshot(snapshot);
  button.hidden = !hasSnapshot;
  button.toggleAttribute("disabled", !hasSnapshot);
  button.setAttribute("aria-disabled", String(!hasSnapshot));
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
  const continueGameButton = document.getElementById("continueGame");
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
    if (continueGameButton && !continueGameButton.hidden) {
      focusElement(continueGameButton);
    } else if (newGameButton) {
      focusElement(newGameButton);
    }
  }

  function refreshAutosaveInfo() {
    const snapshot = controller.getCachedSnapshot?.();
    updateStatusDisplay(statusElement, snapshot);
    if (continueGameButton) {
      continueGameButton.hidden = !snapshot;
    }
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
    try {
      const snapshot = controller.getCachedSnapshot?.();
      if (snapshot) {
        controller.loadSnapshot?.(snapshot, { source: "continue" });
        hideStartScreen();
      } else {
        setMessage(messageElement, "Tidak ada data simpanan yang ditemukan.");
      }
    } catch (error) {
      console.error("Gagal melanjutkan permainan.", error);
      setMessage(messageElement, "Terjadi masalah saat melanjutkan permainan.");
    }
  }

  if (newGameButton) {
    newGameButton.addEventListener("click", startNewGame);
  }

  if (continueGameButton) {
    continueGameButton.addEventListener("click", continueGame);
  }

  window.addEventListener("projectAscend:autosave", () => {
    const snapshot = refreshAutosaveInfo();
    if (!startScreen.hidden && snapshot) {
      clearMessage(messageElement);
      focusElement(continueGameButton);
    }
  });

  const snapshot = refreshAutosaveInfo();
  showStartScreen();
}
