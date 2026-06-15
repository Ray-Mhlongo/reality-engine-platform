export function formatNumber(value, options = {}) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: options.decimals ?? 1,
    notation: options.compact ? "compact" : "standard"
  }).format(value);
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${formatNumber(value, { decimals: 1 })}%`;
}

export function titleCase(value = "") {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function safeColumnName(name, index) {
  const cleaned = String(name || "").trim();
  return cleaned || `Column ${index + 1}`;
}
