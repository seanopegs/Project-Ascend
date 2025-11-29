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

  // Check for existing save
  try {
    const snapshot = controller.getCachedSnapshot();
    console.log("Checking for cached snapshot:", snapshot ? "Found" : "Not Found");
  } catch (e) {
    console.warn("Snapshot check failed:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
