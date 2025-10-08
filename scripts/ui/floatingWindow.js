const DEFAULT_MARGIN = 24;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isInteractiveElement(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    element.closest(
      'button, a, input, textarea, select, [data-no-drag], [role="button"], [role="tab"], [role="menuitem"]',
    ),
  );
}

export function createFloatingWindow({ container, modal, handle }) {
  if (!container || !modal || !handle) {
    return {
      center: () => {},
      destroy: () => {},
      hasCustomPosition: () => false,
    };
  }

  let pointerId = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startLeft = 0;
  let startTop = 0;
  let modalWidth = 0;
  let modalHeight = 0;
  let hasCustomPosition = false;
  let isDragging = false;

  container.classList.add("floating-overlay");
  modal.classList.add("floating-window");
  handle.classList.add("floating-window__handle");
  handle.style.cursor = "grab";

  function applyCenterPosition() {
    hasCustomPosition = false;
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.dataset.dragging = "false";
    container.dataset.dragging = "false";
  }

  function computeBounds(size, viewportSize) {
    const limit = viewportSize - DEFAULT_MARGIN - size;
    return {
      min: Math.min(DEFAULT_MARGIN, limit),
      max: Math.max(DEFAULT_MARGIN, limit),
    };
  }

  function updatePosition(clientX, clientY) {
    const deltaX = clientX - startPointerX;
    const deltaY = clientY - startPointerY;
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const { min: minLeft, max: maxLeft } = computeBounds(modalWidth, availableWidth);
    const { min: minTop, max: maxTop } = computeBounds(modalHeight, availableHeight);
    const nextLeft = clamp(startLeft + deltaX, minLeft, maxLeft);
    const nextTop = clamp(startTop + deltaY, minTop, maxTop);

    modal.style.left = `${nextLeft}px`;
    modal.style.top = `${nextTop}px`;
  }

  function convertToAbsolutePosition() {
    if (!modal.style.transform.includes("-50%")) {
      return;
    }

    const rect = modal.getBoundingClientRect();
    modal.style.transform = "translate(0, 0)";
    modal.style.left = `${rect.left}px`;
    modal.style.top = `${rect.top}px`;
    startLeft = rect.left;
    startTop = rect.top;
    modalWidth = rect.width;
    modalHeight = rect.height;
  }

  function ensureWithinViewportBounds() {
    const rect = modal.getBoundingClientRect();
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const { min: minLeft, max: maxLeft } = computeBounds(rect.width, availableWidth);
    const { min: minTop, max: maxTop } = computeBounds(rect.height, availableHeight);

    if (modal.style.transform.includes("-50%")) {
      return;
    }

    const clampedLeft = clamp(rect.left, minLeft, maxLeft);
    const clampedTop = clamp(rect.top, minTop, maxTop);

    modal.style.left = `${clampedLeft}px`;
    modal.style.top = `${clampedTop}px`;
  }

  function endDrag(event) {
    if (pointerId !== null && event.pointerId !== pointerId) {
      return;
    }
    handle.releasePointerCapture?.(pointerId);
    pointerId = null;
    handle.style.cursor = "grab";
    if (isDragging) {
      modal.dataset.dragging = "false";
      container.dataset.dragging = "false";
    }
    isDragging = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    ensureWithinViewportBounds();
  }

  function handlePointerMove(event) {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }
    event.preventDefault();
    if (!isDragging) {
      convertToAbsolutePosition();
      modal.dataset.dragging = "true";
      container.dataset.dragging = "true";
      handle.style.cursor = "grabbing";
      isDragging = true;
    }
    hasCustomPosition = true;
    updatePosition(event.clientX, event.clientY);
  }

  function startDrag(event) {
    if (pointerId !== null) {
      return;
    }
    if (isInteractiveElement(event.target)) {
      return;
    }
    pointerId = event.pointerId;
    handle.setPointerCapture?.(pointerId);
    const rect = modal.getBoundingClientRect();
    startPointerX = event.clientX;
    startPointerY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    modalWidth = rect.width;
    modalHeight = rect.height;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    event.preventDefault();
  }

  handle.addEventListener("pointerdown", startDrag);

  function handleResize() {
    if (hasCustomPosition) {
      ensureWithinViewportBounds();
    } else {
      applyCenterPosition();
    }
  }

  window.addEventListener("resize", handleResize);

  const controller = {
    center: () => {
      applyCenterPosition();
    },
    hasCustomPosition: () => hasCustomPosition,
    destroy: () => {
      handle.removeEventListener("pointerdown", startDrag);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("resize", handleResize);
    },
  };

  applyCenterPosition();

  return controller;
}
