import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SnackBarService } from '../../shared/services/snackBar.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  private isInitialized = new BehaviorSubject<boolean>(false);
  private authInitialized = false;
  private readonly _router: Router = inject(Router);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  constructor() {
    this.supabase = createClient(
      'https://tpaoqoubdoapmdigtewc.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYW9xb3ViZG9hcG1kaWd0ZXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjExMjcsImV4cCI6MjA3NjAzNzEyN30.2FA4BbyXVCVQ4kvuHsvlp4UjRtOScr5lOt9L_L175ZU'
    );

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
            const data = JSON.parse(pendingUserData);

            try {
              await this.insertUserData({
                id: session.user.id,
                fullName: data.fullName,
                country: data.country,
                phone: data.phone,
                email: data.email,
                password: data.password,
              });

              localStorage.removeItem('pendingUserData');
              console.log('Datos guardados automáticamente tras confirmar correo');
            } catch (err) {
              console.error('Error guardando datos después de confirmar correo:', err);
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

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  }

  async signUp(
    email: string,
    password: string,
    pendingUserData: { fullName: string; country: string; phone: string }
  ) {
    localStorage.setItem('pendingUserData', JSON.stringify({ ...pendingUserData, email }));

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    this._snackBarService.success('Te has registrado correctamente');
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this._snackBarService.success('Sesión finalizada correctamente');
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) throw error;
    return data;
  }

  async updatePassword(newPassword: string) {
    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    const popup = window.open(
      data?.url,
      'Login con Google',
      'width=500,height=600,scrollbars=no,resizable=no'
    );

    return new Promise((resolve) => {
      const check = setInterval(async () => {
        const { data: sessionData } = await this.supabase.auth.getSession();

        if (sessionData.session) {
          clearInterval(check);
          popup?.close();

          this._router.navigate(['/home']);
          this._snackBarService.success('¡Bienvenido! Has iniciado sesión correctamente');
          resolve(sessionData.session);
        }
      }, 1000);
    });
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

  async insertUserData(userData: {
    id: string;
    fullName: string;
    country: string;
    phone: string;
    email: string;
    password: string;
  }) {
    const { data, error } = await this.supabase.from('UserInfo').insert([userData]);
    if (error) throw error;
    return data;
  }
}
