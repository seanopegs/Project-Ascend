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
    const deltaX = clientX - startPointerX;
    const deltaY = clientY - startPointerY;
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const minLeft = DEFAULT_MARGIN;
    const maxLeft = Math.max(minLeft, availableWidth - modalWidth - DEFAULT_MARGIN);
    const minTop = DEFAULT_MARGIN;
    const maxTop = Math.max(minTop, availableHeight - modalHeight - DEFAULT_MARGIN);
    const nextLeft = clamp(startLeft + deltaX, minLeft, maxLeft);
    const nextTop = clamp(startTop + deltaY, minTop, maxTop);

    modal.style.left = `${nextLeft}px`;
    modal.style.top = `${nextTop}px`;
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
    startPointerX = event.clientX;
    startPointerY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    modalWidth = rect.width;
    modalHeight = rect.height;
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
