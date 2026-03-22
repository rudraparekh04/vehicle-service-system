import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-split">
        <div class="auth-brand">
          <div class="brand-content">
            <div class="logo-mark">🚗</div>
            <h1>Join<br><span>AutoServe</span></h1>
            <p>Create your account and get started with premium vehicle servicing at your fingertips.</p>
            <div class="feature-list">
              <div class="feature-item">✓ Free account registration</div>
              <div class="feature-item">✓ Add multiple vehicles</div>
              <div class="feature-item">✓ Access 100+ service centers</div>
              <div class="feature-item">✓ Track service history</div>
            </div>
          </div>
        </div>

        <div class="auth-form-panel">
          <div class="auth-form-wrap">
            <div class="auth-header">
              <h2>Create Account</h2>
              <p>Fill in the details to get started</p>
            </div>

            <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>
            <div *ngIf="success()" class="alert alert-success">{{ success() }}</div>

            <form (ngSubmit)="onRegister()" #regForm="ngForm">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" [(ngModel)]="form.name" name="name" placeholder="John Doe" required />
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" [(ngModel)]="form.email" name="email" placeholder="you@example.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-control" [(ngModel)]="form.phone" name="phone" placeholder="+91 98765 43210" />
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-with-icon">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="form.password"
                    name="password"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading()">
                <span *ngIf="loading()" class="spinner"></span>
                {{ loading() ? 'Creating Account...' : 'Create Account' }}
              </button>
            </form>

            <div class="auth-divider"><span>already have an account?</span></div>
            <div class="auth-links">
              <a routerLink="/login" class="btn btn-outline btn-lg w-full">Sign In Instead</a>
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
      background: linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%);
      color: white;
      display: flex; align-items: center; justify-content: center;
      padding: 48px;
      position: relative; overflow: hidden;
      &::before {
        content: '';
        position: absolute; bottom: -100px; right: -100px;
        width: 400px; height: 400px;
        background: var(--primary); border-radius: 50%; opacity: 0.07;
      }
    }
    .brand-content { max-width: 420px; position: relative; z-index: 1; }
    .logo-mark { font-size: 3rem; margin-bottom: 16px; }
    .brand-content h1 { font-size: 3.5rem; font-weight: 800; line-height: 1; margin-bottom: 20px; span { color: var(--primary); } }
    .brand-content p { font-size: 1rem; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 32px; }
    .feature-list { display: flex; flex-direction: column; gap: 10px; }
    .feature-item { font-size: 0.9rem; color: rgba(255,255,255,0.8); }
    .auth-form-panel { width: 520px; background: var(--surface); display: flex; align-items: center; justify-content: center; padding: 48px 40px; overflow-y: auto; }
    .auth-form-wrap { width: 100%; max-width: 380px; }
    .auth-header { margin-bottom: 28px; h2 { font-size: 1.8rem; margin-bottom: 6px; } p { color: var(--text-secondary); font-size: 0.95rem; } }
    .input-with-icon { position: relative; }
    .input-with-icon .form-control { padding-right: 48px; }
    .toggle-pass { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; font-size: 1rem; cursor: pointer; opacity: 0.6; &:hover { opacity: 1; } }
    .w-full { width: 100%; justify-content: center; }
    .auth-divider { text-align: center; position: relative; margin: 20px 0; &::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border); } span { background: var(--surface); padding: 0 12px; position: relative; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; } }
    .auth-links { text-align: center; a { display: flex; } }
    @media (max-width: 768px) { .auth-brand { display: none; } .auth-form-panel { width: 100%; padding: 32px 24px; } }
  `]
})
export class RegisterComponent {
  form = { name: '', email: '', phone: '', password: '' };
  confirmPassword = '';
  showPassword = false;
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private authService: AuthService) {}

  onRegister() {
    this.error.set('');
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.error.set('Name, email and password are required.'); return;
    }
    if (this.form.password.length < 6) {
      this.error.set('Password must be at least 6 characters.'); return;
    }
    if (this.form.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.'); return;
    }
    this.loading.set(true);
    this.authService.register({ ...this.form, role: 'user' }).subscribe({
      next: () => { this.loading.set(false); this.authService.redirectByRole(); },
      error: (err) => { this.loading.set(false); this.error.set(err.error?.message || 'Registration failed.'); }
    });
  }
}
