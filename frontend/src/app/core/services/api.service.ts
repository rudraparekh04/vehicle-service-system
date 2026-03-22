import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private url = `${environment.apiUrl}/vehicle`;
  constructor(private http: HttpClient) {}

  getMyVehicles() { return this.http.get<any>(`${this.url}/my-vehicles`); }
  addVehicle(data: any) { return this.http.post<any>(this.url, data); }
  updateVehicle(id: string, data: any) { return this.http.put<any>(`${this.url}/${id}`, data); }
  deleteVehicle(id: string) { return this.http.delete<any>(`${this.url}/${id}`); }
  getVehicleById(id: string) { return this.http.get<any>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private url = `${environment.apiUrl}/booking`;
  constructor(private http: HttpClient) {}

  createBooking(data: any) { return this.http.post<any>(this.url, data); }
  getMyBookings(params?: any) {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(`${this.url}/my-bookings`, { params: p });
  }
  getBookingById(id: string) { return this.http.get<any>(`${this.url}/${id}`); }
  cancelBooking(id: string) { return this.http.put<any>(`${this.url}/${id}/cancel`, {}); }
  rateBooking(id: string, data: any) { return this.http.post<any>(`${this.url}/${id}/rate`, data); }
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private url = `${environment.apiUrl}/supplier`;
  constructor(private http: HttpClient) {}

  getAllSuppliers(params?: any) {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(`${this.url}/list`, { params: p });
  }
  getSupplierById(id: string) { return this.http.get<any>(`${this.url}/${id}`); }
  registerSupplier(data: any) { return this.http.post<any>(`${this.url}/register`, data); }
  getProfile() { return this.http.get<any>(`${this.url}/profile`); }
  updateProfile(data: any) { return this.http.put<any>(`${this.url}/profile`, data); }
  getDashboard() { return this.http.get<any>(`${this.url}/dashboard`); }
  addService(data: any) { return this.http.post<any>(`${this.url}/services`, data); }
  updateService(id: string, data: any) { return this.http.put<any>(`${this.url}/services/${id}`, data); }
  deleteService(id: string) { return this.http.delete<any>(`${this.url}/services/${id}`); }
  getBookings(params?: any) {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(`${this.url}/bookings`, { params: p });
  }
  updateBookingStatus(bookingId: string, data: any) { return this.http.put<any>(`${this.url}/bookings/${bookingId}/status`, data); }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private url = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  getDashboard() { return this.http.get<any>(`${this.url}/dashboard`); }

  getUsers(params?: any) {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(`${this.url}/users`, { params: p });
  }
  toggleUserStatus(id: string) { return this.http.put<any>(`${this.url}/users/${id}/toggle-status`, {}); }
  deleteUser(id: string) { return this.http.delete<any>(`${this.url}/users/${id}`); }

  getSuppliers(params?: any) {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(`${this.url}/suppliers`, { params: p });
  }
  updateSupplierStatus(id: string, data: any) { return this.http.put<any>(`${this.url}/suppliers/${id}/status`, data); }
  deleteSupplier(id: string) { return this.http.delete<any>(`${this.url}/suppliers/${id}`); }

  getBookings(params?: any) {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(`${this.url}/bookings`, { params: p });
  }
}
