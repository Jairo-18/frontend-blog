import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileInterface } from '../../interfaces/profile.interface';
import { TokenService } from '../../../auth/services/token.service';
import { ProfileService } from '../../services/profile.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SupabaseClient } from '@supabase/supabase-js';

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

  private readonly _profileService = inject(ProfileService);
  private readonly _tokenService: TokenService = inject(TokenService);
  private readonly _supabaseClient = inject(SupabaseClient);

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    try {
      this.loading.set(true);

      const {
        data: { session },
      } = await this._supabaseClient.auth.getSession();

      if (!session)
        throw new Error('No hay una sesión activa. Por favor, inicia sesión nuevamente.');

      const userId = session.user.id;

      const { data: profile, error: profileError } = await this._supabaseClient
        .from('profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No se encontró el perfil.');

      this.profile.set(profile);
    } catch (err: Error | unknown) {
      console.error('❌ Error cargando perfil:', err);
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error desconocido al cargar el perfil.'
      );
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
