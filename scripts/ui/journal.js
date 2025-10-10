import { createModalHost } from "./modalSystem.js";

const STORAGE_KEY = "jalanKeluar:journalSnapshot";
const TITLE_ID = "journalDialogTitle";
const TIMESTAMP_ID = "journalDialogTimestamp";

let buttonRef = null;
let panelRef = null;
let modalController = null;
let providerRef = () => [];
let openLabel = "Lihat Jurnal";
let closeLabel = "Sembunyikan Jurnal";
let contentRef = null;
let timestampRef = null;
let closeButtonRef = null;
let fullViewLinkRef = null;
let journalVisible = false;
let lastSnapshot = null;

function getStorage(type) {
  try {
    if (typeof window !== "undefined" && window[type]) {
      return window[type];
    }
  } catch (error) {
    console.warn(`Penyimpanan ${type} tidak tersedia untuk jurnal.`, error);
  }
  return null;
}

function getSessionStorage() {
  return getStorage("sessionStorage");
}

function getLocalStorage() {
  return getStorage("localStorage");
}

function getAvailableStorages() {
  return [
    { storage: getSessionStorage(), type: "session" },
    { storage: getLocalStorage(), type: "local" },
  ].filter(({ storage }) => Boolean(storage));
}

function sanitizeEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const sanitized = {
        title: typeof entry.title === "string" ? entry.title : undefined,
        time: typeof entry.time === "string" ? entry.time : undefined,
        description: typeof entry.description === "string" ? entry.description : undefined,
      };
      if (Array.isArray(entry.items)) {
        sanitized.items = entry.items
          .map((item) => {
            if (!item || typeof item !== "object") {
              return null;
            }
            const note = {
              text: typeof item.text === "string" ? item.text : undefined,
            };
            if (typeof item.time === "string") {
              note.time = item.time;
            }
            return note;
          })
          .filter(Boolean);
        if (!sanitized.items.length) {
          delete sanitized.items;
        }
      }
      return sanitized;
    })
    .filter(Boolean);
}

function storeSnapshot(entries) {
  const sanitizedEntries = sanitizeEntries(entries);
  const payload = {
    entries: sanitizedEntries,
    generatedAt: new Date().toISOString(),
  };
  const storages = getAvailableStorages();
  if (!storages.length) {
    console.warn("Penyimpanan web tidak tersedia untuk jurnal. Versi layar penuh mungkin tidak sinkron.");
    return payload;
  }
  storages.forEach(({ storage, type }) => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn(`Gagal menyimpan data jurnal ke penyimpanan ${type}.`, error);
    }
  });
  return payload;
}

function getJournalTargetUrl() {
  return buttonRef?.getAttribute("data-journal-url") || "journal.html";
}

function formatTimestamp(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function updateTimestampDisplay(value) {
  if (!timestampRef) {
    return;
  }
  const formatted = formatTimestamp(value);
  if (formatted) {
    timestampRef.textContent = `Diperbarui terakhir: ${formatted}`;
  } else {
    timestampRef.textContent = "Diperbarui terakhir: belum tersedia";
  }
}

function updateButtonState() {
  if (!buttonRef) {
    return;
  }
  const expanded = journalVisible ? "true" : "false";
  buttonRef.setAttribute("aria-expanded", expanded);
  buttonRef.setAttribute("aria-pressed", expanded);
  buttonRef.textContent = journalVisible ? closeLabel : openLabel;
}

function handleToggleButtonClick(event) {
  event?.preventDefault?.();
  setJournalVisibility(!journalVisible);
}

function handleCloseClick(event) {
  event?.preventDefault?.();
  setJournalVisibility(false);
}

function handleFullViewClick() {
  storeSnapshot(providerRef());
}

function setJournalVisibility(visible) {
  journalVisible = Boolean(visible && modalController);
  updateButtonState();
  if (!modalController) {
    return;
  }

  if (journalVisible) {
    if (contentRef) {
      renderJournalEntries(contentRef, lastSnapshot?.entries ?? []);
    }
    updateTimestampDisplay(lastSnapshot?.generatedAt);
    modalController.open();
    window.requestAnimationFrame(() => {
      closeButtonRef?.focus?.();
    });
  } else {
    modalController.close({ restoreFocus: false });
    if (buttonRef) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && panelRef?.contains(active)) {
        buttonRef.focus({ preventScroll: true });
      }
    }
  }
}

function destroyModal() {
  closeButtonRef?.removeEventListener("click", handleCloseClick);
  closeButtonRef = null;
  fullViewLinkRef?.removeEventListener("click", handleFullViewClick);
  fullViewLinkRef = null;
  contentRef = null;
  timestampRef = null;
  modalController?.destroy?.();
  modalController = null;
  panelRef = null;
  journalVisible = false;
  updateButtonState();
}

function setupModal(panel) {
  if (!panel) {
    destroyModal();
    return;
  }

  if (modalController) {
    destroyModal();
  }

  panelRef = panel;
  panelRef.classList.add("journal-panel");

  modalController = createModalHost(panelRef, {
    labelledBy: TITLE_ID,
    size: "wide",
    tone: "midnight",
    trapFocus: false,
    closeOnBackdrop: false,
    lockScroll: false,
    draggable: true,
    dragHandle: ".journal-modal__header",
    onRequestClose: () => {
      setJournalVisibility(false);
      return true;
    },
  });

  const surface = modalController.surface;
  surface.classList.add("journal-modal");
  surface.innerHTML = `
    <header class="journal-modal__header">
      <div class="journal-modal__titles">
        <p class="journal-modal__subtitle">Catatan Strategi</p>
        <h2 class="journal-modal__title" id="${TITLE_ID}">Jurnal Malam Ini</h2>
        <p class="journal-modal__timestamp" id="${TIMESTAMP_ID}" aria-live="polite"></p>
      </div>
      <button type="button" class="journal-modal__close" aria-label="Tutup jurnal">
        <span aria-hidden="true">✕</span>
      </button>
    </header>
    <div class="journal-modal__body">
      <div class="journal-modal__content"></div>
      <footer class="journal-modal__footer">
        <a class="journal-modal__link" href="${getJournalTargetUrl()}" target="_blank" rel="noopener">
          Buka versi layar penuh
        </a>
      </footer>
    </div>
  `;

  contentRef = surface.querySelector(".journal-modal__content");
  timestampRef = surface.querySelector(`#${TIMESTAMP_ID}`);
  closeButtonRef = surface.querySelector(".journal-modal__close");
  fullViewLinkRef = surface.querySelector(".journal-modal__link");

  closeButtonRef?.addEventListener("click", handleCloseClick);
  fullViewLinkRef?.addEventListener("click", handleFullViewClick);

  modalController.refreshFocusTrap?.();
}

export function initializeJournal(button, panel, provider) {
  if (buttonRef) {
    buttonRef.removeEventListener("click", handleToggleButtonClick);
  }

  buttonRef = button || null;
  providerRef = typeof provider === "function" ? provider : () => [];
  openLabel = "Lihat Jurnal";
  closeLabel = "Sembunyikan Jurnal";

  if (buttonRef) {
    openLabel = buttonRef.textContent?.trim() || openLabel;
    const customClose = buttonRef.getAttribute("data-close-label");
    if (typeof customClose === "string" && customClose.trim()) {
      closeLabel = customClose.trim();
    }
    buttonRef.setAttribute("aria-haspopup", "dialog");
    if (panel?.id) {
      buttonRef.setAttribute("aria-controls", panel.id);
    }
    buttonRef.addEventListener("click", handleToggleButtonClick);
  }

  setupModal(panel || null);
  journalVisible = false;
  updateButtonState();
  refreshJournal();
}

export function refreshJournal() {
  lastSnapshot = storeSnapshot(providerRef());
  if (contentRef && lastSnapshot) {
    renderJournalEntries(contentRef, lastSnapshot.entries);
  }
  updateTimestampDisplay(lastSnapshot?.generatedAt);
}

export function closeJournal() {
  clearJournalSnapshot();
  setJournalVisibility(false);
}

export function loadJournalSnapshot() {
  const storages = getAvailableStorages();
  const sessionStorageRef = storages.find(({ type }) => type === "session")?.storage ?? null;

  for (const { storage, type } of storages) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        continue;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        continue;
      }
      const entries = sanitizeEntries(parsed.entries);
      const generatedAt = typeof parsed.generatedAt === "string" ? parsed.generatedAt : undefined;

      if (sessionStorageRef && storage !== sessionStorageRef) {
        try {
          sessionStorageRef.setItem(STORAGE_KEY, raw);
        } catch (syncError) {
          console.warn("Gagal menyelaraskan data jurnal ke penyimpanan sesi.", syncError);
        }
      }

      return { entries, generatedAt };
    } catch (error) {
      console.warn(`Gagal membaca data jurnal dari penyimpanan ${type}.`, error);
    }
  }

  return null;
}

export function clearJournalSnapshot() {
  const storages = getAvailableStorages();
  storages.forEach(({ storage, type }) => {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn(`Gagal menghapus data jurnal dari penyimpanan ${type}.`, error);
    }
  });
}

export function renderJournalEntries(container, entries) {
  if (!container) {
    return;
  }
  const listContainer = container;
  listContainer.innerHTML = "";

  const sanitizedEntries = sanitizeEntries(entries);
  if (!sanitizedEntries.length) {
    const empty = document.createElement("p");
    empty.className = "journal-empty";
    empty.textContent =
      "Jurnal masih kosong. Catatan akan muncul ketika ada agenda yang perlu diwaspadai.";
    listContainer.appendChild(empty);
    return;
  }

  const intro = document.createElement("p");
  intro.className = "journal-description";
  intro.textContent = "Catatan waktu dan ancaman penting yang perlu kamu ingat selama malam ini.";
  listContainer.appendChild(intro);

  const list = document.createElement("ol");
  list.className = "journal-list";

  sanitizedEntries.forEach((entry) => {
    const item = document.createElement("li");

    if (entry.title) {
      const title = document.createElement("h3");
      title.textContent = entry.title;
      item.appendChild(title);
    }

    if (entry.time) {
      const time = document.createElement("p");
      time.className = "journal-time";
      time.textContent = entry.time;
      item.appendChild(time);
    }

    if (entry.description) {
      const description = document.createElement("p");
      description.textContent = entry.description;
      item.appendChild(description);
    }

    if (Array.isArray(entry.items) && entry.items.length) {
      const notes = document.createElement("ul");
      notes.className = "journal-sublist";
      entry.items.forEach((note) => {
        if (!note) {
          return;
        }
        const row = document.createElement("li");
        if (note.text) {
          const noteText = document.createElement("span");
          noteText.className = "journal-subtext";
          noteText.textContent = note.text;
          row.appendChild(noteText);
        }
        if (note.time) {
          const noteTime = document.createElement("span");
          noteTime.className = "journal-subtime";
          noteTime.textContent = note.time;
          row.appendChild(noteTime);
        }
        if (row.childElementCount > 0) {
          notes.appendChild(row);
        }
      });
      if (notes.childElementCount > 0) {
        item.appendChild(notes);
      }
    }

    list.appendChild(item);
  });

  listContainer.appendChild(list);
}
