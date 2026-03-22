import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const allowedRoles = route.data?.['roles'] as string[];
  if (!allowedRoles || auth.hasRole(allowedRoles)) return true;
  auth.redirectByRole();
  return false;
};
