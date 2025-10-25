import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { BehaviorSubject } from 'rxjs';
import { ProfileInterface } from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly supabase: SupabaseClient = supabase;
  private readonly currentUser = new BehaviorSubject<ProfileInterface | null>(null);

  get currentUserValue(): ProfileInterface | null {
    return this.currentUser.value;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profile')
      .select('id, fullName, country, username, bibliography, phone, email, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }

    return data;
  }

  async getCurrentUserProfile() {
    const user = this.currentUserValue;
    if (!user) return null;

    return await this.getProfile(user.id);
  }

  async updateProfile(
    userId: string,
    profileData: {
      fullName?: string;
      username?: string;
      country?: string;
      phone?: string;
      bibliography?: string;
      roleTypeId?: string;
    }
  ) {
    const userEmail = (await this.supabase.auth.getSession()).data.session?.user.email || '';

    const userExist = await this.getProfile(userId);
    if (userExist) {
      const { data, error } = await this.supabase
        .from('profile')
        .update({ ...profileData, email: userEmail })
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        console.error('Error actualizando perfil:', error);
        throw error;
      }
      return data;
    } else {
      const { data } = await this.supabase
        .from('profile')
        .insert({ id: userId, email: userEmail, ...profileData })
        .select()
        .single();
      return data;
    }
  }
}
