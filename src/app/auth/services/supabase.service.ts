import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  private readonly _router: Router = inject(Router);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private authInitialized = false;

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

  async signUp(
    email: string,
    password: string,
    pendingUserData: { fullName: string; country: string; phone: string; email: string }
  ) {
    try {
      const { data: existingProfile, error: fetchError } = await this.supabase
        .from('profile')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Error al verificar el correo. Inténtalo de nuevo.');
      }

      if (existingProfile) {
        this._snackBarService.success('Este correo ya está registrado.');
        throw new Error('Este correo ya está registrado.');
      }

      const { data, error } = await this.supabase.auth.signUp({ email, password });

      if (error) {
        if (
          error.message.includes('User already registered') ||
          error.message.includes('already been registered')
        ) {
          this._snackBarService.success('Este correo ya está registrado.');
          throw new Error('Este correo ya está registrado.');
        }
        throw new Error('No se pudo completar el registro. Inténtalo de nuevo más tarde.');
      }

      const user = data.user;
      if (!user) throw new Error('No se pudo crear el usuario. Inténtalo de nuevo.');

      const { error: insertError } = await this.supabase.from('profile').insert({
        id: user.id,
        fullName: pendingUserData.fullName,
        email: pendingUserData.email,
        country: pendingUserData.country,
        phone: pendingUserData.phone,
        created_at: new Date(),
      });

      if (insertError) {
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          this._snackBarService.success('Este correo ya está registrado.');
          throw new Error('Este correo ya está registrado.');
        }
        throw new Error('Error al guardar tu información de perfil.');
      }

      this._snackBarService.success(
        'Te has registrado correctamente. Revisa tu correo para activar tu cuenta.'
      );
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al registrarse.';
      this._snackBarService.error(message);
      throw err;
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        const { data: profile } = await this.supabase
          .from('profile')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (profile) {
          throw new Error(
            'Este correo fue registrado con Google. Por favor, inicia sesión usando el botón de Google.'
          );
        }
        this._snackBarService.error('Correo o contraseña incorrectos.');
        throw new Error('Correo o contraseña incorrectos.');
      }

      throw new Error('Error al iniciar sesión. Inténtalo de nuevo más tarde.');
    }

    if (!data.session || !data.user) {
      this._snackBarService.error(
        'No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.'
      );
      throw new Error('No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.');
    }

    const { data: profile } = await this.supabase
      .from('profile')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      this._router.navigate(['/user/profile']);
      this._snackBarService.info('Por favor completa tu perfil para continuar.');
    }

    return data;
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

    return new Promise((resolve, reject) => {
      const check = setInterval(async () => {
        const { data: sessionData } = await this.supabase.auth.getSession();

        if (sessionData.session) {
          clearInterval(check);
          popup?.close();

          const user = sessionData.session.user;
          const email = user.email;

          const { data: existingProfile, error: profileError } = await this.supabase
            .from('profile')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error buscando perfil:', profileError);
            reject(profileError);
            return;
          }

          if (existingProfile && existingProfile.id !== user.id) {
            await this.supabase.auth.signOut();
            this._snackBarService.error(
              'Este correo ya está registrado con email y contraseña. Usa ese método para iniciar sesión.'
            );
            reject(new Error('Email ya registrado con otro método'));
            return;
          }

          if (existingProfile && existingProfile.id === user.id) {
            this._router.navigate(['/']);
            this._snackBarService.success('¡Bienvenido de nuevo!');
            resolve(sessionData.session);
            return;
          }

          const { full_name } = user.user_metadata;
          const { error: insertError } = await this.supabase.from('profile').insert({
            id: user.id,
            email,
            fullName: full_name || '',
            created_at: new Date(),
          });

          if (insertError) {
            console.error('Error creando perfil OAuth:', insertError);

            if (insertError.code === '23505') {
              await this.supabase.auth.signOut();
              this._snackBarService.error(
                'Este correo ya está registrado. Inicia sesión con tu método original.'
              );
              reject(new Error('Email duplicado'));
              return;
            }
          }

          this._router.navigate(['/user/profile']);
          this._snackBarService.info('Completa tu perfil antes de continuar');
          resolve(sessionData.session);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(check);
        popup?.close();
        reject(new Error('Timeout esperando autenticación'));
      }, 60000);
    });
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this._snackBarService.success('Sesión finalizada correctamente');
    if (error) throw error;
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
}
