import { Component } from '@angular/core';
import { AuthCard } from '../../components/auth-card/auth-card';

@Component({
  selector: 'app-send-email',
  standalone: true,
  imports: [AuthCard],
  templateUrl: './send-email.html',
  styleUrl: './send-email.scss',
})
export class SendEmail {}
