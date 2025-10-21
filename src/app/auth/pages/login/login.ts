import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AuthCard } from '../../components/auth-card/auth-card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { SignInService } from '../../services/signIn.service';

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
  hidePassword: boolean = true;
  isLoading: boolean = false;
  isGoogleLoading: boolean = false;

  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _singInService: SignInService = inject(SignInService);
  private readonly _router: Router = inject(Router);
  private readonly _fb: FormBuilder = inject(FormBuilder);

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await this._singInService.signIn(email, password);
      this._snackBarService.success('¡Bienvenido!');
      this._router.navigate(['/home']);
    } catch (err) {
      this._snackBarService.error(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      );
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
      await this._singInService.signInWithGoogle();
    } catch (error: unknown) {
      console.error('Error en login con Google:', error);
      this._snackBarService.error('Error al iniciar sesión con Google');
    } finally {
      this.isGoogleLoading = false;
    }
  }
}
