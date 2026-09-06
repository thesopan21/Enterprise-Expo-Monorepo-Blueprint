export function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value[0]!.toUpperCase() + value.slice(1);
}

export function truncate(value: string, maxLength: number, suffix = "…"): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, Math.max(0, maxLength - suffix.length)) + suffix;
}

// \p{M} (Mark) matches the combining diacritical marks left behind by NFKD
// normalization (e.g. accented characters), stripped before collapsing
// everything else non-alphanumeric into hyphens.
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
