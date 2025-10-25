import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MoviesContent } from '../movies-content/movies-content';
import { BooksContent } from '../books-content/books-content';

@Component({
  selector: 'app-card-tabs',
  standalone: true,
  imports: [MatIconModule, MatTabsModule, MoviesContent, BooksContent],
  templateUrl: './card-tabs.html',
  styleUrl: './card-tabs.scss',
})
export class CardTabs {}
