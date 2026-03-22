import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/api.service';

@Component({
  selector: 'app-register-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-supplier-page">
      <div class="container" style="max-width:720px;padding:40px 24px">
        <a routerLink="/user/dashboard" class="back-link">← Back to Dashboard</a>
        <div class="page-header"><h1>Become a Service Supplier</h1><p>Register your service center and start accepting bookings</p></div>

        <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>
        <div *ngIf="success()" class="alert alert-success">{{ success() }}</div>

        <div class="card">
          <div class="card-header"><h3>Business Details</h3></div>
          <div class="card-body">
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Business Name *</label><input type="text" class="form-control" [(ngModel)]="form.businessName" placeholder="AutoFix Garage" /></div>
              <div class="form-group">
                <label class="form-label">Business Type *</label>
                <select class="form-control" [(ngModel)]="form.businessType">
                  <option value="">Select type</option>
                  <option value="garage">Garage</option>
                  <option value="workshop">Workshop</option>
                  <option value="dealership">Dealership</option>
                  <option value="mobile_service">Mobile Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Business Email *</label><input type="email" class="form-control" [(ngModel)]="form.email" /></div>
              <div class="form-group"><label class="form-label">Business Phone *</label><input type="tel" class="form-control" [(ngModel)]="form.phone" /></div>
            </div>
            <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" [(ngModel)]="form.description" rows="3" placeholder="Briefly describe your services..."></textarea></div>
          </div>
        </div>

        <div class="card" style="margin-top:20px">
          <div class="card-header"><h3>Address</h3></div>
          <div class="card-body">
            <div class="grid-2">
              <div class="form-group" style="grid-column:span 2"><label class="form-label">Street Address *</label><input type="text" class="form-control" [(ngModel)]="form.address.street" /></div>
              <div class="form-group"><label class="form-label">City *</label><input type="text" class="form-control" [(ngModel)]="form.address.city" /></div>
              <div class="form-group"><label class="form-label">State *</label><input type="text" class="form-control" [(ngModel)]="form.address.state" /></div>
              <div class="form-group"><label class="form-label">Pincode *</label><input type="text" class="form-control" [(ngModel)]="form.address.pincode" /></div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:12px">
          <button class="btn btn-primary btn-lg" (click)="submit()" [disabled]="saving()">
            <span *ngIf="saving()" class="spinner"></span>
            {{ saving() ? 'Submitting...' : 'Submit Application' }}
          </button>
          <a routerLink="/user/dashboard" class="btn btn-ghost btn-lg">Cancel</a>
        </div>
      </div>
    </div>
  `,
  styles: [`.back-link { font-size: 0.85rem; color: var(--text-muted); text-decoration: none; display: block; margin-bottom: 20px; &:hover { color: var(--primary); } } .register-supplier-page { min-height: 100vh; background: var(--bg); } .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; } @media (max-width:600px) { .grid-2 { grid-template-columns: 1fr; } }`]
})
export class RegisterSupplierComponent {
  error = signal('');
  success = signal('');
  saving = signal(false);

  form = {
    businessName: '', businessType: '', email: '', phone: '', description: '',
    address: { street: '', city: '', state: '', pincode: '' }
  };

  constructor(private supplierService: SupplierService, private router: Router) {}

  submit() {
    if (!this.form.businessName || !this.form.businessType || !this.form.email || !this.form.phone || !this.form.address.street || !this.form.address.city || !this.form.address.state || !this.form.address.pincode) {
      this.error.set('Please fill in all required fields.'); return;
    }
    this.saving.set(true); this.error.set('');
    this.supplierService.registerSupplier(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Application submitted! Please log in again to access your supplier panel.');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => { this.saving.set(false); this.error.set(err.error?.message || 'Registration failed.'); }
    });
  }
}
