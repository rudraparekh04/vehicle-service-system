import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../core/services/api.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <div><h1>Manage Services</h1><p>Add and manage services you offer</p></div>
        <button class="btn btn-primary" (click)="openModal()">+ Add Service</button>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div></div>

      <div *ngIf="!loading() && services().length === 0" class="empty-state card card-body">
        <div class="empty-icon">🛠️</div>
        <h3>No services added yet</h3>
        <p>Add services that you offer to attract customers</p>
        <button class="btn btn-primary" style="margin-top:16px" (click)="openModal()">Add First Service</button>
      </div>

      <div class="services-grid" *ngIf="!loading() && services().length > 0">
        <div *ngFor="let sv of services()" class="service-card card">
          <div class="service-card-header">
            <div class="service-icon">🔧</div>
            <div class="service-price-badge">₹{{ sv.price }}</div>
          </div>
          <div class="card-body">
            <h3>{{ sv.name }}</h3>
            <p *ngIf="sv.description" class="service-desc">{{ sv.description }}</p>
            <p *ngIf="sv.duration" class="service-duration">⏱ {{ sv.duration }}</p>
          </div>
          <div class="service-actions">
            <button class="btn btn-ghost btn-sm" (click)="editService(sv)">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" (click)="deleteService(sv._id)">🗑️ Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editMode ? 'Edit Service' : 'Add New Service' }}</h2>
          <button class="btn btn-ghost btn-sm" (click)="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>
          <div class="form-group"><label class="form-label">Service Name *</label><input type="text" class="form-control" [(ngModel)]="form.name" placeholder="Oil Change" /></div>
          <div class="form-group"><label class="form-label">Price (₹) *</label><input type="number" class="form-control" [(ngModel)]="form.price" placeholder="500" min="0" /></div>
          <div class="form-group"><label class="form-label">Estimated Duration</label><input type="text" class="form-control" [(ngModel)]="form.duration" placeholder="e.g. 1 hour" /></div>
          <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" [(ngModel)]="form.description" rows="3" placeholder="Describe this service..."></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="saveService()" [disabled]="saving()">
            <span *ngIf="saving()" class="spinner"></span>
            {{ saving() ? 'Saving...' : (editMode ? 'Update' : 'Add Service') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .service-card { overflow: hidden; transition: var(--transition); &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); } }
    .service-card-header { background: #0d1f0d; padding: 20px; display: flex; align-items: center; justify-content: space-between; }
    .service-icon { font-size: 2rem; }
    .service-price-badge { background: #22c55e; color: white; padding: 6px 14px; border-radius: 99px; font-weight: 700; font-family: 'Syne', sans-serif; }
    .service-card h3 { font-size: 1rem; margin-bottom: 6px; }
    .service-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
    .service-duration { font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; }
    .service-actions { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }
  `]
})
export class ServicesComponent implements OnInit {
  services = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  error = signal('');
  editMode = false;
  editId = '';
  form = { name: '', price: 0, duration: '', description: '' };

  constructor(private supplierService: SupplierService) {}
  ngOnInit() { this.load(); }

  load() {
    this.supplierService.getProfile().subscribe({
      next: (res) => { this.loading.set(false); this.services.set(res.data.supplier?.services || []); },
      error: () => { this.loading.set(false); }
    });
  }

  openModal() { this.editMode = false; this.editId = ''; this.form = { name: '', price: 0, duration: '', description: '' }; this.showModal.set(true); }
  closeModal() { this.showModal.set(false); this.error.set(''); }

  editService(sv: any) {
    this.editMode = true; this.editId = sv._id;
    this.form = { name: sv.name, price: sv.price, duration: sv.duration || '', description: sv.description || '' };
    this.showModal.set(true);
  }

  saveService() {
    if (!this.form.name || !this.form.price) { this.error.set('Name and price are required.'); return; }
    this.saving.set(true); this.error.set('');
    const obs = this.editMode ? this.supplierService.updateService(this.editId, this.form) : this.supplierService.addService(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: (err) => { this.saving.set(false); this.error.set(err.error?.message || 'Save failed.'); }
    });
  }

  deleteService(id: string) {
    if (!confirm('Delete this service?')) return;
    this.supplierService.deleteService(id).subscribe({ next: () => this.load(), error: () => {} });
  }
}
