import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, MatMenuModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit, OnDestroy {
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
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
}
