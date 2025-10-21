import { Component, OnInit, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAdminService } from '../../services/userAdmin.service';
import { ProfileInterface } from '../../../profile/interfaces/profile.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './see-users.html',
})
export class SeeUsers implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'country', 'phone', 'created_at'];
  users: ProfileInterface[] = [];
  loading: boolean = true;

  private readonly _ngZone: NgZone = inject(NgZone);
  private readonly _userAdminService: UserAdminService = inject(UserAdminService);

  ngOnInit() {
    setTimeout(async () => {
      try {
        const { data } = await this._userAdminService.getUsers();
        this._ngZone.run(() => {
          this.users = data || [];
          this.loading = false;
        });
      } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        this._ngZone.run(() => (this.loading = false));
      }
    }, 5000);
  }
}
