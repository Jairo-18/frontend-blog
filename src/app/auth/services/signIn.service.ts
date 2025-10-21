import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SignInService {
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _supabaseClient: SupabaseClient = inject(SupabaseClient);
  private readonly _router: Router = inject(Router);

  async getUserWithRole(userId: string) {
    const { data, error } = await this._supabaseClient
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

    if (error) {
      console.error('❌ Error obteniendo usuario con rol:', error);
      throw error;
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this._supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        const { data: profile } = await this._supabaseClient
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
      this._snackBarService.error('No se pudo iniciar sesión. Inténtalo nuevamente.');
      throw new Error('No se pudo iniciar sesión. Inténtalo nuevamente.');
    }

    const userWithRole = await this.getUserWithRole(data.user.id);
    localStorage.setItem('userData', JSON.stringify(userWithRole));

    const { data: profile } = await this._supabaseClient
      .from('profile')
      .select('fullName, country, phone')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile?.fullName || !profile?.country || !profile?.phone) {
      this._router.navigate(['/profile/register-profile']);
      this._snackBarService.info('Por favor completa tu perfil antes de continuar.');
    } else {
      this._router.navigate(['/']);
      this._snackBarService.success('¡Bienvenido de nuevo!');
    }

    return { ...data, userWithRole };
  }

  async signInWithGoogle() {
    const { data, error } = await this._supabaseClient.auth.signInWithOAuth({
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
        const { data: sessionData } = await this._supabaseClient.auth.getSession();

        if (sessionData.session) {
          clearInterval(check);
          popup?.close();

          const user = sessionData.session.user;
          const email = user.email;
          const { full_name } = user.user_metadata;

          const { data: existingProfile, error: profileError } = await this._supabaseClient
            .from('profile')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error buscando perfil:', profileError);
            reject(profileError);
            return;
          }

          if (existingProfile) {
            if (!existingProfile.fullName && full_name) {
              const { error: updateError } = await this._supabaseClient
                .from('profile')
                .update({ fullName: full_name })
                .eq('id', user.id);
              if (updateError) console.error('Error actualizando perfil OAuth:', updateError);
            }

            const userWithRole = await this.getUserWithRole(user.id);
            localStorage.setItem('userData', JSON.stringify(userWithRole));

            if (existingProfile.fullName && existingProfile.country && existingProfile.phone) {
              this._router.navigate(['/']);
              this._snackBarService.success('¡Bienvenido de nuevo!');
            } else {
              this._router.navigate(['/profile/register-profile']);
              this._snackBarService.info('Completa tu perfil antes de continuar');
            }

            resolve(sessionData.session);
            return;
          }

          const { error: insertError } = await this._supabaseClient.from('profile').insert({
            id: user.id,
            email,
            fullName: full_name || '',
            created_at: new Date(),
          });

          if (insertError) {
            console.error('Error creando perfil OAuth:', insertError);
            reject(insertError);
            return;
          }

          const userWithRole = await this.getUserWithRole(user.id);
          localStorage.setItem('userData', JSON.stringify(userWithRole));

          this._router.navigate(['/profile/register-profile']);
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
    const { error } = await this._supabaseClient.auth.signOut();

    if (error) {
      this._snackBarService.error('Error al cerrar sesión');
      throw error;
    }

    localStorage.removeItem('userData');

    this._router.navigate(['/']);

    this._snackBarService.success('Sesión finalizada correctamente');
  }
}
