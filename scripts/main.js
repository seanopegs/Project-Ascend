import { initializeGame } from "./game/engine.js";
import { setupStartScreen } from "./ui/startScreen.js";
import { setupSaveControls } from "./ui/saveControls.js";

export { initializeGame };

function startApp() {
  const controller = initializeGame({ autoStart: false });
  setupSaveControls(controller);
  setupStartScreen(controller);

  // Auto-resume check
  try {
    const snapshot = controller.getCachedSnapshot();
    if (snapshot && snapshot.savedAt && snapshot.version === 1) {
      // The user wants the game to always save and not reset on reload.
      // So we automatically load the snapshot if it exists.
      console.log("Auto-loading saved session...");
      controller.loadSnapshot(snapshot, { source: "continue" });

      // We also need to hide the start screen programmatically
      // since setupStartScreen defaults to showing it.
      const startScreen = document.getElementById("startScreen");
      const appShell = document.getElementById("appShell");
      if (startScreen && appShell) {
        startScreen.hidden = true;
        document.documentElement.removeAttribute("data-start-screen");
        appShell.removeAttribute("aria-hidden");
      }
    }
  } catch (e) {
    console.warn("Auto-resume check failed:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
