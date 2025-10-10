const STORAGE_KEY = "jalanKeluar:journalSnapshot";

let buttonRef = null;
let providerRef = () => [];
let openLabel = "Lihat Jurnal";

function getSessionStorage() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch (error) {
    console.warn("Penyimpanan sesi tidak tersedia untuk jurnal.", error);
  }
  return null;
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
  const storage = getSessionStorage();
  if (!storage) {
    return payload;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Gagal menyimpan data jurnal ke penyimpanan sementara.", error);
  }
  return payload;
}

function getJournalTargetUrl() {
  return buttonRef?.getAttribute("data-journal-url") || "journal.html";
}

function handleJournalButtonClick(event) {
  event?.preventDefault?.();
  storeSnapshot(providerRef());
  const targetUrl = getJournalTargetUrl();
  window.location.assign(targetUrl);
}

export function initializeJournal(button, panel, provider) {
  if (!button) {
    return;
  }

  if (buttonRef) {
    buttonRef.removeEventListener("click", handleJournalButtonClick);
  }

  buttonRef = button;
  providerRef = typeof provider === "function" ? provider : () => [];
  openLabel = buttonRef.textContent?.trim() || openLabel;

  buttonRef.setAttribute("aria-expanded", "false");
  buttonRef.setAttribute("aria-pressed", "false");
  buttonRef.removeAttribute("aria-haspopup");
  buttonRef.removeAttribute("aria-controls");
  buttonRef.textContent = openLabel;
  buttonRef.addEventListener("click", handleJournalButtonClick);

  if (panel) {
    panel.innerHTML = "";
    panel.hidden = true;
  }

  refreshJournal();
}

export function refreshJournal() {
  storeSnapshot(providerRef());
}

export function closeJournal() {
  clearJournalSnapshot();
  if (!buttonRef) {
    return;
  }
  buttonRef.setAttribute("aria-expanded", "false");
  buttonRef.setAttribute("aria-pressed", "false");
  buttonRef.textContent = openLabel;
}

export function loadJournalSnapshot() {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const entries = sanitizeEntries(parsed.entries);
    const generatedAt = typeof parsed.generatedAt === "string" ? parsed.generatedAt : undefined;
    return { entries, generatedAt };
  } catch (error) {
    console.warn("Gagal membaca data jurnal dari penyimpanan sementara.", error);
    return null;
  }
}

export function clearJournalSnapshot() {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Gagal menghapus data jurnal dari penyimpanan sementara.", error);
  }
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
