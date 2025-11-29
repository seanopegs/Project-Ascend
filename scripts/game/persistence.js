const STORAGE_KEY = "project_ascend_v2_save";

export const persistence = {
  /**
   * Saves the game state to local storage.
   * @param {Object} state - The game state to save.
   * @returns {boolean} True if save was successful, false otherwise.
   */
  save(state) {
    if (!state) return false;
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      // Also save a timestamp for quick checking without parsing the whole object if needed
      localStorage.setItem(`${STORAGE_KEY}_meta`, JSON.stringify({
        timestamp: Date.now(),
        summary: state.meta?.summary || "Game Saved"
      }));
      return true;
    } catch (e) {
      console.error("Failed to save game:", e);
      return false;
    }
  },

  /**
   * Loads the game state from local storage.
   * @returns {Object|null} The game state or null if not found/error.
   */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load game:", e);
      return null;
    }
  },

  /**
   * Checks if a save file exists.
   * @returns {boolean}
   */
  hasSave() {
    return !!localStorage.getItem(STORAGE_KEY);
  },

  /**
   * Clears the save file.
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_meta`);
  },

  /**
   * Gets metadata about the save file without loading the full state.
   */
  getMeta() {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_meta`);
      if (raw) return JSON.parse(raw);

      // Fallback: peek at the main save
      const mainRaw = localStorage.getItem(STORAGE_KEY);
      if (mainRaw) {
         const data = JSON.parse(mainRaw);
         return {
             timestamp: new Date(data.savedAt || Date.now()).getTime(),
             summary: data.meta?.summary || "Game Saved"
         };
      }
    } catch (e) {
      return null;
    }
    return null;
  }
};
