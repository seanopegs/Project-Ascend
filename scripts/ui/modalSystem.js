const FOCUSABLE_SELECTORS = [
  'a[href]','area[href]','button:not([disabled])','input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])','textarea:not([disabled])','iframe','audio[controls]','video[controls]',
  '[contenteditable]','[tabindex]:not([tabindex="-1"])'
].join(',');

const DRAG_EXCLUDE_SELECTOR =
  'button, a[href], input, select, textarea, label, [role="button"], [role="link"], [role="tab"], [data-modal-drag-ignore]';

let lockedModalCount = 0;
let resizeListenerAttached = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parsePositiveNumber(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function parseDimension(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
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

  const originalParent = container.parentElement;
  let hostPlaceholder = null;

  if (originalParent && container.parentNode !== document.body) {
    hostPlaceholder = document.createComment('modal-host-anchor');
    originalParent.replaceChild(hostPlaceholder, container);
    document.body.appendChild(container);
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
    resizable: config.resizable === true,
    minWidth: parsePositiveNumber(config.minWidth) ?? 420,
    minHeight: parsePositiveNumber(config.minHeight) ?? 320,
    maxWidth: parsePositiveNumber(config.maxWidth) ?? null,
    maxHeight: parsePositiveNumber(config.maxHeight) ?? null,
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
  let resizeHandle = null;
  let resizeState = null;
  let hasManualWidth = false;
  let hasManualHeight = false;

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

  function parseOffset(value) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function getCurrentOffsets() {
    return {
      x: parseOffset(surface.style.getPropertyValue('--modal-offset-x')),
      y: parseOffset(surface.style.getPropertyValue('--modal-offset-y')),
    };
  }

  function applyOffset(offsetX, offsetY) {
    surface.style.setProperty('--modal-offset-x', `${offsetX}px`);
    surface.style.setProperty('--modal-offset-y', `${offsetY}px`);
  }

  function resetPosition() {
    surface.style.removeProperty('--modal-offset-x');
    surface.style.removeProperty('--modal-offset-y');
    surface.classList.remove('is-dragging');
  }

  function constrainToViewport(width, height, offsetX, offsetY) {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || width;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || height;
    const surfaceWidth = width ?? surface.getBoundingClientRect().width;
    const surfaceHeight = height ?? surface.getBoundingClientRect().height;

    const halfWidth = surfaceWidth / 2;
    const halfHeight = surfaceHeight / 2;
    const marginX = Math.min(48, Math.max(16, Math.floor(viewportWidth * 0.05)));
    const marginY = Math.min(48, Math.max(16, Math.floor(viewportHeight * 0.08)));

    const minCenterX = marginX + halfWidth;
    const maxCenterX = viewportWidth - marginX - halfWidth;
    const minCenterY = marginY + halfHeight;
    const maxCenterY = viewportHeight - marginY - halfHeight;

    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    let clampedOffsetX = offsetX;
    let clampedOffsetY = offsetY;

    if (minCenterX <= maxCenterX) {
      const minOffsetX = minCenterX - viewportCenterX;
      const maxOffsetX = maxCenterX - viewportCenterX;
      clampedOffsetX = clamp(offsetX, minOffsetX, maxOffsetX);
    } else {
      clampedOffsetX = 0;
    }

    if (minCenterY <= maxCenterY) {
      const minOffsetY = minCenterY - viewportCenterY;
      const maxOffsetY = maxCenterY - viewportCenterY;
      clampedOffsetY = clamp(offsetY, minOffsetY, maxOffsetY);
    } else {
      clampedOffsetY = 0;
    }

    return { x: clampedOffsetX, y: clampedOffsetY };
  }

  function commitConstrainedOffsets({ width, height } = {}) {
    const { x, y } = getCurrentOffsets();
    const constrained = constrainToViewport(width, height, x, y);
    applyOffset(constrained.x, constrained.y);
  }

  function getSizeConstraints() {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const marginX = Math.min(48, Math.max(16, Math.floor(viewportWidth * 0.05)));
    const marginY = Math.min(48, Math.max(16, Math.floor(viewportHeight * 0.08)));
    const availableWidth = Math.max(280, viewportWidth - marginX * 2);
    const availableHeight = Math.max(240, viewportHeight - marginY * 2);

    let maxWidth = options.maxWidth ? Math.min(options.maxWidth, availableWidth) : availableWidth;
    let maxHeight = options.maxHeight ? Math.min(options.maxHeight, availableHeight) : availableHeight;
    let minWidth = Math.min(options.minWidth, availableWidth);
    let minHeight = Math.min(options.minHeight, availableHeight);

    if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
      maxWidth = availableWidth;
    }
    if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
      maxHeight = availableHeight;
    }
    if (minWidth > maxWidth) {
      minWidth = maxWidth;
    }
    if (minHeight > maxHeight) {
      minHeight = maxHeight;
    }

    return {
      minWidth: Math.max(240, minWidth),
      minHeight: Math.max(200, minHeight),
      maxWidth: Math.max(240, maxWidth),
      maxHeight: Math.max(200, maxHeight),
    };
  }

  function getCurrentSize() {
    const rect = surface.getBoundingClientRect();
    const inlineWidth = parseDimension(surface.style.width);
    const inlineHeight = parseDimension(surface.style.height);
    const width = inlineWidth ?? rect.width;
    const height = inlineHeight ?? rect.height;
    return { width, height, inlineWidth, inlineHeight, rect };
  }

  function applySize(width, height, { manual = false } = {}) {
    if (Number.isFinite(width)) {
      const rounded = Math.max(0, Math.round(width));
      surface.style.width = `${rounded}px`;
      if (manual) {
        hasManualWidth = true;
      }
    }
    if (Number.isFinite(height)) {
      const rounded = Math.max(0, Math.round(height));
      surface.style.height = `${rounded}px`;
      if (manual) {
        hasManualHeight = true;
      }
    }
  }

  function clearSurfaceSize() {
    surface.style.removeProperty('width');
    surface.style.removeProperty('height');
    hasManualWidth = false;
    hasManualHeight = false;
  }

  function clampSizeToViewport() {
    if (!options.resizable) {
      return;
    }
    const { width, height, inlineWidth, inlineHeight } = getCurrentSize();
    const constraints = getSizeConstraints();
    const enforceMinWidth = hasManualWidth || inlineWidth !== null;
    const enforceMinHeight = hasManualHeight || inlineHeight !== null;

    const minWidth = enforceMinWidth ? constraints.minWidth : Math.min(width, constraints.maxWidth);
    const minHeight = enforceMinHeight ? constraints.minHeight : Math.min(height, constraints.maxHeight);

    const clampedWidth = clamp(width, minWidth, constraints.maxWidth);
    const clampedHeight = clamp(height, minHeight, constraints.maxHeight);

    const widthNeedsUpdate = enforceMinWidth || inlineWidth !== null || clampedWidth !== width;
    const heightNeedsUpdate = enforceMinHeight || inlineHeight !== null || clampedHeight !== height;

    if (widthNeedsUpdate) {
      applySize(clampedWidth, null);
    }
    if (heightNeedsUpdate) {
      applySize(null, clampedHeight);
    }
    commitConstrainedOffsets({ width: clampedWidth, height: clampedHeight });
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

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    const desiredOffsetX = dragState.baseOffsetX + deltaX;
    const desiredOffsetY = dragState.baseOffsetY + deltaY;

    const constrained = constrainToViewport(
      dragState.width,
      dragState.height,
      desiredOffsetX,
      desiredOffsetY,
    );

    applyOffset(constrained.x, constrained.y);
  }

  function handlePointerUp(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    const { width, height } = dragState;
    stopDragging();
    commitConstrainedOffsets({ width, height });
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

    if (target.closest(DRAG_EXCLUDE_SELECTOR)) {
      return;
    }

    const rect = surface.getBoundingClientRect();
    const offsets = getCurrentOffsets();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseOffsetX: offsets.x,
      baseOffsetY: offsets.y,
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

  function stopResizing({ commit = true } = {}) {
    if (!resizeState) {
      return;
    }
    window.removeEventListener('pointermove', handleResizePointerMove);
    window.removeEventListener('pointerup', handleResizePointerUp);
    window.removeEventListener('pointercancel', handleResizePointerUp);
    resizeHandle?.releasePointerCapture?.(resizeState.pointerId);
    surface.classList.remove('is-resizing');
    if (commit) {
      clampSizeToViewport();
    }
    resizeState = null;
  }

  function handleResizePointerMove(event) {
    if (!resizeState || event.pointerId !== resizeState.pointerId) {
      return;
    }
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;
    const constraints = getSizeConstraints();
    const desiredWidth = resizeState.baseWidth + deltaX;
    const desiredHeight = resizeState.baseHeight + deltaY;
    const width = clamp(desiredWidth, constraints.minWidth, constraints.maxWidth);
    const height = clamp(desiredHeight, constraints.minHeight, constraints.maxHeight);
    applySize(width, height, { manual: true });
    commitConstrainedOffsets({ width, height });
  }

  function handleResizePointerUp(event) {
    if (!resizeState || event.pointerId !== resizeState.pointerId) {
      return;
    }
    stopResizing();
  }

  function handleResizePointerDown(event) {
    if (event.button !== 0 || !options.resizable) {
      return;
    }
    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    const rect = surface.getBoundingClientRect();
    resizeState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseWidth: rect.width,
      baseHeight: rect.height,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    surface.classList.add('is-resizing');
    window.addEventListener('pointermove', handleResizePointerMove);
    window.addEventListener('pointerup', handleResizePointerUp);
    window.addEventListener('pointercancel', handleResizePointerUp);
    event.stopPropagation();
    event.preventDefault();
  }

  function ensureResizeHandle() {
    if (!options.resizable) {
      return;
    }
    if (resizeHandle && surface.contains(resizeHandle)) {
      return;
    }
    if (resizeHandle) {
      resizeHandle.removeEventListener('pointerdown', handleResizePointerDown);
      resizeHandle = null;
    }
    const handle = document.createElement('div');
    handle.className = 'modal-resize-handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.tabIndex = -1;
    surface.appendChild(handle);
    handle.addEventListener('pointerdown', handleResizePointerDown);
    resizeHandle = handle;
  }

  function destroyResizeHandle() {
    if (!resizeHandle) {
      return;
    }
    resizeHandle.removeEventListener('pointerdown', handleResizePointerDown);
    if (resizeHandle.parentNode === surface) {
      resizeHandle.parentNode.removeChild(resizeHandle);
    }
    resizeHandle = null;
  }

  function syncResizableState() {
    if (options.resizable) {
      surface.dataset.resizable = 'true';
      ensureResizeHandle();
      if (isOpen) {
        clampSizeToViewport();
      }
    } else {
      stopResizing({ commit: false });
      destroyResizeHandle();
      delete surface.dataset.resizable;
      clearSurfaceSize();
    }
  }

  function handleViewportResize() {
    if (!isOpen) {
      return;
    }
    if (options.resizable) {
      clampSizeToViewport();
    } else if (options.draggable) {
      commitConstrainedOffsets();
    }
  }

  window.addEventListener('resize', handleViewportResize, { passive: true });
  window.addEventListener('orientationchange', handleViewportResize, { passive: true });

  syncResizableState();

  function openModal() {
    if (isOpen) {
      return;
    }
    resetPosition();
    previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isOpen = true;
    updateContainerState();
    syncResizableState();
    if (options.lockScroll) {
      lockedModalCount += 1;
      ensureResizeListener();
      syncDocumentState();
    }
    if (options.resizable) {
      clampSizeToViewport();
    } else if (options.draggable) {
      commitConstrainedOffsets();
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
    stopResizing({ commit: false });
    stopDragging();
    resetPosition();
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
      let layoutChanged = false;
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
        if (isOpen && options.draggable && !options.resizable) {
          commitConstrainedOffsets();
        }
      }
      if (typeof next.draggable === 'boolean') {
        options.draggable = next.draggable;
        if (options.draggable) {
          container.dataset.modalDraggable = 'true';
          if (isOpen) {
            commitConstrainedOffsets();
          }
        } else {
          delete container.dataset.modalDraggable;
          stopDragging();
          if (isOpen) {
            resetPosition();
          }
        }
      }
      if (typeof next.dragHandle === 'string' || next.dragHandle === null) {
        options.dragHandle = typeof next.dragHandle === 'string' ? next.dragHandle : null;
      }
      if (typeof next.resizable === 'boolean') {
        options.resizable = next.resizable;
        layoutChanged = true;
      }
      const minWidth = parsePositiveNumber(next.minWidth);
      if (minWidth !== null) {
        options.minWidth = minWidth;
        layoutChanged = true;
      }
      const minHeight = parsePositiveNumber(next.minHeight);
      if (minHeight !== null) {
        options.minHeight = minHeight;
        layoutChanged = true;
      }
      if (next.maxWidth === null) {
        options.maxWidth = null;
        layoutChanged = true;
      } else {
        const maxWidth = parsePositiveNumber(next.maxWidth);
        if (maxWidth !== null) {
          options.maxWidth = maxWidth;
          layoutChanged = true;
        }
      }
      if (next.maxHeight === null) {
        options.maxHeight = null;
        layoutChanged = true;
      } else {
        const maxHeight = parsePositiveNumber(next.maxHeight);
        if (maxHeight !== null) {
          options.maxHeight = maxHeight;
          layoutChanged = true;
        }
      }
      if (typeof next.onOpen === 'function') {
        options.onOpen = next.onOpen;
      }
      if (typeof next.onClose === 'function') {
        options.onClose = next.onClose;
      }
      if (layoutChanged) {
        syncResizableState();
        if (!options.resizable && options.draggable && isOpen) {
          commitConstrainedOffsets();
        }
      }
    },
    destroy() {
      overlay.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('keydown', handleKeydown);
      surface.removeEventListener('pointerdown', handleSurfacePointerDown);
      window.removeEventListener('resize', handleViewportResize);
      window.removeEventListener('orientationchange', handleViewportResize);
      stopResizing({ commit: false });
      destroyResizeHandle();
      delete surface.dataset.resizable;
      clearSurfaceSize();
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
      if (hostPlaceholder && hostPlaceholder.parentNode) {
        hostPlaceholder.parentNode.replaceChild(container, hostPlaceholder);
        hostPlaceholder = null;
      } else if (originalParent && !originalParent.contains(container)) {
        originalParent.appendChild(container);
      }
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
