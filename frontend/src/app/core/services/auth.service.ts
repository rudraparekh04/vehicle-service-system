import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'supplier' | 'admin';
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { this.currentUser.set(JSON.parse(userData)); }
      catch { this.logout(); }
    }
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => { if (res.success) this.setSession(res.data); })
    );
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => { if (res.success) this.setSession(res.data); })
    );
  }

  private setSession(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUser();
  }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }

  getMe() {
    return this.http.get<any>(`${this.apiUrl}/auth/me`).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
        }
      })
    );
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/auth/update-profile`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
        }
      })
    );
  }

  changePassword(data: any) {
    return this.http.put<any>(`${this.apiUrl}/auth/change-password`, data);
  }

  redirectByRole() {
    const user = this.currentUser();
    if (!user) return;
    switch (user.role) {
      case 'admin': this.router.navigate(['/admin']); break;
      case 'supplier': this.router.navigate(['/supplier']); break;
      default: this.router.navigate(['/user']); break;
    }
  }
}
