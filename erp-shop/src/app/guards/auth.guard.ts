import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../pages/login/services/login.service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  return loginService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
