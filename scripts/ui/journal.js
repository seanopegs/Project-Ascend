let panelRef = null;
let buttonRef = null;
let providerRef = () => [];
let isOpen = false;

export function initializeJournal(button, panel, provider) {
  buttonRef = button;
  panelRef = panel;
  providerRef = provider;
  panelRef.setAttribute("role", "dialog");
  panelRef.setAttribute("aria-modal", "false");
  panelRef.hidden = true;
  isOpen = false;
  updateVisibility();

  buttonRef.addEventListener("click", () => {
    isOpen = !isOpen;
    updateVisibility();
    if (isOpen) {
      renderEntries();
    }
  });
}

function updateVisibility() {
  if (!panelRef || !buttonRef) return;
  panelRef.hidden = !isOpen;
  buttonRef.setAttribute("aria-expanded", String(isOpen));
  buttonRef.textContent = isOpen ? "Sembunyikan Jurnal" : "Lihat Jurnal";
}

function renderEntries() {
  if (!panelRef) return;
  const entries = providerRef() || [];
  panelRef.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "Jurnal Visi Ke Depan";
  panelRef.appendChild(heading);

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "journal-empty";
    empty.textContent = "Tidak ada kejadian yang terjadwal dalam waktu dekat.";
    panelRef.appendChild(empty);
    return;
  }

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
  panelRef.appendChild(list);
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
