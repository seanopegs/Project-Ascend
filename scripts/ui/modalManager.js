let openModalCount = 0;

export function registerModalOpen() {
  openModalCount += 1;
}

export function registerModalClose() {
  if (openModalCount === 0) {
    return;
  }

  openModalCount -= 1;
}

export function resetModalState() {
  openModalCount = 0;
}
