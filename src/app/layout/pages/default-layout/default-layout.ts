import { RouterOutlet } from '@angular/router';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { Subscription } from 'rxjs';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [RouterOutlet, NavBar, MatSpinner],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.scss',
})
// default-layout.component.ts
export class DefaultLayout implements OnInit, OnDestroy {
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private sub?: Subscription;
  private initSub?: Subscription;

  isReady = false;
  isLoggedIn = false;
  isInitializing = true;

  async ngOnInit() {
    this.initSub = this._supabaseService.isInitialized$.subscribe(async (initialized) => {
      if (initialized) {
        try {
          const session = await this._supabaseService.getSession();
          this.isLoggedIn = !!session.data.session;

          this.sub = this._supabaseService.user$.subscribe((user) => {
            this.isLoggedIn = !!user;
          });

          setTimeout(() => {
            this.isReady = true;
            this.isInitializing = false;
          }, 2000);
        } catch (error) {
          console.error('Error al obtener sesión:', error);
          this.isReady = true;
          this.isInitializing = false;
        }
      }
    });

    setTimeout(() => {
      if (this.isInitializing) {
        this.isReady = true;
        this.isInitializing = false;
      }
    }, 2000);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.initSub?.unsubscribe();
  }
}
