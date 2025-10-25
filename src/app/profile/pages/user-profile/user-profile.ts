import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInfoUser } from '../../components/card-info-user/card-info-user';
import { CardTabs } from '../../components/card-tabs/card-tabs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, CardInfoUser, CardTabs],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {}
