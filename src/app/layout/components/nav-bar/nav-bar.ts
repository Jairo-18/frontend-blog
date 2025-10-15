import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, MatMenuModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit, OnDestroy {
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private readonly _router: Router = inject(Router);
  private sub?: Subscription;
  isReady = false;
  isLoggedIn = false;

  ngOnInit() {
    this.sub = this._supabaseService.user$
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe((user) => {
        this.isReady = true;
        this.isLoggedIn = !!user;
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async signOut() {
    try {
      await this._supabaseService.signOut();
      this.isLoggedIn = false;
      await this._router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
