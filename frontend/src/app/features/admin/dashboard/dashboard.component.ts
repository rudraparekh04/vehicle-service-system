import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>Admin Dashboard</h1><p>Platform-wide overview and controls</p></div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()">
        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:28px">
          <div class="stat-card" style="border-left:4px solid #7c3aed">
            <div class="stat-value">{{ stats()?.totalUsers || 0 }}</div>
            <div class="stat-label">Total Users</div>
            <div class="stat-icon">👥</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--success)">
            <div class="stat-value">{{ stats()?.totalSuppliers || 0 }}</div>
            <div class="stat-label">Suppliers</div>
            <div class="stat-icon">🏪</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--info)">
            <div class="stat-value">{{ stats()?.totalBookings || 0 }}</div>
            <div class="stat-label">Total Bookings</div>
            <div class="stat-icon">📋</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--primary)">
            <div class="stat-value">₹{{ (stats()?.totalRevenue || 0) | number }}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-icon">💰</div>
          </div>
        </div>

        <!-- Pending Alert -->
        <div *ngIf="stats()?.pendingSuppliers > 0" class="alert alert-warning">
          ⚠️ <strong>{{ stats()?.pendingSuppliers }} supplier(s)</strong> are waiting for approval.
          <a routerLink="/admin/suppliers" style="font-weight:700;text-decoration:underline;margin-left:8px">Review Now →</a>
        </div>

        <div class="grid-2">
          <!-- Recent Suppliers -->
          <div class="card">
            <div class="card-header"><h3 style="font-size:1rem">New Suppliers</h3><a routerLink="/admin/suppliers" class="btn btn-ghost btn-sm">Manage</a></div>
            <div class="card-body" style="padding:0">
              <div *ngIf="recentSuppliers().length === 0" class="empty-state" style="padding:24px"><div class="empty-icon">🏪</div><h3>No new suppliers</h3></div>
              <div *ngFor="let s of recentSuppliers()" class="list-row">
                <div>
                  <div class="row-title">{{ s.businessName }}</div>
                  <div class="row-sub">{{ s.user?.email }} • {{ s.createdAt | date:'shortDate' }}</div>
                </div>
                <span class="badge" [ngClass]="getStatusClass(s.status)">{{ s.status }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Bookings -->
          <div class="card">
            <div class="card-header"><h3 style="font-size:1rem">Recent Bookings</h3><a routerLink="/admin/bookings" class="btn btn-ghost btn-sm">View All</a></div>
            <div class="card-body" style="padding:0">
              <div *ngIf="recentBookings().length === 0" class="empty-state" style="padding:24px"><div class="empty-icon">📋</div><h3>No bookings</h3></div>
              <div *ngFor="let b of recentBookings()" class="list-row">
                <div>
                  <div class="row-title">#{{ b.bookingNumber }}</div>
                  <div class="row-sub">{{ b.user?.name }} • {{ b.supplier?.businessName }}</div>
                  <div class="row-sub">{{ b.scheduledDate | date:'shortDate' }} • ₹{{ b.totalAmount }}</div>
                </div>
                <span class="badge" [ngClass]="getStatusClass(b.status)">{{ b.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div style="margin-top:24px">
          <h3 style="margin-bottom:16px">Quick Actions</h3>
          <div class="action-grid">
            <a routerLink="/admin/suppliers" class="action-card admin-ac">
              <span class="action-icon">🏪</span>
              <span>Manage Suppliers</span>
              <span class="pending-badge" *ngIf="stats()?.pendingSuppliers > 0">{{ stats()?.pendingSuppliers }} pending</span>
            </a>
            <a routerLink="/admin/users" class="action-card admin-ac"><span class="action-icon">👥</span><span>Manage Users</span></a>
            <a routerLink="/admin/bookings" class="action-card admin-ac"><span class="action-icon">📋</span><span>All Bookings</span></a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--border); &:first-child { border-top: none; } &:hover { background: var(--bg); } }
    .row-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
    .row-sub { font-size: 0.78rem; color: var(--text-muted); }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .action-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 16px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--border); text-decoration: none; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); transition: var(--transition); text-align: center; .action-icon { font-size: 2rem; } &.admin-ac:hover { border-color: #7c3aed; color: #7c3aed; transform: translateY(-2px); box-shadow: var(--shadow); } }
    .pending-badge { background: var(--warning); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 99px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<any>(null);
  recentSuppliers = signal<any[]>([]);
  recentBookings = signal<any[]>([]);

  constructor(private adminService: AdminService) {}
  ngOnInit() {
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.stats.set(res.data.stats);
        this.recentSuppliers.set(res.data.recentSuppliers || []);
        this.recentBookings.set(res.data.recentBookings?.slice(0, 5) || []);
      },
      error: () => { this.loading.set(false); }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-secondary', rejected: 'badge-danger', approved: 'badge-success', suspended: 'badge-danger' };
    return map[status] || 'badge-secondary';
  }
}
