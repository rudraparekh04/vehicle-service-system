import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-supplier-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar supplier-sidebar">
        <div class="sidebar-header">
          <div class="logo">🔧 <span>AutoServe</span></div>
          <div class="user-badge supplier">Supplier Panel</div>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/supplier/dashboard" routerLinkActive="active" class="nav-item"><span class="nav-icon">📊</span><span>Dashboard</span></a>
          <a routerLink="/supplier/profile" routerLinkActive="active" class="nav-item"><span class="nav-icon">🏪</span><span>Business Profile</span></a>
          <a routerLink="/supplier/services" routerLinkActive="active" class="nav-item"><span class="nav-icon">🛠️</span><span>Manage Services</span></a>
          <a routerLink="/supplier/bookings" routerLinkActive="active" class="nav-item"><span class="nav-icon">📅</span><span>Bookings</span></a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar" style="background:#22c55e">{{ initial }}</div>
            <div><p class="user-name">{{ user()?.name }}</p><p class="user-role">Service Supplier</p></div>
          </div>
          <button class="logout-btn" (click)="logout()">⎋ Logout</button>
        </div>
      </aside>
      <main class="main-content"><router-outlet></router-outlet></main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background: #0d1f0d; color: white; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
    .sidebar-header { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .logo { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; span { color: #4ade80; } }
    .user-badge { font-size: 0.7rem; padding: 3px 10px; border-radius: 99px; display: inline-block; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; &.supplier { background: rgba(34,197,94,0.2); color: #4ade80; } }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius); color: rgba(255,255,255,0.6); font-size: 0.9rem; font-weight: 500; transition: var(--transition); text-decoration: none; &:hover { background: rgba(255,255,255,0.06); color: white; } &.active { background: #22c55e; color: white; } .nav-icon { font-size: 1.1rem; } }
    .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); }
    .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .user-avatar { width: 36px; height: 36px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
    .user-name { font-size: 0.85rem; font-weight: 600; color: white; line-height: 1.2; }
    .user-role { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
    .logout-btn { width: 100%; padding: 10px; border-radius: var(--radius); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: 500; transition: var(--transition); cursor: pointer; border: none; &:hover { background: rgba(239,68,68,0.2); color: #ef4444; } }
    .main-content { flex: 1; padding: 32px; overflow-y: auto; min-width: 0; }
    @media (max-width: 768px) { .sidebar { display: none; } .main-content { padding: 20px 16px; } }
  `]
})
export class SupplierLayoutComponent {
  user = this.authService.currentUser;
  get initial() { return this.user()?.name?.charAt(0)?.toUpperCase() || 'S'; }
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); }
}
