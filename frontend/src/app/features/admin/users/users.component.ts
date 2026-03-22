import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>User Management</h1><p>Manage all registered users</p></div>

      <!-- Filters -->
      <div class="filter-row card card-body" style="margin-bottom:20px">
        <input type="text" class="form-control" [(ngModel)]="search" placeholder="🔍 Search by name or email..." style="flex:1" (keyup.enter)="load()" />
        <select class="form-control" [(ngModel)]="roleFilter" style="width:160px" (change)="load()">
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="supplier">Suppliers</option>
          <option value="admin">Admins</option>
        </select>
        <button class="btn btn-primary" (click)="load()">Search</button>
        <button class="btn btn-ghost" (click)="clearFilters()">Clear</button>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()" class="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users()">
              <td><strong>{{ u.name }}</strong></td>
              <td style="color:var(--text-secondary)">{{ u.email }}</td>
              <td>
                <span class="badge" [ngClass]="getRoleClass(u.role)">{{ u.role | titlecase }}</span>
              </td>
              <td>
                <span class="badge" [ngClass]="u.isActive ? 'badge-success' : 'badge-danger'">{{ u.isActive ? 'Active' : 'Inactive' }}</span>
              </td>
              <td style="color:var(--text-muted);font-size:0.85rem">{{ u.createdAt | date:'shortDate' }}</td>
              <td>
                <div class="action-btns" *ngIf="u.role !== 'admin'">
                  <button class="btn btn-sm" [ngClass]="u.isActive ? 'btn-danger' : 'btn-success'" (click)="toggleStatus(u)">
                    {{ u.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="deleteUser(u._id)">Delete</button>
                </div>
                <span *ngIf="u.role === 'admin'" style="color:var(--text-muted);font-size:0.8rem">Admin</span>
              </td>
            </tr>
            <tr *ngIf="users().length === 0">
              <td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">No users found</td>
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
    .action-btns { display: flex; gap: 6px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); }
  `]
})
export class UsersComponent implements OnInit {
  users = signal<any[]>([]);
  loading = signal(true);
  search = '';
  roleFilter = '';
  page = 1;
  totalPages = 1;

  constructor(private adminService: AdminService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getUsers({ search: this.search, role: this.roleFilter, page: this.page, limit: 15 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.users.set(res.data.users || []);
        this.totalPages = res.data.pagination?.pages || 1;
      },
      error: () => { this.loading.set(false); }
    });
  }

  clearFilters() { this.search = ''; this.roleFilter = ''; this.page = 1; this.load(); }
  changePage(p: number) { this.page = p; this.load(); }

  toggleStatus(user: any) {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)) return;
    this.adminService.toggleUserStatus(user._id).subscribe({ next: () => this.load(), error: () => {} });
  }

  deleteUser(id: string) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    this.adminService.deleteUser(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  getRoleClass(role: string) {
    const map: Record<string, string> = { user: 'badge-info', supplier: 'badge-success', admin: 'badge-primary' };
    return map[role] || 'badge-secondary';
  }
}
