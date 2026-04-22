import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';

import { DealListComponent } from '../../../deals/components/deal-list/deal-list.component';
import { DealDialogService } from '../../../deals/services/deal-dialog.service';
import { DealService } from '../../../deals/services/deal.service';
import { Deal } from '@models/deal.model';
import { SnackbarFeedbackService } from '@shared/services/snackbar-feedback.service';

/** Protected area: full deal management (guaranteed auth via `authGuard`). */
@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AsyncPipe, MatCardModule, DealListComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent {
  private readonly dealService = inject(DealService);
  private readonly dealDialog = inject(DealDialogService);
  private readonly snackbar = inject(SnackbarFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  readonly deals$ = this.dealService.getDeals();

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

  onDeleteDeal(deal: Deal): void {
    const ok = globalThis.confirm(`Delete deal "${deal.name}"? This cannot be undone.`);
    if (!ok) {
      return;
    }
    this.dealService.removeDeal(deal.id);
    this.snackbar.info('Deal removed');
  }
}
