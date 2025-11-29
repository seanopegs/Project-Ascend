import { initializeGame } from "./game/engine.js";
import { setupStartScreen } from "./ui/startScreen.js";
import { setupSaveControls } from "./ui/saveControls.js";

export { initializeGame };

function startApp() {
  console.log("Starting App...");

  // Initialize game controller (UI setup)
  const controller = initializeGame();

  // Setup UI components
  setupSaveControls(controller);
  setupStartScreen(controller);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
