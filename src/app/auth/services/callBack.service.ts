import { inject, Injectable } from '@angular/core';
import { supabase } from '../../supabaseClient';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthCallbackService {
  private readonly _tokenService: TokenService = inject(TokenService);
  private readonly _router: Router = inject(Router);

  async handleCallback() {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) throw error;
      if (!data.session || !data.user) throw new Error('No se pudo obtener sesión.');

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      const { data: userProfile, error: profileError } = await supabase
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
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      this._tokenService.saveSession(
        data.session.access_token,
        data.session.refresh_token,
        userProfile
      );

      await this._router.navigateByUrl('/');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('❌ Error en handleCallback:', err);
      alert('Error al confirmar tu cuenta. Intenta iniciar sesión nuevamente.');
      await this._router.navigateByUrl('/auth/login');
    }
  }
}
