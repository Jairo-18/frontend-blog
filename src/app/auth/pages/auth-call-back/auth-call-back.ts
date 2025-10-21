import { MatSpinner } from '@angular/material/progress-spinner';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth-call-back',
  standalone: true,
  imports: [MatSpinner],
  templateUrl: './auth-call-back.html',
  styleUrl: './auth-call-back.scss',
})
export class AuthCallBack implements OnInit {
  private readonly _supabase: SupabaseService = inject(SupabaseService);
  private readonly _router: Router = inject(Router);
  private readonly _platformId = inject(PLATFORM_ID);

  async ngOnInit() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    try {
      console.log('🔄 Procesando confirmación de email...');

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const session = await this._supabase.getCurrentSession();

      if (session) {
        console.log('✅ Usuario confirmado y auto-logeado:', session.user.email);
        console.log('🚪 Deslogeando usuario para forzar login manual...');

        await this._supabase.signOut();

        localStorage.clear();
        sessionStorage.clear();

        console.log('✅ Deslogeo completado');
      } else {
        console.log('⚠️ No hay sesión activa');
      }
    } catch (error) {
      console.error('❌ Error en callback:', error);
    } finally {
      console.log('🚀 Redirigiendo a login...');
      await this._router.navigate(['/auth/login']);
    }
  }
}
