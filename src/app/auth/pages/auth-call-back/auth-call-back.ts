import { MatSpinner } from '@angular/material/progress-spinner';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthCallbackService } from '../../services/callBack.service';

@Component({
  selector: 'app-auth-call-back',
  standalone: true,
  imports: [MatSpinner],
  templateUrl: './auth-call-back.html',
  styleUrl: './auth-call-back.scss',
})
export class AuthCallBack implements OnInit {
  private readonly _authCallbackService = inject(AuthCallbackService);
  private readonly _router = inject(Router);
  private readonly _platformId = inject(PLATFORM_ID);

  async ngOnInit() {
    if (!isPlatformBrowser(this._platformId)) return;

    console.log('🔄 Procesando confirmación de email...');
    try {
      await this._authCallbackService.handleCallback();
    } catch (error) {
      console.error('❌ Error durante el callback:', error);
      await this._router.navigate(['/auth/login']);
    }
  }
}
