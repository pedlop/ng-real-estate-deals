import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { AuthDialogService } from '@core/auth/services/auth-dialog.service';

/**
 * Route entry for `/login`: opens the login modal once, then returns the user to deals.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit {
  private readonly authDialog = inject(AuthDialogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authDialog
      .openLoginDialog()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.router.navigateByUrl('/deals'));
  }
}
