import { createModalHost } from "./modalSystem.js";

let panelRef = null;
let buttonRef = null;
let contentRef = null;
let closeButtonRef = null;
let modalController = null;
let providerRef = () => [];
let openLabel = "Lihat Jurnal";
const closeLabel = "Tutup Jurnal";

const TITLE_ID = "journalDialogTitle";
const BODY_ID = "journalDialogBody";

function handleJournalButtonClick(event) {
  event?.preventDefault?.();
  modalController?.toggle();
}

function handleCloseButtonClick(event) {
  event?.preventDefault?.();
  modalController?.requestClose("action");
}

function handleModalOpen() {
  if (!buttonRef) {
    return;
  }
  buttonRef.setAttribute("aria-expanded", "true");
  buttonRef.setAttribute("aria-pressed", "true");
  buttonRef.textContent = closeLabel;
  renderEntries();
  modalController?.refreshFocusTrap();
}

function handleModalClose() {
  if (!buttonRef) {
    return;
  }
  buttonRef.setAttribute("aria-expanded", "false");
  buttonRef.setAttribute("aria-pressed", "false");
  buttonRef.textContent = openLabel;
}

export function initializeJournal(button, panel, provider) {
  if (!button || !panel) {
    return;
  }

  if (buttonRef) {
    buttonRef.removeEventListener("click", handleJournalButtonClick);
  }
  if (closeButtonRef) {
    closeButtonRef.removeEventListener("click", handleCloseButtonClick);
  }
  modalController?.destroy?.();
  modalController = null;

  buttonRef = button;
  panelRef = panel;
  providerRef = typeof provider === "function" ? provider : () => [];
  openLabel = buttonRef.textContent?.trim() || openLabel;

  buttonRef.setAttribute("aria-haspopup", "dialog");
  buttonRef.setAttribute("aria-controls", panelRef.id);

  panelRef.classList.add("journal-panel");

  modalController = createModalHost(panelRef, {
    labelledBy: TITLE_ID,
    describedBy: BODY_ID,
    size: "wide",
    tone: "ember",
    onOpen: handleModalOpen,
    onClose: handleModalClose,
  });

  const surface = modalController.surface;
  surface.classList.add("journal-modal");
  surface.innerHTML = `
    <header class="journal-modal__header">
      <div class="journal-modal__titles">
        <p class="journal-modal__subtitle">Catatan Strategi</p>
        <h2 class="journal-modal__title" id="${TITLE_ID}">Jurnal Visi Ke Depan</h2>
      </div>
      <button type="button" class="journal-modal__close" aria-label="Tutup jurnal">
        <span aria-hidden="true">✕</span>
      </button>
    </header>
    <div class="journal-modal__body" id="${BODY_ID}"></div>
  `;

  contentRef = surface.querySelector(".journal-modal__body");
  closeButtonRef = surface.querySelector(".journal-modal__close");
  closeButtonRef?.addEventListener("click", handleCloseButtonClick);
  buttonRef.addEventListener("click", handleJournalButtonClick);

  buttonRef.setAttribute("aria-expanded", "false");
  buttonRef.setAttribute("aria-pressed", "false");
}

function renderEntries() {
  if (!contentRef) return;
  const entries = providerRef() || [];
  contentRef.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "journal-empty";
    empty.textContent = "Jurnal masih kosong. Catatan akan muncul ketika ada agenda yang perlu diwaspadai.";
    contentRef.appendChild(empty);
    return;
  }

  const intro = document.createElement("p");
  intro.className = "journal-description";
  intro.textContent = "Catatan waktu dan ancaman penting yang perlu kamu ingat selama malam ini.";
  contentRef.appendChild(intro);

  const list = document.createElement("ol");
  list.className = "journal-list";
  entries.forEach((entry) => {
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
        const row = document.createElement("li");
        const noteText = document.createElement("span");
        noteText.className = "journal-subtext";
        noteText.textContent = note.text;
        row.appendChild(noteText);
        if (note.time) {
          const noteTime = document.createElement("span");
          noteTime.className = "journal-subtime";
          noteTime.textContent = note.time;
          row.appendChild(noteTime);
        }
        notes.appendChild(row);
      });
      item.appendChild(notes);
    }
    list.appendChild(item);
  });
  contentRef.appendChild(list);
}

export function refreshJournal() {
  if (modalController?.isOpen()) {
    renderEntries();
    modalController.refreshFocusTrap();
  }
}

export function closeJournal() {
  modalController?.close();
}
