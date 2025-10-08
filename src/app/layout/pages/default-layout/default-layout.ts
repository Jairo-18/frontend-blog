import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { NavBar } from '../../components/nav-bar/nav-bar';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [RouterOutlet, NavBar],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.scss',
})
export class DefaultLayout {}
