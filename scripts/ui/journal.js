let panelRef = null;
let buttonRef = null;
let contentRef = null;
let closeButtonRef = null;
let providerRef = () => [];
let isOpen = false;
let previousFocus = null;
let openLabel = "Lihat Jurnal";
const closeLabel = "Tutup Jurnal";

const TITLE_ID = "journalDialogTitle";
const BODY_ID = "journalDialogBody";

export function initializeJournal(button, panel, provider) {
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

  contentRef = panelRef.querySelector(".journal-modal__body");
  closeButtonRef = panelRef.querySelector(".journal-modal__close");

  closeButtonRef?.addEventListener("click", () => {
    closeJournal();
  });

  panelRef.addEventListener("click", (event) => {
    if (event.target === panelRef) {
      closeJournal();
    }
  });

  panelRef.addEventListener("keydown", handleKeydown);

  updateVisibility();

  buttonRef.addEventListener("click", () => {
    isOpen = !isOpen;
    updateVisibility();
    if (isOpen) {
      renderEntries();
    }
  });
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
  panelRef.setAttribute("aria-modal", String(isOpen));
  buttonRef.setAttribute("aria-expanded", String(isOpen));
  buttonRef.textContent = isOpen ? closeLabel : openLabel;

  if (isOpen) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => {
      if (closeButtonRef) {
        closeButtonRef.focus();
      } else {
        panelRef.focus();
      }
    });
  } else {
    document.body.classList.remove("modal-open");
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
    const title = document.createElement("h3");
    title.textContent = entry.title;
    const time = document.createElement("p");
    time.className = "journal-time";
    time.textContent = entry.time;
    const description = document.createElement("p");
    description.textContent = entry.description;
    item.append(title, time, description);
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
  isOpen = false;
  updateVisibility();
}
