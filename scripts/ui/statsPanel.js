import { statsOrder, tierLabels, getTier } from "../config/stats.js";
import { createFloatingWindow } from "./floatingWindow.js";
import { registerModalOpen, registerModalClose } from "./modalManager.js";

const TITLE_ID = "statsDialogTitle";
const statElements = new Map();
let containerRef = null;
let gridRef = null;
let closeButtonRef = null;
let floatingController = null;
let onRequestCloseRef = null;

function handleCloseClick(event) {
  event?.preventDefault?.();
  onRequestCloseRef?.();
}

export function initializeStatsUI(container, stats, options = {}) {
  if (!container) {
    containerRef = null;
    gridRef = null;
    closeButtonRef = null;
    floatingController?.destroy?.();
    floatingController = null;
    onRequestCloseRef = null;
    statElements.clear();
    return;
  }

  onRequestCloseRef = typeof options.onRequestClose === "function" ? options.onRequestClose : null;

  if (closeButtonRef) {
    closeButtonRef.removeEventListener("click", handleCloseClick);
  }
  floatingController?.destroy?.();
  floatingController = null;

  containerRef = container;
  containerRef.innerHTML = "";
  containerRef.classList.add("stats-panel");
  containerRef.setAttribute("role", "dialog");
  containerRef.setAttribute("aria-modal", "false");
  containerRef.setAttribute("aria-labelledby", TITLE_ID);
  containerRef.setAttribute("aria-hidden", "true");
  containerRef.tabIndex = -1;
  containerRef.hidden = true;
  containerRef.dataset.open = "false";

  containerRef.innerHTML = `
    <div class="stats-modal" role="document">
      <header class="stats-modal__header">
        <div class="stats-modal__titles">
          <p class="stats-modal__subtitle">Profil Kepribadian</p>
          <h2 class="stats-modal__title" id="${TITLE_ID}">Stat Karakter</h2>
        </div>
        <button type="button" class="stats-modal__close" aria-label="Tutup stat">
          <span aria-hidden="true">✕</span>
        </button>
      </header>
      <div class="stats-modal__body">
        <div class="stats-grid" role="list"></div>
      </div>
    </div>
  `;

  const modalRef = containerRef.querySelector(".stats-modal");
  const dragHandle = containerRef.querySelector(".stats-modal__header");
  gridRef = containerRef.querySelector(".stats-grid");
  closeButtonRef = containerRef.querySelector(".stats-modal__close");
  floatingController = createFloatingWindow({ container: containerRef, modal: modalRef, handle: dragHandle });

  closeButtonRef?.addEventListener("click", handleCloseClick);

  statElements.clear();
  gridRef.innerHTML = "";

  statsOrder.forEach((key) => {
    const stat = stats[key];
    if (!stat) return;
    const card = document.createElement("article");
    card.className = "stat-card";
    card.dataset.stat = key;
    card.setAttribute("role", "listitem");
    if (stat.color) {
      card.style.setProperty("--stat-color", stat.color);
    }
    if (stat.colorStrong) {
      card.style.setProperty("--stat-color-strong", stat.colorStrong);
    }
    if (stat.colorSoft) {
      card.style.setProperty("--stat-color-soft", stat.colorSoft);
    }
    card.tabIndex = 0;
    card.setAttribute(
      "aria-label",
      `${stat.displayName} (${stat.alias}). ${stat.description} Nilai awal ${stat.initial}.`,
    );

    const header = document.createElement("div");
    header.className = "stat-header";
    const name = document.createElement("span");
    name.className = "stat-name";
    name.textContent = stat.displayName;
    const alias = document.createElement("span");
    alias.className = "stat-alias";
    alias.textContent = stat.alias;
    header.append(name, alias);

    const progress = document.createElement("div");
    progress.className = "stat-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", String(stat.max));
    const bar = document.createElement("div");
    bar.className = "stat-bar";
    progress.appendChild(bar);

    const meta = document.createElement("div");
    meta.className = "stat-meta";
    const value = document.createElement("span");
    value.className = "stat-value";
    const tier = document.createElement("span");
    tier.className = "stat-tier";
    meta.append(value, tier);

    const description = document.createElement("p");
    description.className = "stat-description";
    description.textContent = stat.description;

    card.append(header, progress, meta, description);
    gridRef.appendChild(card);

    statElements.set(key, { card, bar, progress, value, tier });
  });

  floatingController?.center?.();
}

export function onStatsVisibilityChange(visible) {
  if (!containerRef) {
    return;
  }

  if (visible) {
    registerModalOpen();
    containerRef.hidden = false;
    containerRef.removeAttribute("hidden");
    containerRef.setAttribute("aria-hidden", "false");
    containerRef.dataset.open = "true";
    if (floatingController && !floatingController.hasCustomPosition()) {
      floatingController.center();
    }
    window.requestAnimationFrame(() => {
      closeButtonRef?.focus?.();
    });
  } else {
    registerModalClose();
    containerRef.hidden = true;
    if (!containerRef.hasAttribute("hidden")) {
      containerRef.setAttribute("hidden", "");
    }
    containerRef.setAttribute("aria-hidden", "true");
    containerRef.dataset.open = "false";
  }
}

export function updateStatsUI(stats) {
  if (!statElements.size) {
    return;
  }
  statsOrder.forEach((key) => {
    const stat = stats[key];
    const elements = statElements.get(key);
    if (!stat || !elements) return;
    const percent = Math.round((stat.value / stat.max) * 100);
    elements.bar.style.width = `${percent}%`;
    elements.progress.setAttribute("aria-valuenow", String(stat.value));
    elements.progress.setAttribute("aria-valuetext", `${stat.value} dari ${stat.max}`);
    elements.value.textContent = Math.round(stat.value);
    const tierLevel = getTier(stat.value, stat.max);
    elements.tier.textContent = `Level ${tierLevel} • ${tierLabels[tierLevel]}`;
    elements.card.dataset.tier = String(tierLevel);
  });
}
