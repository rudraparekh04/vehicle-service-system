import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/api.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <div>
          <h1>My Vehicles</h1>
          <p>Manage your registered vehicles</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Add Vehicle</button>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div><span>Loading vehicles...</span></div>

      <div *ngIf="!loading() && vehicles().length === 0" class="empty-state card card-body">
        <div class="empty-icon">🚗</div>
        <h3>No vehicles added yet</h3>
        <p>Add your vehicle to start booking services</p>
        <button class="btn btn-primary" style="margin-top:16px" (click)="openModal()">Add Your First Vehicle</button>
      </div>

      <div class="vehicles-grid" *ngIf="!loading() && vehicles().length > 0">
        <div *ngFor="let v of vehicles()" class="vehicle-card card">
          <div class="vehicle-header">
            <span class="vehicle-type-icon">{{ getIcon(v.vehicleType) }}</span>
            <div class="vehicle-plate-badge">{{ v.licensePlate }}</div>
          </div>
          <div class="card-body">
            <h3>{{ v.make }} {{ v.model }}</h3>
            <p class="vehicle-year">{{ v.year }} • {{ v.vehicleType | titlecase }} • {{ v.fuelType | titlecase }}</p>
            <div class="vehicle-meta">
              <span *ngIf="v.color">🎨 {{ v.color }}</span>
              <span *ngIf="v.mileage">🛣️ {{ v.mileage | number }} km</span>
            </div>
          </div>
          <div class="vehicle-actions">
            <button class="btn btn-ghost btn-sm" (click)="editVehicle(v)">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" (click)="deleteVehicle(v._id)">🗑️ Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editMode ? 'Edit Vehicle' : 'Add New Vehicle' }}</h2>
          <button class="btn btn-ghost btn-sm" (click)="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Make *</label>
              <input type="text" class="form-control" [(ngModel)]="form.make" placeholder="Toyota" />
            </div>
            <div class="form-group">
              <label class="form-label">Model *</label>
              <input type="text" class="form-control" [(ngModel)]="form.model" placeholder="Camry" />
            </div>
            <div class="form-group">
              <label class="form-label">Year *</label>
              <input type="number" class="form-control" [(ngModel)]="form.year" placeholder="2020" />
            </div>
            <div class="form-group">
              <label class="form-label">License Plate *</label>
              <input type="text" class="form-control" [(ngModel)]="form.licensePlate" placeholder="MH01AB1234" style="text-transform:uppercase" />
            </div>
            <div class="form-group">
              <label class="form-label">Vehicle Type *</label>
              <select class="form-control" [(ngModel)]="form.vehicleType">
                <option value="">Select type</option>
                <option *ngFor="let t of vehicleTypes" [value]="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fuel Type</label>
              <select class="form-control" [(ngModel)]="form.fuelType">
                <option *ngFor="let f of fuelTypes" [value]="f.value">{{ f.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <input type="text" class="form-control" [(ngModel)]="form.color" placeholder="White" />
            </div>
            <div class="form-group">
              <label class="form-label">Mileage (km)</label>
              <input type="number" class="form-control" [(ngModel)]="form.mileage" placeholder="45000" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea class="form-control" [(ngModel)]="form.notes" rows="2" placeholder="Any additional notes..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="saveVehicle()" [disabled]="saving()">
            <span *ngIf="saving()" class="spinner"></span>
            {{ saving() ? 'Saving...' : (editMode ? 'Update Vehicle' : 'Add Vehicle') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vehicles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .vehicle-card { overflow: hidden; transition: var(--transition); &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); } }
    .vehicle-header { background: var(--secondary); padding: 24px 20px 16px; display: flex; align-items: center; justify-content: space-between; }
    .vehicle-type-icon { font-size: 2.5rem; }
    .vehicle-plate-badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; font-family: 'Syne', monospace; letter-spacing: 0.05em; }
    .vehicle-card h3 { font-size: 1.1rem; margin-bottom: 4px; }
    .vehicle-year { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; }
    .vehicle-meta { display: flex; gap: 12px; flex-wrap: wrap; span { font-size: 0.8rem; color: var(--text-secondary); } }
    .vehicle-actions { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }
  `]
})
export class VehiclesComponent implements OnInit {
  vehicles = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  error = signal('');
  editMode = false;
  editId = '';

  form = { make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vehicleType: '', fuelType: 'petrol', color: '', mileage: 0, notes: '' };

  vehicleTypes = [
    { value: 'car', label: 'Car' }, { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'truck', label: 'Truck' }, { value: 'bus', label: 'Bus' },
    { value: 'van', label: 'Van' }, { value: 'suv', label: 'SUV' }, { value: 'other', label: 'Other' }
  ];
  fuelTypes = [
    { value: 'petrol', label: 'Petrol' }, { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' }, { value: 'hybrid', label: 'Hybrid' },
    { value: 'cng', label: 'CNG' }, { value: 'other', label: 'Other' }
  ];

  constructor(private vehicleService: VehicleService) {}

  ngOnInit() { this.loadVehicles(); }

  loadVehicles() {
    this.vehicleService.getMyVehicles().subscribe({
      next: (res) => { this.loading.set(false); this.vehicles.set(res.data.vehicles || []); },
      error: () => { this.loading.set(false); }
    });
  }

  openModal() { this.editMode = false; this.editId = ''; this.resetForm(); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); this.error.set(''); }

  editVehicle(v: any) {
    this.editMode = true; this.editId = v._id;
    this.form = { make: v.make, model: v.model, year: v.year, licensePlate: v.licensePlate, vehicleType: v.vehicleType, fuelType: v.fuelType, color: v.color || '', mileage: v.mileage || 0, notes: v.notes || '' };
    this.showModal.set(true);
  }

  saveVehicle() {
    if (!this.form.make || !this.form.model || !this.form.year || !this.form.licensePlate || !this.form.vehicleType) {
      this.error.set('Please fill all required fields.'); return;
    }
    this.saving.set(true); this.error.set('');
    const obs = this.editMode ? this.vehicleService.updateVehicle(this.editId, this.form) : this.vehicleService.addVehicle(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.loadVehicles(); },
      error: (err) => { this.saving.set(false); this.error.set(err.error?.message || 'Failed to save vehicle.'); }
    });
  }

  deleteVehicle(id: string) {
    if (!confirm('Remove this vehicle?')) return;
    this.vehicleService.deleteVehicle(id).subscribe({ next: () => this.loadVehicles(), error: () => {} });
  }

  resetForm() { this.form = { make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vehicleType: '', fuelType: 'petrol', color: '', mileage: 0, notes: '' }; }

  getIcon(type: string): string {
    const map: Record<string, string> = { car: '🚗', motorcycle: '🏍️', truck: '🚛', bus: '🚌', van: '🚐', suv: '🚙', other: '🚘' };
    return map[type] || '🚗';
  }
}
