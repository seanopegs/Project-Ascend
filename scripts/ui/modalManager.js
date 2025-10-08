let openModalCount = 0;

function refreshDocumentModalState() {
  const html = document.documentElement;
  const body = document.body;
  if (!html || !body) {
    return;
  }

  const hasModal = openModalCount > 0;
  html.classList.toggle("modal-open", hasModal);
  body.classList.toggle("modal-open", hasModal);

  if (hasModal) {
    const scrollbarGap = Math.max(0, window.innerWidth - html.clientWidth);
    if (scrollbarGap) {
      body.style.setProperty("--modal-scrollbar-gap", `${scrollbarGap}px`);
    } else {
      body.style.removeProperty("--modal-scrollbar-gap");
    }
  } else {
    body.style.removeProperty("--modal-scrollbar-gap");
  }
}

function handleViewportResize() {
  if (openModalCount > 0) {
    refreshDocumentModalState();
  }
}

window.addEventListener("resize", handleViewportResize, { passive: true });

export function registerModalOpen() {
  openModalCount += 1;
  refreshDocumentModalState();
}

export function registerModalClose() {
  if (openModalCount === 0) {
    return;
  }

  openModalCount -= 1;
  refreshDocumentModalState();
}

export function resetModalState() {
  openModalCount = 0;
  refreshDocumentModalState();
}
