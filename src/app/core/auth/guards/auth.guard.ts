import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** Functional guard; sync check via `AuthService.isAuthenticated()` with RxJS pipeline for router contract. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated$.pipe(
    take(1),
    tap((isAuth) => {
      if (!isAuth) {
        void router.navigateByUrl('/login');
      }
    }),
    map((isAuth) => isAuth),
  );
};
