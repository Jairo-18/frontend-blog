import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../auth/services/supabase.service';

export const authGuard = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.currentUserValue) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

export const noAuthGuard = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!supabase.currentUserValue) {
    return true;
  }

  return router.createUrlTree(['/']);
};
