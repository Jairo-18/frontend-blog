import { MatButtonModule } from '@angular/material/button';
import { Component, inject, OnInit } from '@angular/core';
import { MENU_CARD_CONSTANTS } from '../../constants/home-card.constans';
import { HomeCard } from '../../components/home-card/home-card';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, HomeCard, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private sub?: Subscription;

  isReady = false;
  menuCards = MENU_CARD_CONSTANTS;
  isLoggedIn = false;

  ngOnInit() {
    this.sub = this._supabaseService.user$
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe((user) => {
        this.isReady = true;
        this.isLoggedIn = !!user;
      });
  }
}
