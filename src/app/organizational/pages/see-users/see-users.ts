import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAdminService } from '../../services/userAdmin.service';
import { Profile } from '../../../profile/interfaces/profile.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './see-users.html',
})
export class SeeUsers implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'country', 'phone', 'created_at'];
  users: Profile[] = [];
  loading: boolean = true;

  constructor(private userAdminService: UserAdminService, private ngZone: NgZone) {}

  ngOnInit() {
    setTimeout(async () => {
      try {
        const { data } = await this.userAdminService.getUsers();
        this.ngZone.run(() => {
          this.users = data || [];
          this.loading = false;
        });
      } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        this.ngZone.run(() => (this.loading = false));
      }
    }, 5000);
  }
}
