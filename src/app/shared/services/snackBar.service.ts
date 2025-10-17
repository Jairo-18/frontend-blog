import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../components/custom-snackbar.component';

@Injectable({ providedIn: 'root' })
export class SnackBarService {
  private _snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 4000) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  private show(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number) {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      data: { message, type },
    });
  }
}
