import { locations } from "../story/locations.js";

const layout = [
  { id: "halaman", label: "Halaman", row: 2, col: 1 },
  { id: "ruangKeluarga", label: "Ruang Keluarga", row: 2, col: 2 },
  { id: "kamarAyah", label: "Kamar Ayah", row: 1, col: 2 },
  { id: "dapur", label: "Dapur", row: 3, col: 3 },
  { id: "ruangKerja", label: "Ruang Kerja", row: 1, col: 3 },
];

let containerRef = null;
const cellElements = new Map();
const connectionElements = new Map();
const gridRows = Math.max(...layout.map((room) => room.row));
const gridCols = Math.max(...layout.map((room) => room.col));
const GRID_UNIT = 100;

function buildConnectionKey(a, b) {
  return [a, b].sort().join("::");
}

export function initializeMiniMap(container) {
  if (!container) {
    containerRef = null;
    cellElements.clear();
    connectionElements.clear();
    return;
  }

  containerRef = container;
  containerRef.innerHTML = "";
  containerRef.setAttribute("role", "img");
  containerRef.setAttribute("aria-label", "Denah rumah");

  const grid = document.createElement("div");
  grid.className = "mini-map-grid";
  grid.style.setProperty("--rows", String(gridRows));
  grid.style.setProperty("--cols", String(gridCols));

  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overlay.classList.add("mini-map-connections");
  overlay.setAttribute("viewBox", `0 0 ${gridCols * GRID_UNIT} ${gridRows * GRID_UNIT}`);
  overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");
  connectionElements.clear();

  layout.forEach((room) => {
    const cell = document.createElement("div");
    cell.className = "mini-map-cell";
    cell.dataset.location = room.id;
    cell.style.setProperty("--row", room.row);
    cell.style.setProperty("--col", room.col);

    const name = document.createElement("span");
    name.className = "mini-map-label";
    name.textContent = room.label;
    cell.appendChild(name);

    grid.appendChild(cell);
    cellElements.set(room.id, cell);
  });

  containerRef.appendChild(overlay);
  containerRef.appendChild(grid);

  const positions = new Map();
  layout.forEach((room) => {
    positions.set(room.id, {
      x: (room.col - 0.5) * GRID_UNIT,
      y: (room.row - 0.5) * GRID_UNIT,
    });
  });

  const seen = new Set();
  Object.entries(locations).forEach(([fromId, location]) => {
    if (!positions.has(fromId)) return;
    (location.connections || []).forEach((targetId) => {
      if (!positions.has(targetId)) return;
      const key = buildConnectionKey(fromId, targetId);
      if (seen.has(key)) return;
      seen.add(key);
      const start = positions.get(fromId);
      const end = positions.get(targetId);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(start.x));
      line.setAttribute("y1", String(start.y));
      line.setAttribute("x2", String(end.x));
      line.setAttribute("y2", String(end.y));
      line.dataset.from = fromId;
      line.dataset.to = targetId;
      overlay.appendChild(line);
      connectionElements.set(key, line);
    });
  });
}

export function updateMiniMap(activeLocation) {
  if (!cellElements.size) {
    return;
  }
  cellElements.forEach((cell, id) => {
    if (id === activeLocation) {
      cell.classList.add("active");
      cell.setAttribute("aria-current", "true");
    } else {
      cell.classList.remove("active");
      cell.removeAttribute("aria-current");
    }
  });

  connectionElements.forEach((line) => {
    if (!line) return;
    const { from, to } = line.dataset;
    if (from === activeLocation || to === activeLocation) {
      line.classList.add("active");
    } else {
      line.classList.remove("active");
    }
  });
}
