import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService, VehicleService } from '../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h1>Welcome back, {{ firstName }} 👋</h1>
        <p>Here's an overview of your vehicle service activity</p>
      </div>

      <!-- Stats -->
      <div class="grid-4" style="margin-bottom:28px">
        <div class="stat-card">
          <div class="stat-value">{{ vehicles().length }}</div>
          <div class="stat-label">My Vehicles</div>
          <div class="stat-icon">🚗</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalBookings() }}</div>
          <div class="stat-label">Total Bookings</div>
          <div class="stat-icon">📅</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendingBookings() }}</div>
          <div class="stat-label">Pending</div>
          <div class="stat-icon">⏳</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedBookings() }}</div>
          <div class="stat-label">Completed</div>
          <div class="stat-icon">✅</div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Recent Bookings -->
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:1rem">Recent Bookings</h3>
            <a routerLink="/user/bookings" class="btn btn-ghost btn-sm">View All</a>
          </div>
          <div class="card-body" style="padding:0">
            <div *ngIf="loading()" class="page-loading" style="min-height:160px">
              <div class="spinner spinner-dark"></div>
            </div>
            <div *ngIf="!loading() && recentBookings().length === 0" class="empty-state" style="padding:32px">
              <div class="empty-icon">📋</div>
              <h3>No bookings yet</h3>
              <p>Book your first vehicle service today</p>
            </div>
            <div *ngFor="let booking of recentBookings()" class="booking-row">
              <div class="booking-info">
                <div class="booking-num">#{{ booking.bookingNumber }}</div>
                <div class="booking-detail">
                  {{ booking.vehicle?.make }} {{ booking.vehicle?.model }} •
                  {{ booking.supplier?.businessName }}
                </div>
                <div class="booking-date">{{ booking.scheduledDate | date:'mediumDate' }}</div>
              </div>
              <span class="badge" [ngClass]="getStatusClass(booking.status)">{{ booking.status }}</span>
            </div>
          </div>
        </div>

        <!-- My Vehicles -->
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:1rem">My Vehicles</h3>
            <a routerLink="/user/vehicles" class="btn btn-ghost btn-sm">Manage</a>
          </div>
          <div class="card-body" style="padding:0">
            <div *ngIf="vehicles().length === 0" class="empty-state" style="padding:32px">
              <div class="empty-icon">🚗</div>
              <h3>No vehicles added</h3>
              <p>Add your vehicle to book services</p>
            </div>
            <div *ngFor="let v of vehicles()" class="vehicle-row">
              <div class="vehicle-icon">{{ getVehicleIcon(v.vehicleType) }}</div>
              <div class="vehicle-info">
                <div class="vehicle-name">{{ v.make }} {{ v.model }} ({{ v.year }})</div>
                <div class="vehicle-plate">{{ v.licensePlate }} • {{ v.fuelType | titlecase }}</div>
              </div>
              <a [routerLink]="['/user/book', v._id]" class="btn btn-primary btn-sm" style="font-size:0.75rem">Book</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-grid">
          <a routerLink="/user/suppliers" class="action-card">
            <span class="action-icon">🔍</span>
            <span>Find Suppliers</span>
          </a>
          <a routerLink="/user/vehicles" class="action-card">
            <span class="action-icon">➕</span>
            <span>Add Vehicle</span>
          </a>
          <a routerLink="/user/bookings" class="action-card">
            <span class="action-icon">📋</span>
            <span>View Bookings</span>
          </a>
          <a routerLink="/register-supplier" class="action-card">
            <span class="action-icon">🏪</span>
            <span>Become Supplier</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; border-top: 1px solid var(--border);
      &:first-child { border-top: none; }
      &:hover { background: var(--bg); }
    }
    .booking-num { font-size: 0.8rem; font-weight: 700; font-family: 'Syne', sans-serif; margin-bottom: 2px; }
    .booking-detail { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px; }
    .booking-date { font-size: 0.75rem; color: var(--text-muted); }

    .vehicle-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 20px; border-top: 1px solid var(--border);
      &:first-child { border-top: none; }
      &:hover { background: var(--bg); }
    }
    .vehicle-icon { font-size: 1.5rem; }
    .vehicle-info { flex: 1; }
    .vehicle-name { font-size: 0.9rem; font-weight: 600; }
    .vehicle-plate { font-size: 0.8rem; color: var(--text-muted); }

    .quick-actions { margin-top: 28px; h3 { margin-bottom: 16px; font-size: 1.1rem; } }
    .action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 20px 12px; border-radius: var(--radius-lg);
      background: var(--surface); border: 1px solid var(--border);
      text-decoration: none; font-size: 0.85rem; font-weight: 600;
      color: var(--text-primary); transition: var(--transition); text-align: center;
      .action-icon { font-size: 1.8rem; }
      &:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); box-shadow: var(--shadow); }
    }
    @media (max-width: 600px) { .action-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class DashboardComponent implements OnInit {
  user = this.authService.currentUser;
  loading = signal(true);
  vehicles = signal<any[]>([]);
  recentBookings = signal<any[]>([]);
  totalBookings = signal(0);
  pendingBookings = signal(0);
  completedBookings = signal(0);

  constructor(private authService: AuthService, private vehicleService: VehicleService, private bookingService: BookingService) {}

  ngOnInit() {
    this.vehicleService.getMyVehicles().subscribe({ next: (res) => { this.vehicles.set(res.data.vehicles || []); }, error: () => {} });
    this.bookingService.getMyBookings({ limit: 5 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const bookings = res.data.bookings || [];
        this.recentBookings.set(bookings);
        this.totalBookings.set(res.data.pagination?.total || bookings.length);
        this.pendingBookings.set(bookings.filter((b: any) => b.status === 'pending').length);
        this.completedBookings.set(bookings.filter((b: any) => b.status === 'completed').length);
      },
      error: () => { this.loading.set(false); }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-info', in_progress: 'badge-primary', completed: 'badge-success', cancelled: 'badge-secondary', rejected: 'badge-danger' };
    return map[status] || 'badge-secondary';
  }

  getVehicleIcon(type: string): string {
    const map: Record<string, string> = { car: '🚗', motorcycle: '🏍️', truck: '🚛', bus: '🚌', van: '🚐', suv: '🚙', other: '🚘' };
    return map[type] || '🚗';
  }
  get firstName(): string {
  return this.user()?.name?.split(' ')[0] || 'there';
}

}
