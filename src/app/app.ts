import { Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnDestroy {
  private _iconRegistry = inject(MatIconRegistry);
  private readonly _router = inject(Router);
  private _routerSubscription!: Subscription;
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this._setMaterialOutlinedIconsDefault();
    this._listenRouterChanges();
  }

  /** Usa el set de íconos Material clásicos */
  private _setMaterialOutlinedIconsDefault(): void {
    this._iconRegistry.setDefaultFontSetClass('material-icons');
  }

  /** Escucha los cambios de ruta para resetear el scroll */
  private _listenRouterChanges(): void {
    this._routerSubscription = this._router.events.subscribe((event): void => {
      if (event instanceof NavigationEnd) {
        this._setScrollOnTop();
      }
    });
  }

  /** Mueve el scroll al inicio de la página */
  private _setScrollOnTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this._routerSubscription.unsubscribe();
  }
}
