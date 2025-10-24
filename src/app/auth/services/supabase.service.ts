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
          // 🔹 Guardar tokens de sesión
          if (session.access_token && session.refresh_token) {
            localStorage.setItem('access_token', session.access_token);
            localStorage.setItem('refresh_token', session.refresh_token);
          }

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

        // 🔹 Si el token se refresca, actualizamos también en localStorage
        if (event === 'TOKEN_REFRESHED' && session) {
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
        }

        // 🔹 Si el usuario cierra sesión, limpiamos
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
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

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Error en signOut:', error);
        throw error;
      }

      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('❌ Error deslogeando:', error);
      throw error;
    }
  }
}
