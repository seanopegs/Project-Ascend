const FOCUSABLE_SELECTORS = [
  'a[href]','area[href]','button:not([disabled])','input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])','textarea:not([disabled])','iframe','audio[controls]','video[controls]',
  '[contenteditable]','[tabindex]:not([tabindex="-1"])'
].join(',');

let lockedModalCount = 0;
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

  const hasOpenModal = lockedModalCount > 0;
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
  if (lockedModalCount > 0) {
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
    lockScroll: config.lockScroll !== false,
    draggable: config.draggable === true,
    dragHandle: typeof config.dragHandle === 'string' ? config.dragHandle : null,
    onOpen: typeof config.onOpen === 'function' ? config.onOpen : null,
    onClose: typeof config.onClose === 'function' ? config.onClose : null,
  };

  let requestCloseHandler = typeof config.onRequestClose === 'function' ? config.onRequestClose : null;

  container.innerHTML = '';
  container.classList.add('modal-host');
  container.dataset.modalSize = options.size;
  container.dataset.modalTone = options.tone;
  container.dataset.modalMode = options.lockScroll ? 'modal' : 'floating';
  container.dataset.modalOverlay = options.lockScroll ? 'scrim' : 'none';
  if (options.draggable) {
    container.dataset.modalDraggable = 'true';
  }
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
  let dragState = null;

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
    if (options.trapFocus === false) {
      focusableElements = [];
      return;
    }
    focusableElements = getFocusableElements(surface);
  }

  function focusInitialElement() {
    refreshFocusCycle();
    const target = focusableElements[0] || surface;
    window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  }

  function resetPosition() {
    surface.style.removeProperty('--modal-offset-x');
    surface.style.removeProperty('--modal-offset-y');
    surface.classList.remove('is-dragging');
  }

  function applyOffset(offsetX, offsetY) {
    surface.style.setProperty('--modal-offset-x', `${offsetX}px`);
    surface.style.setProperty('--modal-offset-y', `${offsetY}px`);
  }

  function stopDragging() {
    if (!dragState) {
      return;
    }
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
    surface.releasePointerCapture?.(dragState.pointerId);
    surface.classList.remove('is-dragging');
    dragState = null;
  }

  function handlePointerMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const marginX = Math.min(32, Math.floor(viewportWidth * 0.1));
    const marginY = Math.min(32, Math.floor(viewportHeight * 0.1));

    const minLeft = Math.min(marginX, viewportWidth - dragState.width);
    const maxLeft = Math.max(viewportWidth - dragState.width - marginX, marginX);
    const minTop = Math.min(marginY, viewportHeight - dragState.height);
    const maxTop = Math.max(viewportHeight - dragState.height - marginY, marginY);

    const rawLeft = event.clientX - dragState.offsetX;
    const rawTop = event.clientY - dragState.offsetY;

    const nextLeft = clamp(rawLeft, Math.min(minLeft, maxLeft), Math.max(minLeft, maxLeft));
    const nextTop = clamp(rawTop, Math.min(minTop, maxTop), Math.max(minTop, maxTop));

    const nextCenterX = nextLeft + dragState.width / 2;
    const nextCenterY = nextTop + dragState.height / 2;

    const offsetX = nextCenterX - viewportWidth / 2;
    const offsetY = nextCenterY - viewportHeight / 2;

    applyOffset(offsetX, offsetY);
  }

  function handlePointerUp(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    stopDragging();
  }

  function beginDrag(event) {
    if (event.button !== 0 || !options.draggable) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (options.dragHandle) {
      const handle = target.closest(options.dragHandle);
      if (!handle || !surface.contains(handle)) {
        return;
      }
    }

    const rect = surface.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    surface.setPointerCapture?.(event.pointerId);
    surface.classList.add('is-dragging');

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    event.preventDefault();
  }

  function handleSurfacePointerDown(event) {
    beginDrag(event);
  }

  surface.addEventListener('pointerdown', handleSurfacePointerDown);

  function openModal() {
    if (isOpen) {
      return;
    }
    resetPosition();
    previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isOpen = true;
    updateContainerState();
    if (options.lockScroll) {
      lockedModalCount += 1;
      ensureResizeListener();
      syncDocumentState();
    }
    focusInitialElement();
    options.onOpen?.();
  }

  function closeModal({ restoreFocus = true } = {}) {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    updateContainerState();
    stopDragging();
    if (options.lockScroll) {
      lockedModalCount = Math.max(0, lockedModalCount - 1);
      syncDocumentState();
    }
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
    resetPosition,
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
      if (typeof next.lockScroll === 'boolean') {
        options.lockScroll = next.lockScroll;
        container.dataset.modalMode = options.lockScroll ? 'modal' : 'floating';
        container.dataset.modalOverlay = options.lockScroll ? 'scrim' : 'none';
      }
      if (typeof next.draggable === 'boolean') {
        options.draggable = next.draggable;
        if (options.draggable) {
          container.dataset.modalDraggable = 'true';
        } else {
          delete container.dataset.modalDraggable;
          stopDragging();
        }
      }
      if (typeof next.dragHandle === 'string' || next.dragHandle === null) {
        options.dragHandle = typeof next.dragHandle === 'string' ? next.dragHandle : null;
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
      surface.removeEventListener('pointerdown', handleSurfacePointerDown);
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
      delete container.dataset.modalMode;
      delete container.dataset.modalOverlay;
      delete container.dataset.modalDraggable;
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
