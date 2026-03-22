import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-split">
        <!-- Left Panel -->
        <div class="auth-brand">
          <div class="brand-content">
            <div class="logo-mark">🔧</div>
            <h1>AutoServe<br><span>Pro</span></h1>
            <p>Your complete vehicle service management platform. Book, track, and manage all your vehicle maintenance needs.</p>
            <div class="feature-list">
              <div class="feature-item">✓ Book service appointments instantly</div>
              <div class="feature-item">✓ Track your vehicle history</div>
              <div class="feature-item">✓ Verified service suppliers</div>
              <div class="feature-item">✓ Real-time booking updates</div>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="auth-form-panel">
          <div class="auth-form-wrap">
            <div class="auth-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-with-icon">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    autocomplete="current-password"
                  />
                  <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading()">
                <span *ngIf="loading()" class="spinner"></span>
                <span>{{ loading() ? 'Signing in...' : 'Sign In' }}</span>
              </button>
            </form>

            <div class="auth-divider"><span>or</span></div>

            <div class="auth-links">
              <p>Don't have an account? <a routerLink="/register">Create one</a></p>
              <p class="hint">Want to become a service supplier? Register as a user first, then apply.</p>
            </div>

            <div class="demo-accounts">
              <p class="demo-title">Demo Accounts</p>
              <div class="demo-btns">
                <button class="demo-btn" (click)="fillDemo('user')">👤 User</button>
                <button class="demo-btn" (click)="fillDemo('supplier')">🔧 Supplier</button>
                <button class="demo-btn" (click)="fillDemo('admin')">⚙️ Admin</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; }

    .auth-split { display: flex; width: 100%; }

    .auth-brand {
      flex: 1;
      background: var(--secondary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -100px; right: -100px;
        width: 400px; height: 400px;
        background: var(--primary);
        border-radius: 50%;
        opacity: 0.08;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -80px; left: -80px;
        width: 300px; height: 300px;
        background: var(--primary);
        border-radius: 50%;
        opacity: 0.06;
      }
    }

    .brand-content { position: relative; z-index: 1; max-width: 420px; }

    .logo-mark { font-size: 3rem; margin-bottom: 16px; }

    .brand-content h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 20px;
      span { color: var(--primary); }
    }

    .brand-content p {
      font-size: 1rem;
      color: rgba(255,255,255,0.6);
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .feature-list { display: flex; flex-direction: column; gap: 10px; }

    .feature-item {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .auth-form-panel {
      width: 480px;
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
    }

    .auth-form-wrap { width: 100%; max-width: 360px; }

    .auth-header {
      margin-bottom: 32px;
      h2 { font-size: 1.8rem; margin-bottom: 6px; }
      p { color: var(--text-secondary); font-size: 0.95rem; }
    }

    .input-with-icon { position: relative; }
    .input-with-icon .form-control { padding-right: 48px; }
    .toggle-pass {
      position: absolute;
      right: 14px; top: 50%;
      transform: translateY(-50%);
      background: none;
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.6;
      &:hover { opacity: 1; }
    }

    .w-full { width: 100%; justify-content: center; }

    .auth-divider {
      text-align: center;
      position: relative;
      margin: 24px 0;
      &::before {
        content: '';
        position: absolute;
        top: 50%; left: 0; right: 0;
        height: 1px;
        background: var(--border);
      }
      span {
        background: var(--surface);
        padding: 0 12px;
        position: relative;
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .auth-links {
      text-align: center;
      p { font-size: 0.9rem; color: var(--text-secondary); }
      a { color: var(--primary); font-weight: 600; }
      .hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 8px; }
    }

    .demo-accounts {
      margin-top: 24px;
      padding: 16px;
      background: var(--bg);
      border-radius: var(--radius);
    }

    .demo-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 10px;
      text-align: center;
    }

    .demo-btns { display: flex; gap: 8px; }

    .demo-btn {
      flex: 1;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    @media (max-width: 768px) {
      .auth-brand { display: none; }
      .auth-form-panel { width: 100%; padding: 32px 24px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService) {}

  fillDemo(role: string) {
    const demos: Record<string, { email: string; password: string }> = {
      user: { email: 'user@demo.com', password: 'password123' },
      supplier: { email: 'supplier@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' }
    };
    this.email = demos[role].email;
    this.password = demos[role].password;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.authService.redirectByRole();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}
