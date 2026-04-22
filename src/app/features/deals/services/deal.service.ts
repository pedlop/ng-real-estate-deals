import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Deal, DealPlain } from '@models/deal.model';

const STORAGE_KEY = 'ng-real-estate-deals.deals';

/** Initial dataset when localStorage is empty; cap rates mix below 5%, 5–12%, and above 12%. */
function seedDeals(): Deal[] {
  return [
    new Deal(
      'deal-seed-01',
      'Sunset Apartments',
      850_000,
      '2100 Sunset Blvd, Los Angeles, CA',
      42_500, // 5.00% — typical band
    ),
    new Deal(
      'deal-seed-02',
      'Downtown Office Plaza',
      4_200_000,
      '450 W 42nd St, New York, NY',
      336_000, // 8.00%
    ),
    new Deal(
      'deal-seed-03',
      'Retail Center West',
      1_450_000,
      '8800 W Colfax Ave, Lakewood, CO',
      60_000, // ~4.1% — below typical
    ),
    new Deal(
      'deal-seed-04',
      'Mixed-Use Hub',
      3_200_000,
      '1550 Market St, San Francisco, CA',
      448_000, // 14.0% — high
    ),
    new Deal(
      'deal-seed-05',
      'Riverside Condos',
      175_000,
      '44 River Rd, Portland, OR',
      6_300, // ~3.6% — smaller acquisition
    ),
    new Deal(
      'deal-seed-06',
      'Industrial Warehouse Park',
      5_000_000,
      '1200 Logistics Way, Atlanta, GA',
      250_000, // 5.00%
    ),
    new Deal(
      'deal-seed-07',
      'Garden Court Townhomes',
      325_000,
      '18 Garden Ct, Nashville, TN',
      42_250, // 13.0%
    ),
    new Deal(
      'deal-seed-08',
      'Medical Office Building',
      2_800_000,
      '2200 Healthcare Dr, Houston, TX',
      252_000, // 9.0%
    ),
    new Deal(
      'deal-seed-09',
      'Corner Store & Lofts',
      980_000,
      '3001 Division St, Chicago, IL',
      127_400, // 13.0%
    ),
    new Deal(
      'deal-seed-10',
      'Suburban Strip Mall',
      1_100_000,
      '7600 Retail Row, Phoenix, AZ',
      38_500, // 3.5%
    ),
    new Deal(
      'deal-seed-11',
      'Lakeside Multifamily',
      1_650_000,
      '900 Lake Shore Dr, Milwaukee, WI',
      140_250, // 8.5%
    ),
    new Deal(
      'deal-seed-12',
      'Historic Loft Conversion',
      725_000,
      '88 Pearl St, Boston, MA',
      58_000, // ~8.0%
    ),
  ];
}

@Injectable({
  providedIn: 'root',
})
export class DealService {
  private readonly dealsSubject: BehaviorSubject<Deal[]>;

  constructor() {
    this.dealsSubject = new BehaviorSubject<Deal[]>(this.loadInitialDeals());
  }

  getDeals(): Observable<Deal[]> {
    return this.dealsSubject.asObservable();
  }

  addDeal(deal: Deal): void {
    const next = [...this.dealsSubject.getValue(), deal];
    this.persist(next);
  }

  updateDeal(deal: Deal): void {
    const current = this.dealsSubject.getValue();
    const index = current.findIndex((d) => d.id === deal.id);
    if (index === -1) {
      return;
    }
    const next = [...current];
    next[index] = deal;
    this.persist(next);
  }

  removeDeal(id: string): void {
    const next = this.dealsSubject.getValue().filter((d) => d.id !== id);
    this.persist(next);
  }

  private loadInitialDeals(): Deal[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return this.seedAndSave();
      }
      const parsed: unknown = JSON.parse(raw);
      const deals = this.parseDeals(parsed);
      if (deals.length === 0) {
        return this.seedAndSave();
      }
      return deals;
    } catch {
      return this.seedAndSave();
    }
  }

  private seedAndSave(): Deal[] {
    const seeded = seedDeals();
    this.saveToStorage(seeded);
    return seeded;
  }

  private persist(deals: Deal[]): void {
    this.saveToStorage(deals);
    this.dealsSubject.next(deals);
  }

  private saveToStorage(deals: Deal[]): void {
    const plain: DealPlain[] = deals.map((d) => ({
      id: d.id,
      name: d.name,
      purchasePrice: d.purchasePrice,
      address: d.address,
      noi: d.noi,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
  }

  private parseDeals(value: unknown): Deal[] {
    if (!Array.isArray(value)) {
      return [];
    }
    const deals: Deal[] = [];
    for (const item of value) {
      if (this.isDealPlain(item)) {
        deals.push(Deal.fromPlain(item));
      }
    }
    return deals;
  }

  private isDealPlain(value: unknown): value is DealPlain {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const v = value as Record<string, unknown>;
    return (
      typeof v['id'] === 'string' &&
      typeof v['name'] === 'string' &&
      typeof v['purchasePrice'] === 'number' &&
      typeof v['address'] === 'string' &&
      typeof v['noi'] === 'number'
    );
  }
}
