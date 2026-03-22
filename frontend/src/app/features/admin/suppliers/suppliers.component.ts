import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>Supplier Management</h1><p>Review, approve and manage service suppliers</p></div>

      <!-- Filters -->
      <div class="filter-row card card-body" style="margin-bottom:20px">
        <input type="text" class="form-control" [(ngModel)]="search" placeholder="🔍 Search suppliers..." style="flex:1" (keyup.enter)="load()" />
        <select class="form-control" [(ngModel)]="statusFilter" style="width:160px" (change)="load()">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <button class="btn btn-primary" (click)="load()">Search</button>
        <button class="btn btn-ghost" (click)="clearFilters()">Clear</button>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading()" class="suppliers-list">
        <div *ngIf="suppliers().length === 0" class="empty-state card card-body">
          <div class="empty-icon">🏪</div>
          <h3>No suppliers found</h3>
          <p>Adjust your filters or wait for new registrations</p>
        </div>

        <div *ngFor="let s of suppliers()" class="supplier-card card">
          <div class="supplier-card-header">
            <div class="supplier-avatar">{{ s.businessName?.charAt(0) }}</div>
            <div class="supplier-info">
              <h3>{{ s.businessName }}</h3>
              <p>{{ s.businessType | titlecase }} • {{ s.address?.city }}, {{ s.address?.state }}</p>
              <p class="supplier-email">{{ s.user?.email }} • {{ s.phone }}</p>
            </div>
            <span class="badge" [ngClass]="getStatusClass(s.status)">{{ s.status | titlecase }}</span>
          </div>

          <div class="supplier-card-body">
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Owner</span><span>{{ s.user?.name }}</span></div>
              <div class="info-item"><span class="info-label">Services</span><span>{{ s.services?.length || 0 }} listed</span></div>
              <div class="info-item"><span class="info-label">Registered</span><span>{{ s.createdAt | date:'mediumDate' }}</span></div>
              <div class="info-item"><span class="info-label">Rating</span>
                <span *ngIf="s.rating?.count > 0">⭐ {{ s.rating.average }}/5 ({{ s.rating.count }})</span>
                <span *ngIf="!s.rating?.count">No ratings yet</span>
              </div>
            </div>

            <div *ngIf="s.description" class="supplier-desc">{{ s.description }}</div>

            <div *ngIf="s.adminNote" class="admin-note">
              <span class="note-label">Admin Note:</span> {{ s.adminNote }}
            </div>
          </div>

          <div class="supplier-card-footer">
            <div class="note-section">
              <input type="text" class="form-control" [(ngModel)]="noteInputs[s._id]" placeholder="Add an admin note (optional)..." style="font-size:0.85rem;padding:8px 12px" />
            </div>
            <div class="action-btns">
              <button *ngIf="s.status !== 'approved'" class="btn btn-success btn-sm" (click)="updateStatus(s._id, 'approved')">✅ Approve</button>
              <button *ngIf="s.status !== 'rejected'" class="btn btn-danger btn-sm" (click)="updateStatus(s._id, 'rejected')">❌ Reject</button>
              <button *ngIf="s.status !== 'suspended'" class="btn btn-sm" style="background:#f59e0b;color:white" (click)="updateStatus(s._id, 'suspended')">⛔ Suspend</button>
              <button class="btn btn-danger btn-sm" (click)="deleteSupplier(s._id)">🗑️ Delete</button>
            </div>
          </div>
        </div>
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
    .suppliers-list { display: flex; flex-direction: column; gap: 16px; }

    .supplier-card { overflow: hidden; }

    .supplier-card-header {
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
    }

    .supplier-avatar {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: #7c3aed;
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 800;
      font-family: 'Syne', sans-serif;
      flex-shrink: 0;
    }

    .supplier-info {
      flex: 1;
      h3 { font-size: 1rem; margin-bottom: 3px; }
      p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2px; }
      .supplier-email { font-size: 0.8rem; color: var(--text-muted); }
    }

    .supplier-card-body { padding: 16px 20px; }

    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }

    .info-item {
      display: flex; flex-direction: column; gap: 2px;
      .info-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
      span:last-child { font-size: 0.9rem; font-weight: 600; }
    }

    .supplier-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      padding: 10px 12px;
      background: var(--bg);
      border-radius: var(--radius);
      margin-bottom: 10px;
      border-left: 3px solid var(--border);
    }

    .admin-note {
      font-size: 0.85rem;
      padding: 8px 12px;
      background: rgba(124,58,237,0.08);
      border-radius: var(--radius);
      border-left: 3px solid #7c3aed;
      color: #7c3aed;
      .note-label { font-weight: 700; }
    }

    .supplier-card-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .note-section { flex: 1; min-width: 200px; }
    .action-btns { display: flex; gap: 6px; flex-wrap: wrap; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); }

    @media (max-width: 768px) { .info-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class AdminSuppliersComponent implements OnInit {
  suppliers = signal<any[]>([]);
  loading = signal(true);
  search = '';
  statusFilter = '';
  page = 1;
  totalPages = 1;
  noteInputs: Record<string, string> = {};

  constructor(private adminService: AdminService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getSuppliers({ search: this.search, status: this.statusFilter, page: this.page, limit: 10 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.suppliers.set(res.data.suppliers || []);
        this.totalPages = res.data.pagination?.pages || 1;
      },
      error: () => { this.loading.set(false); }
    });
  }

  clearFilters() { this.search = ''; this.statusFilter = ''; this.page = 1; this.load(); }
  changePage(p: number) { this.page = p; this.load(); }

  updateStatus(id: string, status: string) {
    const labels: Record<string, string> = { approved: 'Approve', rejected: 'Reject', suspended: 'Suspend' };
    if (!confirm(`${labels[status]} this supplier?`)) return;
    const payload: any = { status };
    if (this.noteInputs[id]) payload.adminNote = this.noteInputs[id];
    this.adminService.updateSupplierStatus(id, payload).subscribe({
      next: () => { this.noteInputs[id] = ''; this.load(); },
      error: () => {}
    });
  }

  deleteSupplier(id: string) {
    if (!confirm('Permanently delete this supplier? This cannot be undone.')) return;
    this.adminService.deleteSupplier(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning', approved: 'badge-success',
      rejected: 'badge-danger', suspended: 'badge-danger'
    };
    return map[status] || 'badge-secondary';
  }
}
