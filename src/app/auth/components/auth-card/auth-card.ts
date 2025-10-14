import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.scss',
})
export class AuthCard {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showIcons: boolean = true;
  @Input() subtitleWidth: string = '75%';
}
