import { statusConfig, statusOrder } from "../config/status.js";
import { clamp } from "../util/math.js";

const statusElements = new Map();
let containerRef = null;

export function initializeStatusPanel(container, worldState) {
  if (!container) {
    containerRef = null;
    statusElements.clear();
    return;
  }

  containerRef = container;
  containerRef.innerHTML = "";
  statusElements.clear();

  statusOrder.forEach((key) => {
    const meta = statusConfig[key];
    if (!meta) return;
    const card = document.createElement("article");
    card.className = "status-card";
    card.dataset.metric = key;
    card.tabIndex = 0;
    if (meta.meter) {
      card.classList.add("status-card--meter");
    }

    const label = document.createElement("span");
    label.className = "status-label";
    label.textContent = meta.alias;

    const value = document.createElement("span");
    value.className = "status-value";

    card.append(label, value);

    let meterFill = null;
    if (meta.meter) {
      const meter = document.createElement("div");
      meter.className = "status-meter";
      meterFill = document.createElement("div");
      meterFill.className = "status-meter-fill";
      meter.appendChild(meterFill);
      card.appendChild(meter);
    }

    const description = document.createElement("p");
    description.className = "status-description sr-only";
    const descriptionId = `status-${key}-description`;
    description.id = descriptionId;
    const initialValue = Number(worldState[key] ?? meta.min ?? 0);
    description.textContent = meta.describeState?.(initialValue, worldState) ?? "";
    card.dataset.tooltip = description.textContent ?? "";
    if (description.textContent) {
      card.setAttribute("aria-describedby", descriptionId);
    }
    card.appendChild(description);

    containerRef.appendChild(card);
    statusElements.set(key, { card, value, meterFill, description });
  });

  updateStatusPanel(worldState);
}

export function updateStatusPanel(worldState) {
  if (!statusElements.size) {
    return;
  }
  statusOrder.forEach((key) => {
    const meta = statusConfig[key];
    const elements = statusElements.get(key);
    if (!meta || !elements) return;
    const value = Number(worldState[key] ?? 0);
    elements.value.textContent = meta.formatValue ? meta.formatValue(value) : String(value);
    if (meta.meter && elements.meterFill) {
      const min = typeof meta.min === "number" ? meta.min : 0;
      const max = typeof meta.max === "number" ? meta.max : 100;
      const percent = ((value - min) / (max - min)) * 100;
      elements.meterFill.style.width = `${clamp(percent, 0, 100)}%`;
    }
    if (elements.description) {
      const description = meta.describeState?.(value, worldState) ?? "";
      elements.description.textContent = description;
      if (description) {
        elements.card.dataset.tooltip = description;
        elements.card.setAttribute("aria-describedby", elements.description.id);
      } else {
        elements.card.dataset.tooltip = "";
        elements.card.removeAttribute("aria-describedby");
      }
    }
  });
}
