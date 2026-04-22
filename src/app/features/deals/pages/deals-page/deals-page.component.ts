import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { combineLatest, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs';

import { DealListFiltersComponent } from '../../components/deal-list-filters/deal-list-filters.component';
import { DealListComponent } from '../../components/deal-list/deal-list.component';
import { DealDialogService } from '../../services/deal-dialog.service';
import { DealService } from '../../services/deal.service';
import { Deal } from '@models/deal.model';
import { SnackbarFeedbackService } from '@shared/services/snackbar-feedback.service';
import { filterDeals } from '@shared/utils/filter-deals/filter-deals';
import { parsePriceFilterValue } from '@shared/utils/parse-price-filter-value';

export interface DealsListVm {
  rows: Deal[];
  emptyTitle: string;
  emptyHint: string;
  /** Raw search box value for name highlighting in the list. */
  searchQuery: string;
}

@Component({
  selector: 'app-deals-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    DealListFiltersComponent,
    DealListComponent,
  ],
  templateUrl: './deals-page.component.html',
  styleUrl: './deals-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealsPageComponent {
  private readonly fb = inject<FormBuilder>(FormBuilder);
  private readonly dealService = inject<DealService>(DealService);
  private readonly dealDialog = inject<DealDialogService>(DealDialogService);
  private readonly snackbar = inject<SnackbarFeedbackService>(SnackbarFeedbackService);
  private readonly destroyRef = inject<DestroyRef>(DestroyRef);

  /** Filter UI state (works with `NgxMaskDirective` on price fields). */
  readonly filterForm = this.fb.group({
    search: this.fb.nonNullable.control(''),
    minPrice: this.fb.control<number | string | null>(null),
    maxPrice: this.fb.control<number | string | null>(null),
  });

  /** Enables "Reset Filters" when any criterion matches the same rules as `filterDeals` / `listVm$`. */
  readonly hasActiveFilters = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.getRawValue()),
      map(() => this.computeHasActiveFilters()),
    ),
    { initialValue: this.computeHasActiveFilters() },
  );

  /**
   * Normalized criteria: `parsePriceFilterValue` strips mask formatting so filters use real numbers.
   */
  private readonly filterCriteria$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.getRawValue()),
    map(() => ({
      search: this.filterForm.controls.search.value ?? '',
      minPrice: parsePriceFilterValue(this.filterForm.controls.minPrice.value),
      maxPrice: parsePriceFilterValue(this.filterForm.controls.maxPrice.value),
    })),
    distinctUntilChanged(
      (a, b) =>
        a.search === b.search && a.minPrice === b.minPrice && a.maxPrice === b.maxPrice,
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly search$ = this.filterCriteria$.pipe(
    map((c) => c.search),
    distinctUntilChanged(),
  );
  readonly minPrice$ = this.filterCriteria$.pipe(
    map((c) => c.minPrice),
    distinctUntilChanged(),
  );
  readonly maxPrice$ = this.filterCriteria$.pipe(
    map((c) => c.maxPrice),
    distinctUntilChanged(),
  );

  readonly deals$ = this.dealService.getDeals();

  readonly filteredDeals$ = combineLatest([this.deals$, this.filterCriteria$]).pipe(
    map(([deals, f]) => filterDeals(deals, f.search, f.minPrice, f.maxPrice)),
  );

  readonly listVm$ = combineLatest({
    allDeals: this.deals$,
    filtered: this.filteredDeals$,
    criteria: this.filterCriteria$,
  }).pipe(
    map(({ allDeals, filtered, criteria }): DealsListVm => {
      const rows = filtered;
      const q = criteria.search.trim();
      const hasAnyFilter =
        q.length > 0 || criteria.minPrice != null || criteria.maxPrice != null;
      if (rows.length > 0) {
        return { rows, emptyTitle: '', emptyHint: '', searchQuery: criteria.search };
      }
      if (allDeals.length === 0) {
        return {
          rows: [],
          emptyTitle: 'No deals yet',
          emptyHint: 'Sign in and use Add Deal in the toolbar to create your first deal.',
          searchQuery: criteria.search,
        };
      }
      return {
        rows: [],
        emptyTitle: 'No deals found',
        emptyHint: hasAnyFilter
          ? 'Try a different search, adjust the price range, or clear filters.'
          : 'Try adjusting your filters.',
        searchQuery: criteria.search,
      };
    }),
  );

  /**
   * Clears all filters. Price fields use `''` so ngx-mask clears the display; `parsePriceFilterValue` still maps to `null` for filtering.
   * `filterCriteria$` (and `search$` / `minPrice$` / `maxPrice$`) update from `valueChanges`.
   */
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      minPrice: '',
      maxPrice: '',
    });
  }

  private computeHasActiveFilters(): boolean {
    const v = this.filterForm.getRawValue();
    const q = (v.search ?? '').trim();
    return (
      q.length > 0 ||
      parsePriceFilterValue(v.minPrice) != null ||
      parsePriceFilterValue(v.maxPrice) != null
    );
  }

  onEditDeal(deal: Deal): void {
    this.dealDialog
      .openEditWhenReady(deal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result?.id) {
          return;
        }
        this.dealService.updateDeal(
          new Deal(result.id, result.name, result.purchasePrice, result.address, result.noi),
        );
        this.snackbar.success('Deal updated');
      });
  }
}
