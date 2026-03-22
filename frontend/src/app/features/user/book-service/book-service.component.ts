import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService, SupplierService, VehicleService } from '../../../core/services/api.service';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <a routerLink="/user/suppliers" class="back-link">← Back to Suppliers</a>
        <h1>Book Service</h1>
        <p>Schedule a service appointment</p>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()" class="booking-layout">
        <!-- Supplier Info -->
        <div class="card supplier-info-card">
          <div class="card-body">
            <div class="supplier-avatar-lg">{{ supplier()?.businessName?.charAt(0) }}</div>
            <h2>{{ supplier()?.businessName }}</h2>
            <p class="supplier-loc">📍 {{ supplier()?.address?.city }}, {{ supplier()?.address?.state }}</p>
            <p class="supplier-phone">📞 {{ supplier()?.phone }}</p>
            <div class="hours-block" *ngIf="supplier()?.operatingHours">
              🕒 {{ supplier()?.operatingHours?.open }} – {{ supplier()?.operatingHours?.close }}
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <div class="card booking-form-card">
          <div class="card-header"><h3>Booking Details</h3></div>
          <div class="card-body">
            <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>
            <div *ngIf="success()" class="alert alert-success">{{ success() }}</div>

            <!-- Select Vehicle -->
            <div class="form-group">
              <label class="form-label">Select Vehicle *</label>
              <select class="form-control" [(ngModel)]="form.vehicleId">
                <option value="">-- Choose a vehicle --</option>
                <option *ngFor="let v of vehicles()" [value]="v._id">
                  {{ v.make }} {{ v.model }} ({{ v.year }}) - {{ v.licensePlate }}
                </option>
              </select>
              <div *ngIf="vehicles().length === 0" class="form-error">
                No vehicles found. <a routerLink="/user/vehicles">Add a vehicle first</a>.
              </div>
            </div>

            <!-- Select Services -->
            <div class="form-group">
              <label class="form-label">Select Services *</label>
              <div class="services-list">
                <div *ngFor="let sv of supplier()?.services" class="service-item" [class.selected]="isSelected(sv)" (click)="toggleService(sv)">
                  <div class="service-check">{{ isSelected(sv) ? '✅' : '☐' }}</div>
                  <div class="service-details">
                    <div class="service-name">{{ sv.name }}</div>
                    <div class="service-desc" *ngIf="sv.description">{{ sv.description }}</div>
                    <div class="service-duration" *ngIf="sv.duration">⏱ {{ sv.duration }}</div>
                  </div>
                  <div class="service-price">₹{{ sv.price }}</div>
                </div>
                <div *ngIf="!supplier()?.services?.length" class="form-error">No services listed by this supplier.</div>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" class="form-control" [(ngModel)]="form.scheduledDate" [min]="minDate" />
              </div>
              <div class="form-group">
                <label class="form-label">Preferred Time *</label>
                <select class="form-control" [(ngModel)]="form.scheduledTime">
                  <option value="">-- Select time --</option>
                  <option *ngFor="let t of timeSlots" [value]="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">Additional Notes</label>
              <textarea class="form-control" [(ngModel)]="form.notes" rows="3" placeholder="Describe your issue or special requirements..."></textarea>
            </div>

            <!-- Total -->
            <div class="total-bar" *ngIf="selectedServices.length > 0">
              <span>Total Amount:</span>
              <span class="total-amount">₹{{ totalAmount }}</span>
            </div>

            <button class="btn btn-primary btn-lg w-full" (click)="submitBooking()" [disabled]="saving()">
              <span *ngIf="saving()" class="spinner"></span>
              {{ saving() ? 'Creating Booking...' : 'Confirm Booking' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link { font-size: 0.85rem; color: var(--text-muted); text-decoration: none; display: block; margin-bottom: 8px; &:hover { color: var(--primary); } }
    .booking-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
    .supplier-info-card .card-body { text-align: center; }
    .supplier-avatar-lg { width: 72px; height: 72px; border-radius: 20px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; font-family: 'Syne', sans-serif; margin: 0 auto 16px; }
    .supplier-info-card h2 { font-size: 1.1rem; margin-bottom: 8px; }
    .supplier-loc, .supplier-phone { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
    .hours-block { font-size: 0.85rem; color: var(--text-muted); margin-top: 8px; }
    .services-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; padding: 4px; }
    .service-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: var(--radius); border: 2px solid var(--border); cursor: pointer; transition: var(--transition); &:hover { border-color: var(--primary); background: rgba(255,77,0,0.03); } &.selected { border-color: var(--primary); background: rgba(255,77,0,0.06); } }
    .service-check { font-size: 1.1rem; flex-shrink: 0; }
    .service-details { flex: 1; }
    .service-name { font-weight: 600; font-size: 0.9rem; }
    .service-desc { font-size: 0.8rem; color: var(--text-muted); }
    .service-duration { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .service-price { font-weight: 700; font-family: 'Syne', sans-serif; color: var(--primary); white-space: nowrap; }
    .total-bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--bg); border-radius: var(--radius); margin-bottom: 16px; font-weight: 600; }
    .total-amount { font-family: 'Syne', sans-serif; font-size: 1.3rem; color: var(--primary); }
    .w-full { width: 100%; justify-content: center; }
    @media (max-width: 768px) { .booking-layout { grid-template-columns: 1fr; } }
  `]
})
export class BookServiceComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');
  supplier = signal<any>(null);
  vehicles = signal<any[]>([]);
  selectedServices: any[] = [];

  form = { vehicleId: '', scheduledDate: '', scheduledTime: '', notes: '' };
  minDate = new Date().toISOString().split('T')[0];
  timeSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

  get totalAmount() { return this.selectedServices.reduce((sum, sv) => sum + sv.price, 0); }

  constructor(private route: ActivatedRoute, private router: Router, private supplierService: SupplierService, private vehicleService: VehicleService, private bookingService: BookingService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('supplierId')!;
    this.supplierService.getSupplierById(id).subscribe({
      next: (res) => { this.supplier.set(res.data.supplier); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Supplier not found.'); }
    });
    this.vehicleService.getMyVehicles().subscribe({ next: (res) => this.vehicles.set(res.data.vehicles || []), error: () => {} });
  }

  isSelected(sv: any) { return this.selectedServices.some(s => s._id === sv._id); }

  toggleService(sv: any) {
    if (this.isSelected(sv)) this.selectedServices = this.selectedServices.filter(s => s._id !== sv._id);
    else this.selectedServices.push(sv);
  }

  submitBooking() {
    if (!this.form.vehicleId) { this.error.set('Please select a vehicle.'); return; }
    if (!this.selectedServices.length) { this.error.set('Please select at least one service.'); return; }
    if (!this.form.scheduledDate) { this.error.set('Please select a date.'); return; }
    if (!this.form.scheduledTime) { this.error.set('Please select a time.'); return; }

    this.saving.set(true); this.error.set('');
    const payload = { vehicleId: this.form.vehicleId, supplierId: this.supplier()._id, services: this.selectedServices.map(s => ({ name: s.name, price: s.price, description: s.description })), scheduledDate: this.form.scheduledDate, scheduledTime: this.form.scheduledTime, notes: this.form.notes };

    this.bookingService.createBooking(payload).subscribe({
      next: () => { this.saving.set(false); this.success.set('Booking created successfully! You will be notified once confirmed.'); setTimeout(() => this.router.navigate(['/user/bookings']), 2000); },
      error: (err) => { this.saving.set(false); this.error.set(err.error?.message || 'Booking failed. Please try again.'); }
    });
  }
}
