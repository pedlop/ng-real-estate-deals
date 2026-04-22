import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const SNACK_DURATION_MS = 4000;

@Injectable({
  providedIn: 'root',
})
export class SnackbarFeedbackService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: SNACK_DURATION_MS,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['app-snackbar-success'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: SNACK_DURATION_MS,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['app-snackbar-info'],
    });
  }
}
