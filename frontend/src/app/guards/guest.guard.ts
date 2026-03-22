import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) return true;
  auth.redirectByRole();
  return false;
};
