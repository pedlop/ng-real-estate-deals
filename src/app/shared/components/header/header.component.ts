import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '@core/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, NgIf, RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Toolbar title (e.g. "Deal Manager"). */
  readonly appTitle = input<string>('Deal Manager');

  readonly isAuthenticated$ = this.auth.isAuthenticated$;

  readonly addDealClicked = output<void>();
  readonly loginClicked = output<void>();

  onLogout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/deals');
  }
}
