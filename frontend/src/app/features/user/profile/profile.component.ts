import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header"><h1>My Profile</h1><p>Manage your account information</p></div>
      <div class="grid-2" style="align-items:start">
        <!-- Profile Info -->
        <div class="card">
          <div class="card-header"><h3>Personal Information</h3></div>
          <div class="card-body">
            <div *ngIf="profileMsg()" class="alert" [ngClass]="profileSuccess() ? 'alert-success' : 'alert-danger'">{{ profileMsg() }}</div>
            <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" [(ngModel)]="profileForm.name" /></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" [(ngModel)]="profileForm.phone" /></div>
            <div class="form-group"><label class="form-label">Address</label><textarea class="form-control" [(ngModel)]="profileForm.address" rows="2"></textarea></div>
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" [value]="user()?.email" disabled /></div>
            <button class="btn btn-primary" (click)="updateProfile()" [disabled]="savingProfile()">
              <span *ngIf="savingProfile()" class="spinner"></span>
              {{ savingProfile() ? 'Saving...' : 'Update Profile' }}
            </button>
          </div>
        </div>

        <!-- Change Password -->
        <div class="card">
          <div class="card-header"><h3>Change Password</h3></div>
          <div class="card-body">
            <div *ngIf="passMsg()" class="alert" [ngClass]="passSuccess() ? 'alert-success' : 'alert-danger'">{{ passMsg() }}</div>
            <div class="form-group"><label class="form-label">Current Password</label><input type="password" class="form-control" [(ngModel)]="passForm.currentPassword" /></div>
            <div class="form-group"><label class="form-label">New Password</label><input type="password" class="form-control" [(ngModel)]="passForm.newPassword" /></div>
            <div class="form-group"><label class="form-label">Confirm New Password</label><input type="password" class="form-control" [(ngModel)]="passForm.confirmPassword" /></div>
            <button class="btn btn-secondary" (click)="changePassword()" [disabled]="savingPass()">
              <span *ngIf="savingPass()" class="spinner"></span>
              {{ savingPass() ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent {
  user = this.authService.currentUser;
  profileMsg = signal('');
  passMsg = signal('');
  profileSuccess = signal(false);
  passSuccess = signal(false);
  savingProfile = signal(false);
  savingPass = signal(false);

  profileForm = { name: this.user()?.name || '', phone: (this.user() as any)?.phone || '', address: (this.user() as any)?.address || '' };
  passForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  constructor(private authService: AuthService) {}

  updateProfile() {
    this.savingProfile.set(true); this.profileMsg.set('');
    this.authService.updateProfile(this.profileForm).subscribe({
      next: () => { this.savingProfile.set(false); this.profileSuccess.set(true); this.profileMsg.set('Profile updated successfully!'); },
      error: (err) => { this.savingProfile.set(false); this.profileSuccess.set(false); this.profileMsg.set(err.error?.message || 'Update failed.'); }
    });
  }

  changePassword() {
    if (this.passForm.newPassword !== this.passForm.confirmPassword) { this.passMsg.set('Passwords do not match.'); this.passSuccess.set(false); return; }
    this.savingPass.set(true); this.passMsg.set('');
    this.authService.changePassword({ currentPassword: this.passForm.currentPassword, newPassword: this.passForm.newPassword }).subscribe({
      next: () => { this.savingPass.set(false); this.passSuccess.set(true); this.passMsg.set('Password changed!'); this.passForm = { currentPassword: '', newPassword: '', confirmPassword: '' }; },
      error: (err) => { this.savingPass.set(false); this.passSuccess.set(false); this.passMsg.set(err.error?.message || 'Password change failed.'); }
    });
  }
}
