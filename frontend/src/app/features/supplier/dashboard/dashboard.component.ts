import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/api.service';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h1>Supplier Dashboard</h1>
        <p>Manage your service center and bookings</p>
      </div>

      <!-- Status alert -->
      <div *ngIf="supplier()?.status === 'pending'" class="alert alert-warning">
        ⏳ Your supplier account is pending admin approval. You can set up your profile and services in the meantime.
      </div>
      <div *ngIf="supplier()?.status === 'rejected'" class="alert alert-danger">
        ❌ Your supplier application was rejected. Contact support for more information.
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()">
        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:28px">
          <div class="stat-card" style="border-left:4px solid var(--warning)">
            <div class="stat-value">{{ stats()?.pending || 0 }}</div>
            <div class="stat-label">Pending Bookings</div>
            <div class="stat-icon">⏳</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--info)">
            <div class="stat-value">{{ stats()?.confirmed || 0 }}</div>
            <div class="stat-label">Confirmed</div>
            <div class="stat-icon">✅</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--success)">
            <div class="stat-value">{{ stats()?.completed || 0 }}</div>
            <div class="stat-label">Completed</div>
            <div class="stat-icon">🏁</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--primary)">
            <div class="stat-value">₹{{ (stats()?.revenue || 0) | number }}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-icon">💰</div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Recent Bookings -->
          <div class="card">
            <div class="card-header">
              <h3 style="font-size:1rem">Recent Bookings</h3>
              <a routerLink="/supplier/bookings" class="btn btn-ghost btn-sm">View All</a>
            </div>
            <div class="card-body" style="padding:0">
              <div *ngIf="recentBookings().length === 0" class="empty-state" style="padding:32px">
                <div class="empty-icon">📋</div>
                <h3>No bookings yet</h3>
              </div>
              <div *ngFor="let b of recentBookings()" class="booking-row">
                <div>
                  <div class="booking-num">#{{ b.bookingNumber }}</div>
                  <div class="booking-customer">{{ b.user?.name }} • {{ b.vehicle?.make }} {{ b.vehicle?.model }}</div>
                  <div class="booking-date">{{ b.scheduledDate | date:'mediumDate' }}</div>
                </div>
                <span class="badge" [ngClass]="getStatusClass(b.status)">{{ b.status }}</span>
              </div>
            </div>
          </div>

          <!-- Supplier Info -->
          <div class="card">
            <div class="card-header">
              <h3 style="font-size:1rem">Business Info</h3>
              <a routerLink="/supplier/profile" class="btn btn-ghost btn-sm">Edit</a>
            </div>
            <div class="card-body" *ngIf="supplier()">
              <div class="info-row"><span>Business</span><strong>{{ supplier()?.businessName }}</strong></div>
              <div class="info-row"><span>Type</span><strong>{{ supplier()?.businessType | titlecase }}</strong></div>
              <div class="info-row"><span>Status</span><span class="badge" [ngClass]="getStatusClass(supplier()?.status)">{{ supplier()?.status }}</span></div>
              <div class="info-row"><span>Services</span><strong>{{ supplier()?.services?.length || 0 }} listed</strong></div>
              <div class="info-row" *ngIf="stats()?.rating?.count > 0">
                <span>Rating</span>
                <strong>⭐ {{ stats()?.rating?.average }}/5 ({{ stats()?.rating?.count }} reviews)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--border); &:first-child { border-top: none; } &:hover { background: var(--bg); } }
    .booking-num { font-size: 0.8rem; font-weight: 700; font-family: 'Syne', sans-serif; }
    .booking-customer { font-size: 0.85rem; color: var(--text-secondary); }
    .booking-date { font-size: 0.75rem; color: var(--text-muted); }
    .info-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; span:first-child { color: var(--text-muted); } &:last-child { border-bottom: none; } }
  `]
})
export class SupplierDashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<any>(null);
  recentBookings = signal<any[]>([]);
  supplier = signal<any>(null);

  constructor(private supplierService: SupplierService) {}

  ngOnInit() {
    this.supplierService.getDashboard().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.stats.set(res.data.stats);
        this.recentBookings.set(res.data.recentBookings || []);
        this.supplier.set(res.data.supplier);
      },
      error: () => { this.loading.set(false); }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-secondary', rejected: 'badge-danger', approved: 'badge-success', suspended: 'badge-danger' };
    return map[status] || 'badge-secondary';
  }
}
