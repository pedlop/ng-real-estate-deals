/** Serializable deal fields stored in `localStorage`. */
export interface DealPlain {
  id: string;
  name: string;
  purchasePrice: number;
  address: string;
  noi: number;
}

/** Domain model with derived metrics. */
export class Deal implements DealPlain {
  constructor(
    public id: string,
    public name: string,
    public purchasePrice: number,
    public address: string,
    public noi: number,
  ) {}

  /** Capitalization rate: NOI ÷ purchase price (0 if price is 0). */
  get capRate(): number {
    if (this.purchasePrice === 0) {
      return 0;
    }
    return this.noi / this.purchasePrice;
  }

  static fromPlain(p: DealPlain): Deal {
    return new Deal(p.id, p.name, p.purchasePrice, p.address, p.noi);
  }
}
