const layout = [
  { id: "halaman", label: "Halaman", row: 2, col: 1 },
  { id: "ruangKeluarga", label: "Ruang Keluarga", row: 2, col: 2 },
  { id: "kamarAyah", label: "Kamar Ayah", row: 1, col: 2 },
  { id: "dapur", label: "Dapur", row: 3, col: 3 },
  { id: "ruangKerja", label: "Ruang Kerja", row: 1, col: 3 },
];

let containerRef = null;
const cellElements = new Map();

export function initializeMiniMap(container) {
  containerRef = container;
  containerRef.innerHTML = "";
  containerRef.setAttribute("role", "img");
  containerRef.setAttribute("aria-label", "Denah rumah");

  const grid = document.createElement("div");
  grid.className = "mini-map-grid";
  grid.style.setProperty("--rows", 3);
  grid.style.setProperty("--cols", 3);

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

  containerRef.appendChild(grid);
}

export function updateMiniMap(activeLocation) {
  cellElements.forEach((cell, id) => {
    if (id === activeLocation) {
      cell.classList.add("active");
      cell.setAttribute("aria-current", "true");
    } else {
      cell.classList.remove("active");
      cell.removeAttribute("aria-current");
    }
  });
}
