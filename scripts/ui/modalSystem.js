const FOCUSABLE_SELECTORS = [
  'a[href]','area[href]','button:not([disabled])','input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])','textarea:not([disabled])','iframe','audio[controls]','video[controls]',
  '[contenteditable]','[tabindex]:not([tabindex="-1"])'
].join(',');

let activeModalCount = 0;
let resizeListenerAttached = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function syncDocumentState() {
  const html = document.documentElement;
  const body = document.body;
  if (!html || !body) {
    return;
  }

  const hasOpenModal = activeModalCount > 0;
  html.classList.toggle('modal-open', hasOpenModal);
  body.classList.toggle('modal-open', hasOpenModal);

  if (hasOpenModal) {
    const scrollbarGap = clamp(window.innerWidth - html.clientWidth, 0, 48);
    if (scrollbarGap > 0) {
      body.style.setProperty('--modal-scrollbar-gap', `${scrollbarGap}px`);
    } else {
      body.style.removeProperty('--modal-scrollbar-gap');
    }
    body.dataset.modalLocked = 'true';
    if (!body.dataset.previousOverflow) {
      body.dataset.previousOverflow = body.style.overflow || '';
    }
    body.style.overflow = 'hidden';
  } else {
    body.style.removeProperty('--modal-scrollbar-gap');
    if (body.dataset.modalLocked) {
      body.style.overflow = body.dataset.previousOverflow || '';
    }
    delete body.dataset.modalLocked;
    delete body.dataset.previousOverflow;
  }
}

function handleWindowResize() {
  if (activeModalCount > 0) {
    syncDocumentState();
  }
}

function ensureResizeListener() {
  if (!resizeListenerAttached) {
    window.addEventListener('resize', handleWindowResize, { passive: true });
    resizeListenerAttached = true;
  }
}

function getFocusableElements(container) {
  if (!container) {
    return [];
  }
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
  return elements.filter((element) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }
    if (element.hasAttribute('disabled')) {
      return false;
    }
    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  });
}

export function createModalHost(container, config = {}) {
  if (!container) {
    throw new Error('Modal host requires a valid container element');
  }

  const options = {
    labelledBy: config.labelledBy || null,
    describedBy: config.describedBy || null,
    role: config.role || 'dialog',
    size: config.size || 'md',
    tone: config.tone || 'midnight',
    trapFocus: config.trapFocus !== false,
    closeOnBackdrop: config.closeOnBackdrop !== false,
    closeOnEscape: config.closeOnEscape !== false,
    onOpen: typeof config.onOpen === 'function' ? config.onOpen : null,
    onClose: typeof config.onClose === 'function' ? config.onClose : null,
  };

  let requestCloseHandler = typeof config.onRequestClose === 'function' ? config.onRequestClose : null;

  container.innerHTML = '';
  container.classList.add('modal-host');
  container.dataset.modalSize = options.size;
  container.dataset.modalTone = options.tone;
  container.setAttribute('role', options.role);
  if (options.labelledBy) {
    container.setAttribute('aria-labelledby', options.labelledBy);
  }
  if (options.describedBy) {
    container.setAttribute('aria-describedby', options.describedBy);
  }
  container.setAttribute('aria-modal', 'false');
  container.setAttribute('aria-hidden', 'true');
  container.hidden = true;
  container.dataset.open = 'false';

  const layer = document.createElement('div');
  layer.className = 'modal-layer';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'presentation');

  const surface = document.createElement('div');
  surface.className = 'modal-surface';
  surface.setAttribute('role', 'document');
  surface.tabIndex = -1;

  layer.appendChild(overlay);
  layer.appendChild(surface);
  container.appendChild(layer);

  let isOpen = false;
  let focusableElements = [];
  let previouslyFocusedElement = null;

  function updateContainerState() {
    container.dataset.open = isOpen ? 'true' : 'false';
    container.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    container.setAttribute('aria-modal', isOpen ? 'true' : 'false');
    if (isOpen) {
      container.removeAttribute('hidden');
    } else if (!container.hasAttribute('hidden')) {
      container.setAttribute('hidden', '');
    }
  }

  function refreshFocusCycle() {
    focusableElements = getFocusableElements(surface);
  }

  function focusInitialElement() {
    refreshFocusCycle();
    const target = focusableElements[0] || surface;
    window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  }

  function openModal() {
    if (isOpen) {
      return;
    }
    previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isOpen = true;
    updateContainerState();
    activeModalCount += 1;
    ensureResizeListener();
    syncDocumentState();
    focusInitialElement();
    options.onOpen?.();
  }

  function closeModal({ restoreFocus = true } = {}) {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    updateContainerState();
    activeModalCount = Math.max(0, activeModalCount - 1);
    syncDocumentState();
    options.onClose?.();
    const shouldRestoreFocus = restoreFocus && previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function';
    if (shouldRestoreFocus) {
      previouslyFocusedElement.focus();
    }
    previouslyFocusedElement = null;
  }

  function handleFocusTrap(event) {
    if (!isOpen || options.trapFocus === false || event.key !== 'Tab') {
      return;
    }
    refreshFocusCycle();
    if (!focusableElements.length) {
      event.preventDefault();
      surface.focus({ preventScroll: true });
      return;
    }
    const currentIndex = focusableElements.indexOf(event.target);
    const lastIndex = focusableElements.length - 1;
    if (event.shiftKey) {
      if (currentIndex <= 0) {
        event.preventDefault();
        focusableElements[lastIndex].focus();
      }
    } else {
      if (currentIndex === lastIndex) {
        event.preventDefault();
        focusableElements[0].focus();
      }
    }
  }

  function requestClose(reason) {
    if (requestCloseHandler) {
      const result = requestCloseHandler(reason);
      if (result === false) {
        return;
      }
    }
    closeModal();
  }

  function handleKeydown(event) {
    if (!isOpen) {
      return;
    }
    if (event.key === 'Escape' && options.closeOnEscape !== false) {
      event.preventDefault();
      requestClose('escape');
      return;
    }
    handleFocusTrap(event);
  }

  function handlePointerDown(event) {
    if (!isOpen || options.closeOnBackdrop === false) {
      return;
    }
    if (event.target === overlay) {
      event.preventDefault();
      requestClose('backdrop');
    }
  }

  container.addEventListener('keydown', handleKeydown);
  overlay.addEventListener('pointerdown', handlePointerDown);

  const controller = {
    open: openModal,
    close(options) {
      closeModal(options);
    },
    toggle(force) {
      const shouldOpen = typeof force === 'boolean' ? force : !isOpen;
      if (shouldOpen) {
        openModal();
      } else {
        closeModal();
      }
    },
    isOpen: () => isOpen,
    requestClose,
    refreshFocusTrap: refreshFocusCycle,
    setSize(size) {
      if (!size) return;
      container.dataset.modalSize = size;
    },
    setTone(tone) {
      if (!tone) return;
      container.dataset.modalTone = tone;
    },
    setCloseHandler(handler) {
      requestCloseHandler = typeof handler === 'function' ? handler : null;
    },
    updateConfig(next = {}) {
      if (typeof next.labelledBy === 'string') {
        container.setAttribute('aria-labelledby', next.labelledBy);
      }
      if (typeof next.describedBy === 'string') {
        container.setAttribute('aria-describedby', next.describedBy);
      }
      if (typeof next.trapFocus === 'boolean') {
        options.trapFocus = next.trapFocus;
      }
      if (typeof next.closeOnBackdrop === 'boolean') {
        options.closeOnBackdrop = next.closeOnBackdrop;
      }
      if (typeof next.closeOnEscape === 'boolean') {
        options.closeOnEscape = next.closeOnEscape;
      }
      if (typeof next.onOpen === 'function') {
        options.onOpen = next.onOpen;
      }
      if (typeof next.onClose === 'function') {
        options.onClose = next.onClose;
      }
    },
    destroy() {
      overlay.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('keydown', handleKeydown);
      closeModal({ restoreFocus: false });
      container.innerHTML = '';
      container.classList.remove('modal-host');
      container.removeAttribute('role');
      container.removeAttribute('aria-hidden');
      container.removeAttribute('aria-modal');
      container.removeAttribute('aria-labelledby');
      container.removeAttribute('aria-describedby');
      delete container.dataset.modalSize;
      delete container.dataset.modalTone;
      delete container.dataset.open;
    },
    get surface() {
      return surface;
    },
    get overlay() {
      return overlay;
    },
    get container() {
      return container;
    },
  };

  return controller;
}
