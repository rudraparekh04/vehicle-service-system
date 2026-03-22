import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>All Bookings</h1><p>Platform-wide booking oversight</p></div>

      <!-- Filters -->
      <div class="filter-row card card-body" style="margin-bottom:20px">
        <select class="form-control" [(ngModel)]="statusFilter" style="width:180px" (change)="load()">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <button class="btn btn-ghost" (click)="clearFilters()">Clear</button>
        <span class="total-count">Total: <strong>{{ totalCount }}</strong></span>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()" class="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Booking #</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bookings()">
              <td>
                <div class="booking-num">#{{ b.bookingNumber }}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">{{ b.createdAt | date:'shortDate' }}</div>
              </td>
              <td>
                <div style="font-weight:600;font-size:0.9rem">{{ b.user?.name }}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">{{ b.user?.email }}</div>
              </td>
              <td>
                <div style="font-size:0.85rem;font-weight:600">{{ b.vehicle?.make }} {{ b.vehicle?.model }}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">{{ b.vehicle?.licensePlate }}</div>
              </td>
              <td>
                <div style="font-size:0.85rem;font-weight:600">{{ b.supplier?.businessName }}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">{{ b.supplier?.email }}</div>
              </td>
              <td>
                <div style="font-size:0.85rem">{{ b.scheduledDate | date:'mediumDate' }}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">{{ b.scheduledTime }}</div>
              </td>
              <td>
                <div style="font-weight:700;font-family:'Syne',sans-serif;color:var(--primary)">₹{{ b.totalAmount }}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">{{ b.paymentStatus | titlecase }}</div>
              </td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(b.status)">{{ b.status | titlecase }}</span>
              </td>
            </tr>
            <tr *ngIf="bookings().length === 0">
              <td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No bookings found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="btn btn-ghost btn-sm" [disabled]="page === 1" (click)="changePage(page - 1)">← Prev</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button class="btn btn-ghost btn-sm" [disabled]="page === totalPages" (click)="changePage(page + 1)">Next →</button>
      </div>
    </div>
  `,
  styles: [`
    .filter-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .total-count { margin-left: auto; font-size: 0.9rem; color: var(--text-secondary); }
    .booking-num { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); }
  `]
})
export class AdminBookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  loading = signal(true);
  statusFilter = '';
  page = 1;
  totalPages = 1;
  totalCount = 0;

  constructor(private adminService: AdminService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getBookings({ status: this.statusFilter, page: this.page, limit: 15 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.bookings.set(res.data.bookings || []);
        this.totalPages = res.data.pagination?.pages || 1;
        this.totalCount = res.data.pagination?.total || 0;
      },
      error: () => { this.loading.set(false); }
    });
  }

  clearFilters() { this.statusFilter = ''; this.page = 1; this.load(); }
  changePage(p: number) { this.page = p; this.load(); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning', confirmed: 'badge-info',
      in_progress: 'badge-primary', completed: 'badge-success',
      cancelled: 'badge-secondary', rejected: 'badge-danger'
    };
    return map[status] || 'badge-secondary';
  }
}
