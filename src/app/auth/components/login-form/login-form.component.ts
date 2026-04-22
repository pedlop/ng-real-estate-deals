import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface LoginCredentials {
  username: string;
  password: string;
}

const USERNAME_MAX = 128;
const PASSWORD_MAX = 128;

/** Presentational login form; emits credentials on valid submit. */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly pending = input<boolean>(false);
  readonly submitLabel = input<string>('Sign in');
  readonly submitted = output<LoginCredentials>();

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(USERNAME_MAX)]],
    password: ['', [Validators.required, Validators.maxLength(PASSWORD_MAX)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
