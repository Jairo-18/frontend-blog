import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { MENU_CARD_CONSTANTS } from '../../constants/home-card.constans';
import { HomeCard } from '../../components/home-card/home-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, HomeCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  menuCards = MENU_CARD_CONSTANTS;
}
