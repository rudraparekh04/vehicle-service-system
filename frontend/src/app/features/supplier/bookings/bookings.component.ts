import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../core/services/api.service';

@Component({
  selector: 'app-supplier-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>Booking Requests</h1><p>Accept, reject or manage customer bookings</p></div>

      <div class="filter-bar">
        <button *ngFor="let s of statuses" class="filter-btn" [class.active]="activeStatus === s.value" (click)="filterBy(s.value)">{{ s.label }}</button>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading() && bookings().length === 0" class="empty-state card card-body">
        <div class="empty-icon">📋</div>
        <h3>No bookings found</h3>
        <p>{{ activeStatus ? 'No ' + activeStatus + ' bookings' : 'No booking requests yet' }}</p>
      </div>

      <div class="bookings-list" *ngIf="!loading()">
        <div *ngFor="let b of bookings()" class="booking-card card">
          <div class="booking-card-header">
            <div>
              <div class="booking-number">#{{ b.bookingNumber }}</div>
              <div class="booking-meta">{{ b.scheduledDate | date:'longDate' }} at {{ b.scheduledTime }}</div>
            </div>
            <span class="badge" [ngClass]="getStatusClass(b.status)">{{ b.status | titlecase }}</span>
          </div>

          <div class="booking-body">
            <div class="booking-detail-grid">
              <div class="detail-block">
                <div class="detail-label">Customer</div>
                <div class="detail-value">{{ b.user?.name }}</div>
                <div class="detail-sub">{{ b.user?.email }}</div>
                <div class="detail-sub" *ngIf="b.user?.phone">{{ b.user?.phone }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Vehicle</div>
                <div class="detail-value">{{ b.vehicle?.make }} {{ b.vehicle?.model }}</div>
                <div class="detail-sub">{{ b.vehicle?.licensePlate }} • {{ b.vehicle?.year }}</div>
                <div class="detail-sub">{{ b.vehicle?.vehicleType | titlecase }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Services Requested</div>
                <div *ngFor="let sv of b.services" class="service-chip">{{ sv.name }} — ₹{{ sv.price }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Total</div>
                <div class="detail-value price">₹{{ b.totalAmount }}</div>
                <div class="detail-sub" *ngIf="b.notes">📝 {{ b.notes }}</div>
              </div>
            </div>

            <div *ngIf="b.supplierNote" class="supplier-note-display">Your note: {{ b.supplierNote }}</div>
          </div>

          <!-- Actions -->
          <div class="booking-footer" *ngIf="b.status !== 'cancelled'">
            <div class="action-group" *ngIf="b.status === 'pending'">
              <div class="note-input">
                <input type="text" class="form-control" [placeholder]="'Optional note for #' + b.bookingNumber" [(ngModel)]="notes[b._id]" style="font-size:0.85rem;padding:8px 12px" />
              </div>
              <button class="btn btn-success btn-sm" (click)="updateStatus(b._id, 'confirmed')">✅ Accept</button>
              <button class="btn btn-danger btn-sm" (click)="updateStatus(b._id, 'rejected')">❌ Reject</button>
            </div>
            <div class="action-group" *ngIf="b.status === 'confirmed'">
              <button class="btn btn-primary btn-sm" (click)="updateStatus(b._id, 'in_progress')">🔧 Mark In Progress</button>
            </div>
            <div class="action-group" *ngIf="b.status === 'in_progress'">
              <button class="btn btn-success btn-sm" (click)="updateStatus(b._id, 'completed')">🏁 Mark Completed</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .filter-btn { padding: 7px 16px; border-radius: 99px; border: 2px solid var(--border); background: var(--surface); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--transition); color: var(--text-secondary); &:hover, &.active { border-color: #22c55e; color: #16a34a; background: rgba(34,197,94,0.06); } }
    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card { overflow: hidden; }
    .booking-card-header { padding: 16px 20px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid var(--border); background: var(--bg); }
    .booking-number { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; }
    .booking-meta { font-size: 0.8rem; color: var(--text-muted); }
    .booking-body { padding: 16px 20px; }
    .booking-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .detail-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px; }
    .detail-value { font-size: 0.9rem; font-weight: 600; &.price { color: #22c55e; font-family: 'Syne', sans-serif; font-size: 1.1rem; } }
    .detail-sub { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
    .service-chip { font-size: 0.8rem; padding: 3px 0; color: var(--text-secondary); }
    .supplier-note-display { margin-top: 12px; padding: 10px 12px; background: rgba(34,197,94,0.08); border-radius: var(--radius); font-size: 0.85rem; color: #16a34a; border-left: 3px solid #22c55e; }
    .booking-footer { padding: 12px 20px; border-top: 1px solid var(--border); }
    .action-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .note-input { flex: 1; min-width: 200px; }
    @media (max-width: 768px) { .booking-detail-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class SupplierBookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  loading = signal(true);
  activeStatus = '';
  notes: Record<string, string> = {};

  statuses = [
    { label: 'All', value: '' }, { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' }, { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }, { label: 'Rejected', value: 'rejected' }
  ];

  constructor(private supplierService: SupplierService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.supplierService.getBookings({ status: this.activeStatus, limit: 50 }).subscribe({
      next: (res) => { this.loading.set(false); this.bookings.set(res.data.bookings || []); },
      error: () => { this.loading.set(false); }
    });
  }

  filterBy(status: string) { this.activeStatus = status; this.load(); }

  updateStatus(bookingId: string, status: string) {
    const msg = status === 'rejected' ? 'Reject this booking?' : `Mark as ${status}?`;
    if (!confirm(msg)) return;
    const payload: any = { status };
    if (this.notes[bookingId]) payload.supplierNote = this.notes[bookingId];
    this.supplierService.updateBookingStatus(bookingId, payload).subscribe({ next: () => this.load(), error: () => {} });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-secondary', rejected: 'badge-danger' };
    return map[status] || 'badge-secondary';
  }
}
