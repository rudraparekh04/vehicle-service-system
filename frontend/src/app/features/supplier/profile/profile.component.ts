import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../core/services/api.service';

@Component({
  selector: 'app-supplier-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>Business Profile</h1><p>Manage your service center details</p></div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()">
        <div *ngIf="msg()" class="alert" [ngClass]="success() ? 'alert-success' : 'alert-danger'">{{ msg() }}</div>

        <div class="card">
          <div class="card-header"><h3>Business Information</h3></div>
          <div class="card-body">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Business Name *</label>
                <input type="text" class="form-control" [(ngModel)]="form.businessName" placeholder="AutoFix Garage" />
              </div>
              <div class="form-group">
                <label class="form-label">Business Type *</label>
                <select class="form-control" [(ngModel)]="form.businessType">
                  <option value="garage">Garage</option>
                  <option value="workshop">Workshop</option>
                  <option value="dealership">Dealership</option>
                  <option value="mobile_service">Mobile Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Business Email *</label>
                <input type="email" class="form-control" [(ngModel)]="form.email" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input type="tel" class="form-control" [(ngModel)]="form.phone" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" [(ngModel)]="form.description" rows="3" placeholder="Describe your services..."></textarea>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:20px">
          <div class="card-header"><h3>Location</h3></div>
          <div class="card-body">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Street Address *</label>
                <input type="text" class="form-control" [(ngModel)]="form.address.street" />
              </div>
              <div class="form-group">
                <label class="form-label">City *</label>
                <input type="text" class="form-control" [(ngModel)]="form.address.city" />
              </div>
              <div class="form-group">
                <label class="form-label">State *</label>
                <input type="text" class="form-control" [(ngModel)]="form.address.state" />
              </div>
              <div class="form-group">
                <label class="form-label">Pincode *</label>
                <input type="text" class="form-control" [(ngModel)]="form.address.pincode" />
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:20px">
          <div class="card-header"><h3>Operating Hours</h3></div>
          <div class="card-body">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Opening Time</label>
                <input type="time" class="form-control" [(ngModel)]="form.operatingHours.open" />
              </div>
              <div class="form-group">
                <label class="form-label">Closing Time</label>
                <input type="time" class="form-control" [(ngModel)]="form.operatingHours.close" />
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:12px">
          <button class="btn btn-primary btn-lg" (click)="save()" [disabled]="saving()">
            <span *ngIf="saving()" class="spinner"></span>
            {{ saving() ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SupplierProfileComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  msg = signal('');
  success = signal(false);

  form: any = {
    businessName: '', businessType: 'garage', email: '', phone: '', description: '',
    address: { street: '', city: '', state: '', pincode: '' },
    operatingHours: { open: '09:00', close: '18:00' }
  };

  constructor(private supplierService: SupplierService) {}

  ngOnInit() {
    this.supplierService.getProfile().subscribe({
      next: (res) => {
        this.loading.set(false);
        const s = res.data.supplier;
        this.form = {
          businessName: s.businessName, businessType: s.businessType,
          email: s.email, phone: s.phone, description: s.description || '',
          address: { ...s.address },
          operatingHours: { open: s.operatingHours?.open || '09:00', close: s.operatingHours?.close || '18:00' }
        };
      },
      error: () => { this.loading.set(false); }
    });
  }

  save() {
    this.saving.set(true); this.msg.set('');
    this.supplierService.updateProfile(this.form).subscribe({
      next: () => { this.saving.set(false); this.success.set(true); this.msg.set('Profile updated successfully!'); },
      error: (err) => { this.saving.set(false); this.success.set(false); this.msg.set(err.error?.message || 'Update failed.'); }
    });
  }
}
