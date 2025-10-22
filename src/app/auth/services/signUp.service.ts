import { inject, Injectable } from '@angular/core';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _tokenService: TokenService = inject(TokenService);
  private readonly _supabaseClient = inject(SupabaseClient);

  private async getUserWithRole(userId: string) {
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

  async signUp(
    email: string,
    password: string,
    pendingUserData: { fullName: string; country: string; phone: string; email: string }
  ) {
    try {
      const { data: existingProfile, error: fetchError } = await this._supabaseClient
        .from('profile')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116')
        throw new Error('Error al verificar el correo.');

      if (existingProfile) throw new Error('Este correo ya está registrado.');

      const { data, error } = await this._supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: pendingUserData,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo crear el usuario.');

      const { error: profileError } = await this._supabaseClient.from('profile').insert({
        id: data.user.id,
        email: data.user.email,
        fullName: pendingUserData.fullName,
        country: pendingUserData.country,
        phone: pendingUserData.phone,
        roleTypeId: 'ee3609d2-da86-4e9e-84a5-fb8814b17031',
        created_at: new Date().toISOString(),
      });

      if (profileError) throw new Error('Error al crear el perfil.');

      if (data.session) {
        const userWithRole = await this.getUserWithRole(data.user.id);

        this._tokenService.saveSession(
          data.session.access_token,
          data.session.refresh_token,
          userWithRole
        );

        this._snackBarService.success('¡Registro exitoso!');
      } else {
        this._snackBarService.info(
          'Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.'
        );
      }

      return { ...data, requiresEmailConfirmation: !data.session };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('❌ Error completo en signUp:', err);
      this._snackBarService.error(err.message || 'Error desconocido al registrarse.');
      throw err;
    }
  }
}
