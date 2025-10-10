import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, MatMenuModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {}
