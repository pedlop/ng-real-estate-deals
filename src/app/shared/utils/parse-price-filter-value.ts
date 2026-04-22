/**
 * Coerces masked / raw form values into a non-negative number for filtering.
 * Empty or cleared input → `null` (not `0`).
 */
export function parsePriceFilterValue(raw: unknown): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) {
      return null;
    }
    return raw;
  }
  const s = String(raw).replace(/,/g, '').trim();
  if (s === '') {
    return null;
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}
