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
  let offsetX = 0;
  let offsetY = 0;
  let hasCustomPosition = false;

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

  function updatePosition(clientX, clientY) {
    const rect = modal.getBoundingClientRect();
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const minLeft = DEFAULT_MARGIN;
    const maxLeft = Math.max(minLeft, availableWidth - rect.width - DEFAULT_MARGIN);
    const minTop = DEFAULT_MARGIN;
    const maxTop = Math.max(minTop, availableHeight - rect.height - DEFAULT_MARGIN);
    const clampedLeft = clamp(clientX - offsetX, minLeft, maxLeft);
    const clampedTop = clamp(clientY - offsetY, minTop, maxTop);
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
    modal.dataset.dragging = "false";
    container.dataset.dragging = "false";
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
  }

  function handlePointerMove(event) {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }
    event.preventDefault();
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
    let rect = modal.getBoundingClientRect();
    if (modal.style.transform.includes("-50%")) {
      modal.style.transform = "translate(0, 0)";
      modal.style.left = `${rect.left}px`;
      modal.style.top = `${rect.top}px`;
      rect = modal.getBoundingClientRect();
    }
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    modal.dataset.dragging = "true";
    container.dataset.dragging = "true";
    handle.style.cursor = "grabbing";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    event.preventDefault();
  }

  handle.addEventListener("pointerdown", startDrag);

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
    },
  };

  applyCenterPosition();

  return controller;
}
