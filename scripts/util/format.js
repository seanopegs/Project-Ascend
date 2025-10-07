export function formatCurrency(value) {
  const rounded = Math.round(value);
  const prefix = rounded < 0 ? "-Rp" : "Rp";
  return `${prefix}${Math.abs(rounded).toLocaleString("id-ID")}`;
}

export function formatCurrencyChange(amount) {
  if (Math.abs(amount) < 1) {
    return amount >= 0 ? "+Rp0" : "-Rp0";
  }
  const sign = amount > 0 ? "+" : "-";
  return `${sign}Rp${Math.abs(Math.round(amount)).toLocaleString("id-ID")}`;
}

export function formatSignedNumber(value, decimals = 1) {
  const threshold = Math.pow(10, -decimals) / 2;
  if (Math.abs(value) < threshold) {
    return "0";
  }
  const sign = value > 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(decimals)}`;
}

export function formatSignedPercent(value, decimals = 1) {
  const threshold = Math.pow(10, -decimals) / 2;
  if (Math.abs(value) < threshold) {
    return `0%`;
  }
  const sign = value > 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

export function formatChange(amount) {
  return amount > 0 ? `+${amount}` : String(amount);
}
