import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../services/supabase.service';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.scss',
})
export class AuthCard implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showIcons: boolean = true;
  @Input() subtitleWidth: string = '75%';

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
}
