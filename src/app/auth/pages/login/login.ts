import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
