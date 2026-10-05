import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

/** Blocks the administrator pages unless an administrator is logged in (FR-14). */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};

/** Attaches the administrator token to API calls and ends the session when the API rejects it. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();
  const isApiCall = request.url.startsWith(API_BASE_URL);
  const authorized =
    token && isApiCall ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginAttempt = request.url.endsWith('/auth/login');
      if (error.status === 401 && isApiCall && !isLoginAttempt) {
        auth.clear();
        router.navigate(['/admin/login'], { queryParams: { expired: 1 } });
      }
      return throwError(() => error);
    }),
  );
};
