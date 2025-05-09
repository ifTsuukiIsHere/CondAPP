import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const rol = localStorage.getItem('rol');

  if (rol === 'admin') {
    return true;
  }

  // Si no es admin, redirige al home
  router.navigate(['/home']);
  return false;
};
