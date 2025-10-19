import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { Profile } from '../../interfaces/profile.interface';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  profile: Profile | null = null;
  loading = true;

  private readonly _supabaseService: SupabaseService = inject(SupabaseService);

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      this.loading = true;

      const authReady = await this._supabaseService.waitForAuthReady();

      if (!authReady) {
        console.warn('⚠️ Timeout esperando inicialización de auth');
        this.loading = false;
        return;
      }

      const currentUser = this._supabaseService.currentUserValue;

      if (!currentUser) {
        console.warn('⚠️ No hay usuario logueado');
        this.profile = null;
        this.loading = false;
        return;
      }

      this.profile = await this._supabaseService.getProfile(currentUser.id);

      if (!this.profile) {
        console.warn('❌ No se encontró perfil en la base de datos');
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      this.profile = null;
    } finally {
      this.loading = false;
    }
  }
}
