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

function updateStatusDisplay(statusElement, meta) {
  if (!statusElement) return;

  if (!meta) {
    statusElement.textContent = "Belum ada progres tersimpan. Mulai permainan baru untuk memulai perjalananmu.";
    return;
  }

  const savedAt = formatSavedAt(meta.timestamp);
  statusElement.textContent = `${meta.summary || "Progres tersimpan"}\nTerakhir diperbarui ${savedAt}`;
}

export function setupStartScreen(controller) {
  if (!controller) return;

  const startScreen = document.getElementById("startScreen");
  const appShell = document.getElementById("appShell");
  const newGameButton = document.getElementById("startNewGame");
  const continueGameButton = document.getElementById("continueGame");
  const statusElement = document.getElementById("startScreenStatus");
  const messageElement = document.getElementById("startScreenMessage");

  if (!startScreen || !appShell) return;

  function hideStartScreen() {
    setHtmlOverlayState(false);
    startScreen.hidden = true;
    appShell.removeAttribute("aria-hidden");
    if (messageElement) messageElement.textContent = "";
  }

  function showStartScreen() {
    setHtmlOverlayState(true);
    startScreen.hidden = false;
    appShell.setAttribute("aria-hidden", "true");

    // Check save existence
    const meta = controller.getSaveMeta();
    const hasSave = !!meta;

    updateStatusDisplay(statusElement, meta);

    if (continueGameButton) {
      continueGameButton.hidden = !hasSave;
      continueGameButton.disabled = !hasSave;
      if (hasSave) {
          continueGameButton.focus();
      } else {
          newGameButton?.focus();
      }
    }
  }

  if (newGameButton) {
    newGameButton.addEventListener("click", () => {
      try {
        controller.startNewGame();
        hideStartScreen();
      } catch (error) {
        console.error("Gagal memulai permainan baru.", error);
        if (messageElement) messageElement.textContent = "Terjadi masalah saat memulai permainan baru.";
      }
    });
  }

  if (continueGameButton) {
    continueGameButton.addEventListener("click", () => {
      try {
        const success = controller.loadGame();
        if (success) {
          hideStartScreen();
        } else {
           if (messageElement) messageElement.textContent = "Gagal memuat simpanan. Data mungkin rusak.";
           // Refresh UI
           const meta = controller.getSaveMeta();
           if (!meta) {
               continueGameButton.hidden = true;
               continueGameButton.disabled = true;
               updateStatusDisplay(statusElement, null);
           }
        }
      } catch (error) {
        console.error("Gagal melanjutkan permainan.", error);
        if (messageElement) messageElement.textContent = "Terjadi masalah saat melanjutkan permainan.";
      }
    });
  }

  // Update save info when autosave happens (in case user clears data in another tab, though unlikely to affect this screen while open,
  // but if game is running and saves, and we somehow come back to start screen - rare)
  // More useful: if we support multiple slots later.
  window.addEventListener("projectAscend:autosave", (e) => {
     if (!startScreen.hidden) {
         const meta = controller.getSaveMeta(); // Or use e.detail to construct meta
         updateStatusDisplay(statusElement, meta);
         if (continueGameButton && meta) {
             continueGameButton.hidden = false;
             continueGameButton.disabled = false;
         }
     }
  });

  showStartScreen();
}
