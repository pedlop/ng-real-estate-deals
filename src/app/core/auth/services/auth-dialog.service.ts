import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, of } from 'rxjs';

import { LoginDialogComponent, LoginDialogResult } from '@auth/components/login-dialog/login-dialog.component';
import { AuthService } from './auth.service';

/**
 * Centralizes login modal flows: open login from the shell, or gate actions with `ensureAuthenticated`.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);

  /**
   * If already authenticated, emits `true`. Otherwise opens the login dialog and emits whether login succeeded.
   */
  ensureAuthenticated(): Observable<boolean> {
    if (this.auth.isAuthenticated()) {
      return of(true);
    }
    return this.openLoginDialogInternal();
  }

  /**
   * Opens the login modal (e.g. header "Login"). If already signed in, emits `true` without opening.
   */
  openLoginDialog(): Observable<boolean> {
    if (this.auth.isAuthenticated()) {
      return of(true);
    }
    return this.openLoginDialogInternal();
  }

  private openLoginDialogInternal(): Observable<boolean> {
    const ref = this.dialog.open<LoginDialogComponent, void, LoginDialogResult>(LoginDialogComponent, {
      width: 'min(420px, 92vw)',
      autoFocus: true,
    });
    return ref.afterClosed().pipe(map((r) => r?.success === true));
  }
}
