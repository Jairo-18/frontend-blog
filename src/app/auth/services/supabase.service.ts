import { Injectable, inject } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { supabase } from '../../supabaseClient';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly supabase: SupabaseClient = supabase;
  private readonly currentUser = new BehaviorSubject<User | null>(null);
  private readonly isInitialized = new BehaviorSubject<boolean>(false);

  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private authInitialized: boolean = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession();

      if (error) {
        console.error('Error obteniendo sesión inicial:', error);
      } else {
        this.currentUser.next(session?.user ?? null);
      }

      this.supabase.auth.onAuthStateChange(async (event, session) => {
        this.currentUser.next(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          const pendingUserData = localStorage.getItem('pendingUserData');
          if (pendingUserData) {
            try {
              const userData = JSON.parse(pendingUserData);
              const { user } = session;

              const { error: upsertError } = await this.supabase.from('profile').upsert({
                id: user.id,
                fullName: userData.fullName,
                country: userData.country,
                phone: userData.phone,
                created_at: new Date(),
              });

              if (upsertError) {
                console.error('❌ Error al crear perfil tras confirmar correo:', upsertError);
              } else {
                this._snackBarService.success('Tu perfil ha sido creado correctamente');
              }

              localStorage.removeItem('pendingUserData');
            } catch (err) {
              console.error('Error procesando pendingUserData:', err);
            }
          }
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          this.markAsInitialized();
        }
      });

      setTimeout(() => {
        this.markAsInitialized();
      }, 2000);
    } catch (error) {
      console.error('❌ Error inicializando auth:', error);
      this.markAsInitialized();
    }
  }

  private markAsInitialized() {
    if (!this.authInitialized) {
      this.authInitialized = true;
      this.isInitialized.next(true);
    }
  }

  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUser.value;
  }

  get isInitialized$(): Observable<boolean> {
    return this.isInitialized.asObservable();
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }

  async getCurrentSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  async waitForAuthReady(): Promise<boolean> {
    if (this.authInitialized) {
      return true;
    }

    return new Promise((resolve) => {
      const subscription = this.isInitialized$.subscribe((initialized) => {
        if (initialized) {
          subscription.unsubscribe();
          resolve(true);
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve(false);
      }, 1000);
    });
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
      username?: string;
      country?: string;
      phone?: string;
      bibliography?: string;
    }
  ) {
    const { data, error } = await this.supabase
      .from('profile')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }

    return data;
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Error en signOut:', error);
        throw error;
      }

      localStorage.clear();
      sessionStorage.clear();

      console.log('✅ SignOut completado');
    } catch (error) {
      console.error('❌ Error deslogeando:', error);
      throw error;
    }
  }
}
