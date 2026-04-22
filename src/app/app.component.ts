import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { take } from 'rxjs';

import { AuthDialogService } from '@core/auth/services/auth-dialog.service';
import { DealDialogService } from './features/deals/services/deal-dialog.service';
import { DealService } from './features/deals/services/deal.service';
import { Deal } from '@models/deal.model';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SnackbarFeedbackService } from '@shared/services/snackbar-feedback.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly authDialog = inject(AuthDialogService);
  private readonly dealDialog = inject(DealDialogService);
  private readonly dealService = inject(DealService);
  private readonly snackbar = inject(SnackbarFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  onLoginClicked(): void {
    this.authDialog
      .openLoginDialog()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Header "Add Deal": `DealDialogService.openCreateWhenReady()` runs `AuthDialogService.ensureAuthenticated()`
   * (login modal when needed), then opens the create form — no auth branching in the shell.
   */
  onAddDealClicked(): void {
    this.dealDialog
      .openCreateWhenReady()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.dealService.addDeal(
          new Deal(
            globalThis.crypto?.randomUUID?.() ?? `deal-${Date.now()}`,
            result.name,
            result.purchasePrice,
            result.address,
            result.noi,
          ),
        );
        this.snackbar.success('Deal added');
      });
  }
}
