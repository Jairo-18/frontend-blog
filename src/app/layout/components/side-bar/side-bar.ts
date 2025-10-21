import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SideBarItem } from '../../interfaces/layout.interface';
import { SIDEBAR_ITEMS } from '../../constants/layout.constants';
import { RouterLink } from '@angular/router';
import { SignInService } from '../../../auth/services/signIn.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.scss'],
})
export class SideBar {
  @Input() closeSideBar: boolean = false;
  @Output() collapsed: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoggedIn: boolean = false;
  isCollapsed: boolean = true;
  openSubMenu: Record<string, boolean> = {};
  menuItems: SideBarItem[] = SIDEBAR_ITEMS;

  private readonly _singInService: SignInService = inject(SignInService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) this.closeAllSubMenus();
    this.collapsed.emit(this.isCollapsed);
  }

  toggleSubMenu(title: string): void {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.collapsed.emit(this.isCollapsed);
    }

    if (this.openSubMenu[title]) {
      this.openSubMenu[title] = false;
    } else {
      Object.keys(this.openSubMenu).forEach((key) => {
        this.openSubMenu[key] = false;
      });
      this.openSubMenu[title] = true;
    }
  }

  closeAllSubMenus(): void {
    this.openSubMenu = {};
  }

  async signOut() {
    try {
      await this._singInService.signOut();
      this.isLoggedIn = false;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this._snackBarService.error('Error al cerrar sesión');
    }
  }
}
