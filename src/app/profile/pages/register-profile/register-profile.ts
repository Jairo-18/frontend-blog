import { Component, inject, OnInit } from '@angular/core';
import { AuthCard } from '../../../auth/components/auth-card/auth-card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { map, Observable, startWith, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Country } from '../../../auth/interfaces/country.interface';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-register-profile',
  standalone: true,
  imports: [
    AuthCard,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './register-profile.html',
  styleUrl: './register-profile.scss',
})
export class RegisterProfile implements OnInit {
  complementInfo: FormGroup;
  filteredCountries: Observable<string[]> = new Observable();
  countries: string[] = [];
  isSubmitting: boolean = false;

  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private readonly _profileService: ProfileService = inject(ProfileService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  constructor() {
    this.complementInfo = this._fb.group({
      fullName: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      username: [''],
      bibliography: [''],
      roleTypeId: ['ee3609d2-da86-4e9e-84a5-fb8814b17031'],
    });
  }

  ngOnInit() {
    this._http
      .get<Country[]>('https://restcountries.com/v3.1/all?fields=name')
      .pipe(
        map((res) => res.map((c) => c.name.common).sort()),
        take(1)
      )
      .subscribe((countries) => {
        this.countries = countries;
        this.filteredCountries = this.complementInfo.get('country')!.valueChanges.pipe(
          startWith(''),
          map((value) => this._filterCountries(value || ''))
        );
      });
  }

  private _filterCountries(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter((option) => option.toLowerCase().includes(filterValue));
  }

  async registerProfile() {
    if (this.complementInfo.invalid) {
      this.complementInfo.markAllAsTouched();
      this._snackBarService.error('Por favor completa todos los campos correctamente');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      const user = this._supabaseService.currentUserValue;

      if (!user) {
        this._snackBarService.error('No se encontró usuario autenticado');
        this._router.navigate(['/auth/login']);
        return;
      }

      const profileData = {
        username: this.complementInfo.get('username')?.value,
        fullName: this.complementInfo.get('fullName')?.value,
        country: this.complementInfo.get('country')?.value,
        phone: this.complementInfo.get('phone')?.value,
        bibliography: this.complementInfo.get('bibliography')?.value,
        roleTypeId: this.complementInfo.get('roleTypeId')?.value,
      };

      await this._profileService.updateProfile(user.id, profileData);

      this._snackBarService.success('¡Perfil completado exitosamente!');
      this._router.navigate(['/profile/user-profile']);
    } catch (error) {
      console.error('Error guardando perfil:', error);
      this._snackBarService.error('Error al guardar el perfil. Inténtalo de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
