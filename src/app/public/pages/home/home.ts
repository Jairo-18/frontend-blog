import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
