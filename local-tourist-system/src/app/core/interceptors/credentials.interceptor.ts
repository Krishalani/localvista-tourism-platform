import { HttpInterceptorFn } from '@angular/common/http';

/** Send cookies on API calls (ASP.NET Identity cookie auth). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
