import { initializeGame } from "./game/engine.js";

export { initializeGame };

function startGame() {
  initializeGame();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startGame, { once: true });
} else {
  startGame();
}
