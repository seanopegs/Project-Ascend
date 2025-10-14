import { initializeGame } from "./game/engine.js";
import { setupStartScreen } from "./ui/startScreen.js";
import { setupSaveControls } from "./ui/saveControls.js";

export { initializeGame };

function startApp() {
  const controller = initializeGame({ autoStart: false });
  setupSaveControls(controller);
  setupStartScreen(controller);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
