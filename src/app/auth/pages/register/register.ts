import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthCard } from '../../components/auth-card/auth-card';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatStepperModule,
    AuthCard,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  // Formularios separados para cada step
  personalInfoForm: FormGroup;
  accountInfoForm: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;

  private readonly _fb: FormBuilder = inject(FormBuilder);

  constructor() {
    this.personalInfoForm = this._fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    });

    this.accountInfoForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  register() {
    if (this.personalInfoForm.valid && this.accountInfoForm.valid) {
      const registerData = {
        ...this.personalInfoForm.value,
        ...this.accountInfoForm.value,
      };
      console.log('Registro completo:', registerData);
    }
  }
}
