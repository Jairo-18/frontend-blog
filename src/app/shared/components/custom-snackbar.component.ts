import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-snackbar" [ngClass]="data.type">
      {{ data.message }}
    </div>
  `,
  styles: [
    `
      .custom-snackbar {
        background-color: white;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        font-weight: 500;
      }
      .success {
        background-color: #4caf50;
      }
      .error {
        background-color: #f44336;
      }
      .info {
        background-color: #2196f3;
      }
      .warning {
        background-color: #ff9800;
      }
    `,
  ],
})
export class CustomSnackbarComponent {
  data = inject<{ message: string; type: string }>(MAT_SNACK_BAR_DATA);
}
