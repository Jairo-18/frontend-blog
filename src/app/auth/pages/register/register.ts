import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {}
