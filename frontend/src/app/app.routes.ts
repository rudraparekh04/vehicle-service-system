import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // User routes
  {
    path: 'user',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['user'] },
    loadComponent: () => import('./features/user/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/user/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'vehicles', loadComponent: () => import('./features/user/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'bookings', loadComponent: () => import('./features/user/bookings/bookings.component').then(m => m.BookingsComponent) },
      { path: 'suppliers', loadComponent: () => import('./features/user/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
      { path: 'book/:supplierId', loadComponent: () => import('./features/user/book-service/book-service.component').then(m => m.BookServiceComponent) },
      { path: 'profile', loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },

  // Supplier routes
  {
    path: 'supplier',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['supplier'] },
    loadComponent: () => import('./features/supplier/supplier-layout/supplier-layout.component').then(m => m.SupplierLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/supplier/dashboard/dashboard.component').then(m => m.SupplierDashboardComponent) },
      { path: 'profile', loadComponent: () => import('./features/supplier/profile/profile.component').then(m => m.SupplierProfileComponent) },
      { path: 'services', loadComponent: () => import('./features/supplier/services/services.component').then(m => m.ServicesComponent) },
      { path: 'bookings', loadComponent: () => import('./features/supplier/bookings/bookings.component').then(m => m.SupplierBookingsComponent) }
    ]
  },

  // Supplier registration (for logged-in users)
  {
    path: 'register-supplier',
    canActivate: [authGuard],
    loadComponent: () => import('./features/supplier/register/register-supplier.component').then(m => m.RegisterSupplierComponent)
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'suppliers', loadComponent: () => import('./features/admin/suppliers/suppliers.component').then(m => m.AdminSuppliersComponent) },
      { path: 'bookings', loadComponent: () => import('./features/admin/bookings/bookings.component').then(m => m.AdminBookingsComponent) }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
