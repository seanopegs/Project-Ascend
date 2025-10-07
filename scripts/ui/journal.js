import { createFloatingWindow } from "./floatingWindow.js";

let panelRef = null;
let buttonRef = null;
let contentRef = null;
let closeButtonRef = null;
let floatingController = null;
let modalRef = null;
let dragHandleRef = null;
let providerRef = () => [];
let isOpen = false;
let previousFocus = null;
let openLabel = "Lihat Jurnal";
const closeLabel = "Tutup Jurnal";

const TITLE_ID = "journalDialogTitle";
const BODY_ID = "journalDialogBody";

function handleJournalButtonClick(event) {
  event?.preventDefault?.();
  toggleJournal();
}

function handlePanelBackgroundClick(event) {
  if (event.target === panelRef) {
    closeJournal();
  }
}

function handleCloseButtonClick(event) {
  event?.preventDefault?.();
  closeJournal();
}

export function initializeJournal(button, panel, provider) {
  if (!button || !panel) {
    return;
  }

  if (buttonRef) {
    buttonRef.removeEventListener("click", handleJournalButtonClick);
  }
  if (panelRef) {
    panelRef.removeEventListener("click", handlePanelBackgroundClick);
    panelRef.removeEventListener("keydown", handleKeydown);
  }
  if (closeButtonRef) {
    closeButtonRef.removeEventListener("click", handleCloseButtonClick);
  }
  floatingController?.destroy?.();
  floatingController = null;

  buttonRef = button;
  panelRef = panel;
  providerRef = provider;
  openLabel = buttonRef.textContent?.trim() || openLabel;

  buttonRef.setAttribute("aria-haspopup", "dialog");
  buttonRef.setAttribute("aria-controls", panelRef.id);
  panelRef.classList.add("journal-panel");
  panelRef.setAttribute("role", "dialog");
  panelRef.setAttribute("aria-modal", "false");
  panelRef.setAttribute("aria-labelledby", TITLE_ID);
  panelRef.setAttribute("aria-describedby", BODY_ID);
  panelRef.tabIndex = -1;
  panelRef.hidden = true;
  isOpen = false;

  panelRef.innerHTML = `
    <div class="journal-modal" role="document">
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
    </div>
  `;

  modalRef = panelRef.querySelector(".journal-modal");
  dragHandleRef = panelRef.querySelector(".journal-modal__header");
  contentRef = panelRef.querySelector(".journal-modal__body");
  closeButtonRef = panelRef.querySelector(".journal-modal__close");

  floatingController = createFloatingWindow({
    container: panelRef,
    modal: modalRef,
    handle: dragHandleRef,
  });

  closeButtonRef?.addEventListener("click", handleCloseButtonClick);
  panelRef.addEventListener("click", handlePanelBackgroundClick);
  panelRef.addEventListener("keydown", handleKeydown);

  updateVisibility();

  buttonRef.addEventListener("click", handleJournalButtonClick);
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeJournal();
  }
}

function updateVisibility() {
  if (!panelRef || !buttonRef) return;

  panelRef.hidden = !isOpen;
  if (isOpen) {
    panelRef.removeAttribute("hidden");
  } else if (!panelRef.hasAttribute("hidden")) {
    panelRef.setAttribute("hidden", "");
  }

  panelRef.setAttribute("aria-modal", "false");
  panelRef.setAttribute("aria-hidden", isOpen ? "false" : "true");
  panelRef.dataset.open = isOpen ? "true" : "false";

  const expanded = isOpen ? "true" : "false";
  buttonRef.setAttribute("aria-expanded", expanded);
  buttonRef.setAttribute("aria-pressed", expanded);
  buttonRef.textContent = isOpen ? closeLabel : openLabel;

  if (isOpen) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (floatingController && !floatingController.hasCustomPosition()) {
      floatingController.center();
    }
    renderEntries();
    window.requestAnimationFrame(() => {
      if (closeButtonRef) {
        closeButtonRef.focus();
      } else {
        panelRef.focus();
      }
    });
  } else {
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
    previousFocus = null;
  }
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
  if (isOpen) {
    renderEntries();
  }
}

export function closeJournal() {
  if (!isOpen) return;
  toggleJournal(false);
}

function toggleJournal(forceState) {
  const nextState = typeof forceState === "boolean" ? forceState : !isOpen;
  if (nextState === isOpen) {
    if (isOpen) {
      renderEntries();
    }
    return;
  }

  isOpen = nextState;
  updateVisibility();
}
