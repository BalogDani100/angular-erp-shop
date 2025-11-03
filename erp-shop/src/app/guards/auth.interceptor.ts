import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) as { token?: string } : null;
    const token = user?.token;

    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(cloned);
    }
  } catch {
  }
  return next(req);
};
