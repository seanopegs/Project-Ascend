import { statsOrder, tierLabels, getTier } from "../config/stats.js";

const statElements = new Map();
let containerRef = null;

export function initializeStatsUI(container, stats) {
  if (!container) {
    containerRef = null;
    statElements.clear();
    return;
  }

  containerRef = container;
  containerRef.innerHTML = "";
  statElements.clear();

  statsOrder.forEach((key) => {
    const stat = stats[key];
    if (!stat) return;
    const card = document.createElement("article");
    card.className = "stat-card";
    card.dataset.stat = key;
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
    containerRef.appendChild(card);

    statElements.set(key, { card, bar, progress, value, tier });
  });
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
