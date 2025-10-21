import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthCard } from '../../components/auth-card/auth-card';
import { CustomValidationsService } from '../../../shared/validators/customValidations.service';
import { map, Observable, startWith, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Country } from '../../interfaces/country.interface';
import { UserInterface } from '../../interfaces/user.interface';
import { SignUpService } from '../../services/signUp.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';

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
    MatAutocompleteModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  personalInfoForm: FormGroup;
  accountInfoForm: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  countries: string[] = [];
  isLoading: boolean = false;
  filteredCountries: Observable<string[]> = new Observable();

  private readonly _passwordValidationService: CustomValidationsService =
    inject(CustomValidationsService);
  private readonly _singUpService: SignUpService = inject(SignUpService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _router: Router = inject(Router);
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _fb: FormBuilder = inject(FormBuilder);

  ngOnInit() {
    this._http
      .get<Country[]>('https://restcountries.com/v3.1/all?fields=name')
      .pipe(
        map((res) => res.map((c) => c.name.common).sort()),
        take(1)
      )
      .subscribe((countries) => {
        this.countries = countries;
        this.filteredCountries = this.personalInfoForm.get('country')!.valueChanges.pipe(
          startWith(''),
          map((value) => this._filterCountries(value || ''))
        );
      });
  }

  constructor() {
    this.personalInfoForm = this._fb.group({
      fullName: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    });

    this.accountInfoForm = this._fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this._passwordValidationService.passwordStrength()]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this._passwordValidationService.passwordsMatch('password', 'confirmPassword'),
      }
    );
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  private _filterCountries(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter((option) => option.toLowerCase().includes(filterValue));
  }

  async registerSupabase() {
    if (!this.personalInfoForm.valid || !this.accountInfoForm.valid) {
      this._snackBarService.error('Por favor completa todos los campos correctamente');
      this.personalInfoForm.markAllAsTouched();
      this.accountInfoForm.markAllAsTouched();
      return;
    }

    const data: UserInterface = {
      ...this.personalInfoForm.value,
      ...this.accountInfoForm.value,
    };

    try {
      this.isLoading = true;

      await this._singUpService.signUp(data.email, data.password, {
        fullName: data.fullName,
        email: data.email,
        country: data.country,
        phone: data.phone,
      });

      this._router.navigate(['/auth/send-email'], {
        state: { email: data.email },
      });
    } catch (error: unknown) {
      console.error('Error registrando usuario:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
