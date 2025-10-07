const SCROLL_LOCK_CLASS = "modal-open";

let openModalCount = 0;
let lastScrollY = 0;
let previousPaddingRight = "";

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function applyScrollLock() {
  lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;

  const body = document.body;
  const scrollbarWidth = getScrollbarWidth();
  previousPaddingRight = body.style.paddingRight;

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  body.classList.add(SCROLL_LOCK_CLASS);
  document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  body.dataset.scrollLocked = "true";
}

function releaseScrollLock() {
  const body = document.body;
  body.classList.remove(SCROLL_LOCK_CLASS);
  document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  body.dataset.scrollLocked = "false";
  body.style.paddingRight = previousPaddingRight;
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
  const body = document.body;
  body.classList.remove(SCROLL_LOCK_CLASS);
  document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  body.dataset.scrollLocked = "false";
  body.style.paddingRight = previousPaddingRight;
}
