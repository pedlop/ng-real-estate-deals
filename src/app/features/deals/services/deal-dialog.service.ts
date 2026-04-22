import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, filter, switchMap, take } from 'rxjs';

import { AuthDialogService } from '@core/auth/services/auth-dialog.service';
import {
  DealFormDialogComponent,
  DealFormDialogData,
  DealFormResult,
} from '../components/deal-form-dialog/deal-form-dialog.component';
import { Deal } from '@models/deal.model';

/**
 * All create/edit deal modals that require a signed-in user.
 * The deals list route stays public; only these entry points enforce auth before showing a form.
 */
@Injectable({
  providedIn: 'root',
})
export class DealDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly authDialog = inject(AuthDialogService);

  /**
   * If already authenticated -> opens the create-deal modal immediately.
   * Otherwise opens the login modal first; on success, opens the create-deal modal.
   */
  openCreateWhenReady(): Observable<DealFormResult | undefined> {
    return this.afterAuth(() => this.openCreateModal());
  }

  /**
   * Same gating as create, then opens the edit form for the given deal.
   */
  openEditWhenReady(deal: Deal): Observable<DealFormResult | undefined> {
    return this.afterAuth(() => this.openEditModal(deal));
  }

  /** Shared: must be authenticated before `open` runs (login modal only when needed). */
  private afterAuth<T>(open: () => Observable<T>): Observable<T> {
    return this.authDialog.ensureAuthenticated().pipe(
      filter((ok): ok is true => ok),
      take(1),
      switchMap(open),
    );
  }

  private openCreateModal(): Observable<DealFormResult | undefined> {
    return this.dialog
      .open<DealFormDialogComponent, DealFormDialogData, DealFormResult>(DealFormDialogComponent, {
        width: 'min(440px, 92vw)',
        data: { mode: 'create' },
      })
      .afterClosed();
  }

  private openEditModal(deal: Deal): Observable<DealFormResult | undefined> {
    return this.dialog
      .open<DealFormDialogComponent, DealFormDialogData, DealFormResult>(DealFormDialogComponent, {
        width: 'min(440px, 92vw)',
        data: { mode: 'edit', deal },
      })
      .afterClosed();
  }
}
