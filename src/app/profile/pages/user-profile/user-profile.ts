import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { Profile } from '../../interfaces/profile.interface';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
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
      this.profile = await this._supabaseService.getCurrentUserProfile();
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      this.loading = false;
    }
  }
}
