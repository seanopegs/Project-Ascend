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
const roomMetadata = new Map();
const gridRows = Math.max(...layout.map((room) => room.row));
const gridCols = Math.max(...layout.map((room) => room.col));
const GRID_UNIT = 100;
let travelHandler = null;
let activeLocationId = null;

function buildConnectionKey(a, b) {
  return [a, b].sort().join("::");
}

function handleCellClick(targetId) {
  if (!travelHandler) {
    return;
  }
  if (targetId === activeLocationId) {
    return;
  }
  travelHandler(targetId);
}

export function initializeMiniMap(container, options = {}) {
  if (!container) {
    containerRef = null;
    cellElements.clear();
    connectionElements.clear();
    roomMetadata.clear();
    travelHandler = null;
    activeLocationId = null;
    return;
  }

  containerRef = container;
  containerRef.innerHTML = "";
  cellElements.clear();
  containerRef.setAttribute("role", "group");
  containerRef.setAttribute("aria-label", "Denah rumah dan jalur perpindahan");

  travelHandler = typeof options.onRequestTravel === "function" ? options.onRequestTravel : null;
  activeLocationId = null;

  const grid = document.createElement("div");
  grid.className = "mini-map-grid";
  grid.style.setProperty("--rows", String(gridRows));
  grid.style.setProperty("--cols", String(gridCols));

  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overlay.classList.add("mini-map-connections");
  overlay.setAttribute("viewBox", `0 0 ${gridCols * GRID_UNIT} ${gridRows * GRID_UNIT}`);
  overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");
  connectionElements.clear();
  roomMetadata.clear();

  layout.forEach((room) => {
    const cell = document.createElement("button");
    cell.className = "mini-map-cell";
    cell.type = "button";
    cell.dataset.location = room.id;
    cell.style.setProperty("--row", room.row);
    cell.style.setProperty("--col", room.col);
    cell.setAttribute("aria-label", room.label);
    cell.title = room.label;
    cell.addEventListener("click", () => handleCellClick(room.id));

    const name = document.createElement("span");
    name.className = "mini-map-label";
    name.textContent = room.label;
    cell.appendChild(name);

    grid.appendChild(cell);
    cellElements.set(room.id, cell);
    roomMetadata.set(room.id, { label: room.label });
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
  activeLocationId = activeLocation;
  const current = locations[activeLocation];
  const reachable = new Set(current?.connections || []);
  cellElements.forEach((cell, id) => {
    const isActive = id === activeLocation;
    const isAdjacent = reachable.has(id);
    const canTravel = isAdjacent;
    const metadata = roomMetadata.get(id);
    const labelParts = [metadata?.label ?? id];

    cell.classList.toggle("active", isActive);
    cell.classList.toggle("adjacent", isAdjacent);

    if (isActive) {
      cell.setAttribute("aria-current", "true");
      labelParts.push("Lokasi saat ini.");
    } else {
      cell.removeAttribute("aria-current");
      if (canTravel) {
        labelParts.push("Klik untuk berpindah.");
      } else {
        labelParts.push("Belum bisa diakses langsung.");
      }
    }

    if (isActive || canTravel) {
      cell.disabled = false;
      cell.removeAttribute("aria-disabled");
    } else {
      cell.disabled = true;
      cell.setAttribute("aria-disabled", "true");
    }

    const label = labelParts.join(" ").trim();
    cell.setAttribute("aria-label", label);
    cell.title = label;
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
