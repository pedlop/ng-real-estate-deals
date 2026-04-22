import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { Deal } from '@models/deal.model';
import { DEAL_CURRENCY_DIGITS_INFO, DEAL_CURRENCY_FORMAT } from '@shared/constants/currency.format';
import { CapRatePercentPipe } from '@shared/pipes/cap-rate-percent.pipe';
import { HighlightPipe } from '@shared/pipes/highlight.pipe';

function compareDeals(a: Deal, b: Deal, column: string, direction: 'asc' | 'desc'): number {
  const mult = direction === 'asc' ? 1 : -1;
  switch (column) {
    case 'name':
      return mult * a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
    case 'purchasePrice':
      return mult * (a.purchasePrice - b.purchasePrice);
    case 'noi':
      return mult * (a.noi - b.noi);
    case 'capRate':
      return mult * (a.capRate - b.capRate);
    default:
      return 0;
  }
}

/** Presentational table only; container supplies rows and filtering. */
@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgClass,
    CapRatePercentPipe,
    HighlightPipe,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './deal-list.component.html',
  styleUrl: './deal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealListComponent {
  readonly deals = input<Deal[]>([]);

  /** When true (e.g. admin), show a Delete control alongside Edit. */
  readonly showDelete = input(false);

  /** Substring highlight in the Name column (e.g. deals page search). */
  readonly nameSearchQuery = input('');

  /** Shown when `deals` is empty (title + optional hint). */
  readonly emptyTitle = input('No deals found');
  readonly emptyHint = input('');

  readonly editDeal = output<Deal>();
  readonly deleteDeal = output<Deal>();

  readonly displayedColumns: readonly string[] = ['name', 'purchasePrice', 'noi', 'capRate', 'actions'];

  private readonly sortState = signal<Sort>({ active: '', direction: '' });

  /** Rows sorted by the active column (Material `matSort`); default order follows parent `deals` input. */
  readonly sortedDeals = computed(() => {
    const rows = [...this.deals()];
    const { active, direction } = this.sortState();
    if (!active || (direction !== 'asc' && direction !== 'desc')) {
      return rows;
    }
    rows.sort((a, b) => compareDeals(a, b, active, direction));
    return rows;
  });

  readonly currencyCode = DEAL_CURRENCY_FORMAT;
  readonly currencyDigits = DEAL_CURRENCY_DIGITS_INFO;

  /**
   * Visual band for cap rate: 5%–12% (inclusive) = typical; outside = warn.
   * Uses fractional cap rate from the model (NOI ÷ price).
   */
  onSortChange(sort: Sort): void {
    this.sortState.set(sort);
  }

  capRateBand(deal: Deal): 'typical' | 'warn' {
    const r = deal.capRate;
    if (!Number.isFinite(r)) {
      return 'warn';
    }
    const pct = r * 100;
    if (pct >= 5 && pct <= 12) {
      return 'typical';
    }
    return 'warn';
  }
}
