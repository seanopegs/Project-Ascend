const SCROLL_LOCK_CLASS = "modal-open";

let openModalCount = 0;
let lastScrollY = 0;

function applyScrollLock() {
  lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.classList.add(SCROLL_LOCK_CLASS);
  document.body.dataset.scrollLocked = "true";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = `-${lastScrollY}px`;
}

function releaseScrollLock() {
  document.body.classList.remove(SCROLL_LOCK_CLASS);
  document.body.dataset.scrollLocked = "false";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";
  window.scrollTo(0, lastScrollY);
}

export function registerModalOpen() {
  if (openModalCount === 0) {
    applyScrollLock();
  }
  openModalCount += 1;
}

export function registerModalClose() {
  if (openModalCount === 0) {
    return;
  }

  openModalCount -= 1;
  if (openModalCount === 0) {
    releaseScrollLock();
  }
}

export function resetModalState() {
  openModalCount = 0;
  document.body.classList.remove(SCROLL_LOCK_CLASS);
  document.body.dataset.scrollLocked = "false";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";
}
