import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileInterface } from '../../interfaces/profile.interface';
import { TokenService } from '../../../auth/services/token.service';
import { ProfileService } from '../../services/profile.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-info-user',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './card-info-user.html',
  styleUrl: './card-info-user.scss',
})
export class CardInfoUser implements OnInit {
  profile = signal<ProfileInterface | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  editingField = signal<keyof ProfileInterface | null>(null);
  tempValue = signal<string>('');

  private readonly _tokenService = inject(TokenService);
  private readonly _profileService = inject(ProfileService);

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const userId = this._tokenService.getUserId();
      if (!userId) {
        throw new Error('No hay sesión activa');
      }

      const profileData = await this._profileService.getProfile(userId);
      if (!profileData) {
        throw new Error('Perfil no encontrado');
      }

      this.profile.set(profileData);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Error desconocido');
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  startEditing(field: keyof ProfileInterface): void {
    const currentProfile = this.profile();
    if (!currentProfile) return;

    const currentValue = String(currentProfile[field] ?? '');
    this.tempValue.set(currentValue);
    this.editingField.set(field);
  }

  async saveField(field: keyof ProfileInterface): Promise<void> {
    const userId = this.profile()?.id;
    if (!userId) return;

    const newValue = this.tempValue().trim();
    if (!newValue) {
      this.errorMessage.set('El campo no puede estar vacío');
      return;
    }

    const updateData = { [field]: newValue } as Partial<ProfileInterface>;

    try {
      const updated = await this._profileService.updateProfile(userId, updateData);
      this.profile.set(updated);
      this.editingField.set(null);
      this.errorMessage.set(null);
    } catch (error) {
      this.errorMessage.set(
        `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  cancelEditing(): void {
    this.editingField.set(null);
    this.tempValue.set('');
  }
}
