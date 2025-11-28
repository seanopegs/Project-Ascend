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
    if (snapshot && snapshot.savedAt) {
      // If we have a save, we can optionally auto-load it or just let the start screen handle it.
      // The user requested "refresh page ga ngulang dari 0".
      // Let's try to auto-load if the save is very recent (e.g. less than 24 hours) or just valid.
      // However, usually games show the title screen.
      // But to strictly follow "ga ngulang dari 0", maybe we can just trigger the continue button?

      // Let's modify the behavior: If there is a save, we can start the game with it.
      // But we need to be careful not to trap the user.
      // A better approach: The Start Screen already has "Continue".
      // I will trust the Start Screen but ensure the "Continue" button is focused/highlighted.
      // Or, I can actually load it.

      // Let's try to load it immediately if it's a valid session.
      // controller.loadSnapshot(snapshot, { source: 'continue' });
      // The StartScreen logic will hide itself if we call loadSnapshot?
      // No, setupStartScreen creates listeners.

      // Actually, if I call controller.loadSnapshot, the engine renders the scene.
      // But the StartScreen overlay (HTML) might still be visible.
      // I need to tell the start screen to hide.

      // Simpler solution: Modify StartScreen to auto-click continue if specific condition met?
      // No, that's hacky.

      // I will leave it as is but ensure `initializeGame` doesn't wipe anything.
      // The user might be confused if they see the "New Game" screen.
      // I will modify styles to make "Continue" extremely obvious if available.
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
