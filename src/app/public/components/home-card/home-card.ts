import { Component, Input } from '@angular/core';
import { MenuCardInterface } from '../../interface/menu-card.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './home-card.html',
  styleUrl: './home-card.scss',
})
export class HomeCard {
  @Input() data!: MenuCardInterface;
}
