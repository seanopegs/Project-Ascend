export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeValue(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const rounded = Number(value.toFixed(2));
  return Math.abs(rounded) < 0.01 ? 0 : rounded;
}
