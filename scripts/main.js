import { initializeGame } from "./game/engine.js";
import { setupStartScreen } from "./ui/startScreen.js";
import { setupSaveControls } from "./ui/saveControls.js";

export { initializeGame };

function startApp() {
  console.log("Starting App...");

  // We initialize the game but DO NOT auto-start yet.
  const controller = initializeGame({ autoStart: false });

  // Setup UI components
  setupSaveControls(controller);
  setupStartScreen(controller);

  // Auto-resume check
  try {
    const snapshot = controller.getCachedSnapshot();
    console.log("Checking for cached snapshot:", snapshot ? "Found" : "Not Found");

    // Check if we have a valid snapshot to resume
    if (snapshot && snapshot.savedAt && snapshot.version === 1) {
      console.log("Auto-loading saved session...");

      // Load the snapshot
      controller.loadSnapshot(snapshot, { source: "continue" });

      // Force hide the start screen immediately
      const startScreen = document.getElementById("startScreen");
      const appShell = document.getElementById("appShell");
      if (startScreen && appShell) {
        startScreen.hidden = true;
        document.documentElement.removeAttribute("data-start-screen");
        appShell.removeAttribute("aria-hidden");
        console.log("Start screen hidden, game resumed.");
      }
    } else {
      console.log("No valid snapshot found. Waiting for user input on Start Screen.");
      // If no save exists, we just let the Start Screen stay visible.
      // It has the "New Game" button.
    }
  } catch (e) {
    console.warn("Auto-resume check failed:", e);
    // In case of error, ensuring start screen is visible might be good,
    // but setupStartScreen defaults it to visible anyway.
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
