import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../auth/services/supabase.service';

export const noAuthGuard = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  await supabase.waitForAuthReady();
  const { data } = await supabase.getSession();

  if (!data.session) {
    return true;
  }

  return router.createUrlTree(['/']);
};
