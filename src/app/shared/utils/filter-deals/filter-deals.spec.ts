import { Deal } from '@models/deal.model';
import { filterDeals } from './filter-deals';

describe('filterDeals', () => {
  const deals: Deal[] = [
    new Deal('d1', 'Sunset Apartments', 850_000, 'A', 42_500),
    new Deal('d2', 'Downtown Office Plaza', 4_200_000, 'B', 336_000),
    new Deal('d3', 'Retail Center West', 1_450_000, 'C', 60_000),
    new Deal('d4', 'Garden Court Townhomes', 325_000, 'D', 42_250),
  ];

  it('filters by name only (case-insensitive)', () => {
    const result = filterDeals(deals, 'office', null, null);
    expect(result.map((d) => d.id)).toEqual(['d2']);
  });

  it('filters by min price only', () => {
    const result = filterDeals(deals, '', 1_000_000, null);
    expect(result.map((d) => d.id)).toEqual(['d2', 'd3']);
  });

  it('filters by max price only', () => {
    const result = filterDeals(deals, '', null, 900_000);
    expect(result.map((d) => d.id)).toEqual(['d1', 'd4']);
  });

  it('combines search + min price + max price', () => {
    const result = filterDeals(deals, 'center', 1_000_000, 2_000_000);
    expect(result.map((d) => d.id)).toEqual(['d3']);
  });

  it('returns all deals when all filters are empty', () => {
    const result = filterDeals(deals, '   ', null, null);
    expect(result.map((d) => d.id)).toEqual(['d1', 'd2', 'd3', 'd4']);
  });

  it('returns empty array when no results match', () => {
    const result = filterDeals(deals, 'medical', 4_500_000, null);
    expect(result).toEqual([]);
  });

  it('does not mutate the original deals array', () => {
    const before = deals.map((d) => d.id);
    filterDeals(deals, 'sunset', null, null);
    expect(deals.map((d) => d.id)).toEqual(before);
  });
});

