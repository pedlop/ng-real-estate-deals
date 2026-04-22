import { Deal } from '@models/deal.model';

/**
 * Applies name + purchase price filters without mutating `deals`.
 * Name: case-insensitive substring; price: optional inclusive bounds.
 */
export function filterDeals(
  deals: readonly Deal[],
  search: string,
  minPrice: number | null,
  maxPrice: number | null,
): Deal[] {
  const q = search.trim().toLowerCase();
  return deals.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q)) {
      return false;
    }
    if (minPrice != null && d.purchasePrice < minPrice) {
      return false;
    }
    if (maxPrice != null && d.purchasePrice > maxPrice) {
      return false;
    }
    return true;
  });
}
