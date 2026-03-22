import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/api.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h1>Find Service Suppliers</h1>
        <p>Browse verified automotive service centers near you</p>
      </div>

      <!-- Search / Filter -->
      <div class="search-bar card card-body" style="margin-bottom:24px">
        <div class="search-row">
          <input type="text" class="form-control" [(ngModel)]="searchCity" placeholder="🏙️ Filter by city..." style="max-width:240px" />
          <input type="text" class="form-control" [(ngModel)]="searchService" placeholder="🔧 Filter by service..." style="max-width:240px" />
          <button class="btn btn-primary" (click)="search()">Search</button>
          <button class="btn btn-ghost" (click)="clearSearch()">Clear</button>
        </div>
      </div>

      <div *ngIf="loading()" class="page-loading"><div class="spinner spinner-dark"></div><span>Finding suppliers...</span></div>

      <div *ngIf="!loading() && suppliers().length === 0" class="empty-state card card-body">
        <div class="empty-icon">🏪</div>
        <h3>No suppliers found</h3>
        <p>Try adjusting your search filters</p>
      </div>

      <div class="suppliers-grid" *ngIf="!loading()">
        <div *ngFor="let s of suppliers()" class="supplier-card card">
          <div class="supplier-header">
            <div class="supplier-avatar">{{ s.businessName.charAt(0) }}</div>
            <div class="supplier-title">
              <h3>{{ s.businessName }}</h3>
              <span class="badge badge-secondary">{{ s.businessType | titlecase }}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="supplier-info-row" *ngIf="s.address">
              📍 {{ s.address.city }}, {{ s.address.state }}
            </div>
            <div class="supplier-info-row">📞 {{ s.phone }}</div>
            <div class="rating-row" *ngIf="s.rating?.count > 0">
              <div class="stars">
                <span *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= s.rating.average">★</span>
              </div>
              <span class="rating-text">{{ s.rating.average }} ({{ s.rating.count }} reviews)</span>
            </div>
            <div class="services-preview" *ngIf="s.services?.length > 0">
              <div class="services-title">Services:</div>
              <div class="services-tags">
                <span *ngFor="let sv of s.services.slice(0,3)" class="service-tag">
                  {{ sv.name }} — ₹{{ sv.price }}
                </span>
                <span *ngIf="s.services.length > 3" class="service-tag more">+{{ s.services.length - 3 }} more</span>
              </div>
            </div>
          </div>
          <div class="supplier-footer">
            <a [routerLink]="['/user/book', s._id]" [queryParams]="{type:'supplier'}" class="btn btn-primary btn-sm">Book Service</a>
            <div class="hours-text" *ngIf="s.operatingHours">{{ s.operatingHours.open }} - {{ s.operatingHours.close }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .suppliers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .supplier-card { overflow: hidden; transition: var(--transition); &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); } }
    .supplier-header { padding: 20px 20px 0; display: flex; align-items: flex-start; gap: 14px; }
    .supplier-avatar { width: 48px; height: 48px; border-radius: 12px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; font-family: 'Syne', sans-serif; flex-shrink: 0; }
    .supplier-title { h3 { font-size: 1rem; margin-bottom: 4px; } }
    .supplier-info-row { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
    .rating-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
    .rating-text { font-size: 0.8rem; color: var(--text-muted); }
    .services-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); margin-bottom: 6px; }
    .services-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .service-tag { font-size: 0.75rem; padding: 3px 8px; background: var(--bg); border-radius: 6px; color: var(--text-secondary); &.more { color: var(--primary); font-weight: 600; } }
    .supplier-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .hours-text { font-size: 0.75rem; color: var(--text-muted); }
  `]
})
export class SuppliersComponent implements OnInit {
  suppliers = signal<any[]>([]);
  loading = signal(true);
  searchCity = '';
  searchService = '';

  constructor(private supplierService: SupplierService) {}
  ngOnInit() { this.search(); }

  search() {
    this.loading.set(true);
    this.supplierService.getAllSuppliers({ city: this.searchCity, service: this.searchService }).subscribe({
      next: (res) => { this.loading.set(false); this.suppliers.set(res.data.suppliers || []); },
      error: () => { this.loading.set(false); }
    });
  }

  clearSearch() { this.searchCity = ''; this.searchService = ''; this.search(); }
}
