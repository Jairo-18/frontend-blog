import { MatSpinner } from '@angular/material/progress-spinner';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  async ngOnInit() {
    try {
      await this._supabase.waitForAuthReady();

      setTimeout(async () => {
        const session = await this._supabase.getCurrentSession();

        if (session) {
          this._router.navigate(['/']);
        } else {
          this._router.navigate(['/auth/login']);
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Error en callback:', error);
      this._router.navigate(['/auth/login']);
    }
  }
}
