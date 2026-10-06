import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Admin catalogue management — Admin role only. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/'], {
      queryParams: { denied: 'admin' },
    });
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: '/admin' },
  });
};
