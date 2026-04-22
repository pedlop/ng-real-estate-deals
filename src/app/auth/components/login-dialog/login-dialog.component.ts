import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { AuthService } from '@core/auth/services/auth.service';
import { SnackbarFeedbackService } from '@shared/services/snackbar-feedback.service';
import {
  LoginCredentials,
  LoginFormComponent,
} from '../login-form/login-form.component';

export interface LoginDialogResult {
  success: boolean;
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, LoginFormComponent],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(SnackbarFeedbackService);
  private readonly dialogRef = inject(MatDialogRef<LoginDialogComponent, LoginDialogResult>);

  readonly pending = signal(false);
  readonly loginFailed = signal(false);

  onSubmitted(credentials: LoginCredentials): void {
    this.pending.set(true);
    this.loginFailed.set(false);
    this.auth
      .login(credentials.username, credentials.password)
      .pipe(take(1))
      .subscribe((ok) => {
        this.pending.set(false);
        if (ok) {
          this.snackbar.success('Signed in successfully');
          this.dialogRef.close({ success: true });
        } else {
          this.loginFailed.set(true);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
