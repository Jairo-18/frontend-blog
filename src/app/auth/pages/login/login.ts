import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AuthCard } from '../../components/auth-card/auth-card';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../shared/services/snackBar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    AuthCard,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  form: FormGroup;
  hidePassword = true;
  isLoading = false;
  isGoogleLoading = false;

  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private readonly _router: Router = inject(Router);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  constructor() {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.form.value;

    try {
      const loginResult = await this._supabaseService.signIn(email, password);
      const user = loginResult.user;

      const pendingUserData = localStorage.getItem('pendingUserData');
      if (pendingUserData) {
        const data = JSON.parse(pendingUserData);
        await this._supabaseService.insertUserData({
          id: user?.id ?? '',
          fullName: data.fullName,
          country: data.country,
          phone: data.phone,
          email: data.email,
          password: data.password,
        });
        localStorage.removeItem('pendingUserData');
      }
      setTimeout(() => {
        this._router.navigate(['/']);
        this._snackBarService.success('¡Bienvenido! Has iniciado sesión correctamente');
      }, 1000);
    } catch (error: unknown) {
      console.error('Error al iniciar sesión o guardar datos:', error);

      let message = 'Error al iniciar sesión. Intenta de nuevo.';

      if (error instanceof Error) {
        if (error.message.includes('Email not confirmed')) {
          message = 'Por favor confirma tu correo electrónico';
        } else {
          message = error.message;
        }
      }

      this._snackBarService.error(message);
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async loginWithGoogle() {
    try {
      this.isGoogleLoading = true;
      await this._supabaseService.signInWithGoogle();
    } catch (error: unknown) {
      console.error('Error en login con Google:', error);
      this._snackBarService.error('Error al iniciar sesión con Google');
    } finally {
      this.isGoogleLoading = false;
    }
  }
}
