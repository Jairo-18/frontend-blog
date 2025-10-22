import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ProfileInterface } from '../../interfaces/profile.interface';
import { ProfileService } from '../../services/profile.service';
import { TokenService } from '../../../auth/services/token.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  profile = signal<ProfileInterface | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  private readonly _tokenService = inject(TokenService);
  private readonly _profileService = inject(ProfileService);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.errorMessage.set(null);

    const userId = this._tokenService.getUserId();

    if (!userId) {
      this.errorMessage.set('No hay sesión activa');
      this.profile.set(null);
      this.loading.set(false);
      return;
    }

    this._profileService.getProfile(userId).then(
      (profileData) => {
        if (!profileData) {
          this.errorMessage.set('Perfil no encontrado');
          this.profile.set(null);
        } else {
          this.profile.set(profileData);
        }
        this.loading.set(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => {
        this.errorMessage.set(error?.message || 'Error desconocido');
        this.profile.set(null);
        this.loading.set(false);
      }
    );
  }
}
