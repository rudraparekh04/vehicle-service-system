import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>My Bookings</h1><p>Track and manage your service appointments</p></div>

      <!-- Filter -->
      <div class="filter-bar">
        <button *ngFor="let s of statuses" class="filter-btn" [class.active]="activeStatus === s.value" (click)="filterBy(s.value)">
          {{ s.label }}
        </button>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading() && bookings().length === 0" class="empty-state card card-body">
        <div class="empty-icon">📋</div>
        <h3>No bookings found</h3>
        <p>{{ activeStatus ? 'No ' + activeStatus + ' bookings' : 'You have not made any bookings yet' }}</p>
      </div>

      <div class="bookings-list" *ngIf="!loading()">
        <div *ngFor="let b of bookings()" class="booking-card card">
          <div class="booking-card-header">
            <div>
              <div class="booking-number">#{{ b.bookingNumber }}</div>
              <div class="booking-date">Scheduled: {{ b.scheduledDate | date:'longDate' }} at {{ b.scheduledTime }}</div>
            </div>
            <span class="badge" [ngClass]="getStatusClass(b.status)">{{ b.status | titlecase }}</span>
          </div>
          <div class="booking-card-body">
            <div class="booking-detail-grid">
              <div class="detail-item">
                <div class="detail-label">Vehicle</div>
                <div class="detail-value">{{ b.vehicle?.make }} {{ b.vehicle?.model }} ({{ b.vehicle?.year }})</div>
                <div class="detail-sub">{{ b.vehicle?.licensePlate }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Service Center</div>
                <div class="detail-value">{{ b.supplier?.businessName }}</div>
                <div class="detail-sub">{{ b.supplier?.address?.city }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Services</div>
                <div class="detail-value">{{ getServiceNames(b.services) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Total Amount</div>
                <div class="detail-value price">₹{{ b.totalAmount }}</div>
              </div>
            </div>
            <div class="supplier-note" *ngIf="b.supplierNote">
              💬 Supplier note: {{ b.supplierNote }}
            </div>
          </div>
          <div class="booking-card-footer">
            <button *ngIf="canCancel(b.status)" class="btn btn-danger btn-sm" (click)="cancelBooking(b._id)">Cancel</button>
            <div *ngIf="b.status === 'completed' && !b.rating?.score" class="rate-section">
              <span class="rate-label">Rate this service:</span>
              <div class="stars">
                <span *ngFor="let i of [1,2,3,4,5]" class="star clickable" [class.filled]="hoverRating[b._id] >= i || b.rating?.score >= i" (mouseenter)="hoverRating[b._id] = i" (mouseleave)="hoverRating[b._id] = 0" (click)="rateBooking(b._id, i)">★</span>
              </div>
            </div>
            <div *ngIf="b.rating?.score" class="rated-badge">⭐ Rated {{ b.rating.score }}/5</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .filter-btn { padding: 7px 16px; border-radius: 99px; border: 2px solid var(--border); background: var(--surface); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--transition); color: var(--text-secondary); &:hover, &.active { border-color: var(--primary); color: var(--primary); background: rgba(255,77,0,0.06); } }
    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card { overflow: hidden; }
    .booking-card-header { padding: 16px 20px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid var(--border); background: var(--bg); }
    .booking-number { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; }
    .booking-date { font-size: 0.8rem; color: var(--text-muted); }
    .booking-card-body { padding: 16px 20px; }
    .booking-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .detail-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 4px; }
    .detail-value { font-size: 0.9rem; font-weight: 600; &.price { color: var(--primary); font-family: 'Syne', sans-serif; font-size: 1rem; } }
    .detail-sub { font-size: 0.75rem; color: var(--text-muted); }
    .supplier-note { margin-top: 12px; padding: 10px 12px; background: var(--bg); border-radius: var(--radius); font-size: 0.85rem; color: var(--text-secondary); border-left: 3px solid var(--info); }
    .booking-card-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
    .rate-section { display: flex; align-items: center; gap: 8px; }
    .rate-label { font-size: 0.8rem; color: var(--text-secondary); }
    .stars { display: flex; gap: 2px; }
    .star { font-size: 1.2rem; color: #ddd; cursor: default; &.filled { color: var(--accent); } &.clickable { cursor: pointer; transition: color 0.15s; } }
    .rated-badge { font-size: 0.85rem; color: var(--warning); font-weight: 600; }
    @media (max-width: 768px) { .booking-detail-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .booking-detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class BookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  loading = signal(true);
  activeStatus = '';
  hoverRating: Record<string, number> = {};

  statuses = [
    { label: 'All', value: '' }, { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' }, { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }
  ];

  constructor(private bookingService: BookingService) {}
  ngOnInit() { this.loadBookings(); }

  loadBookings() {
    this.loading.set(true);
    this.bookingService.getMyBookings({ status: this.activeStatus, limit: 50 }).subscribe({
      next: (res) => { this.loading.set(false); this.bookings.set(res.data.bookings || []); },
      error: () => { this.loading.set(false); }
    });
  }

  filterBy(status: string) { this.activeStatus = status; this.loadBookings(); }

  cancelBooking(id: string) {
    if (!confirm('Cancel this booking?')) return;
    this.bookingService.cancelBooking(id).subscribe({ next: () => this.loadBookings(), error: () => {} });
  }

  rateBooking(id: string, score: number) {
    this.bookingService.rateBooking(id, { score }).subscribe({ next: () => this.loadBookings(), error: () => {} });
  }

  canCancel(status: string) { return ['pending', 'confirmed'].includes(status); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-secondary', rejected: 'badge-danger' };
    return map[status] || 'badge-secondary';
  }

  getServiceNames(services: any[]): string {
    if (!services?.length) return 'N/A';
    return services.map(s => s.name).join(', ');
  }
}
