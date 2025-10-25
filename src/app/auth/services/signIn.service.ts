/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { UserWithRoleInterface } from '../interfaces/session.interface';

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _tokenService: TokenService = inject(TokenService);
  private readonly _supabaseClient = inject(SupabaseClient);
  private readonly _router: Router = inject(Router);

  private async getUserWithRole(userId: string) {
    const response = await this._supabaseClient
      .from('profile')
      .select(
        `
        id,
        roleTypeId,
        roleType:roleType!fk_profile_roletype (
          id,
          code,
          name
        )
      `
      )
      .eq('id', userId)
      .single();

    return response.data as UserWithRoleInterface;
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this._supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials'))
          throw new Error('Correo o contraseña incorrectos.');
        throw new Error('Error al iniciar sesión.');
      }

      if (!data.session || !data.user) throw new Error('No se pudo iniciar sesión correctamente.');

      const userWithRole = await this.getUserWithRole(data.user.id);
      this._tokenService.saveSession(
        data.session.access_token,
        data.session.refresh_token,
        userWithRole
      );

      const { data: profile } = await this._supabaseClient
        .from('profile')
        .select('fullName, country, phone')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile?.fullName || !profile?.country || !profile?.phone) {
        this._router.navigate(['/profile/register-profile']);
        this._snackBarService.info('Completa tu perfil antes de continuar.');
      } else {
        this._router.navigate(['/']);
        this._snackBarService.success('¡Bienvenido de nuevo!');
      }

      return { ...data, userWithRole };
    } catch (error: any) {
      console.error('❌ Error en signIn:', error);
      this._snackBarService.error(error.message || 'Error iniciando sesión.');
      throw error;
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this._supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: '/auth/callback',
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
          const { data: sessionData } = await this._supabaseClient.auth.getSession();

          if (sessionData.session) {
            clearInterval(check);
            popup?.close();

            const { user, access_token, refresh_token } = {
              user: sessionData.session.user,
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
            };

            const userWithRole = await this.getUserWithRole(user.id);

            this._tokenService.saveSession(access_token, refresh_token, userWithRole);

            const { data: profile } = await this._supabaseClient
              .from('profile')
              .select('fullName, country, phone')
              .eq('id', user.id)
              .maybeSingle();

            if (!profile?.fullName || !profile?.country || !profile?.phone) {
              this._router.navigate(['/profile/register-profile']);
              this._snackBarService.info('Completa tu perfil antes de continuar.');
            } else {
              this._router.navigate(['/']);
              this._snackBarService.success('¡Bienvenido de nuevo!');
            }

            resolve(sessionData.session);
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(check);
          popup?.close();
          reject(new Error('Timeout esperando autenticación'));
        }, 60000);
      });
    } catch (error: any) {
      console.error('❌ Error en signInWithGoogle:', error);
      this._snackBarService.error('Error al iniciar sesión con Google.');
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this._supabaseClient.auth.signOut();
      if (error) throw error;

      this._tokenService.clearSession();
      this._router.navigate(['/auth/login']);
      this._snackBarService.success('Sesión cerrada correctamente.');
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
      this._snackBarService.error('Error al cerrar sesión.');
      throw error;
    }
  }
}
