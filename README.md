# 🔧 AutoServe Pro — Vehicle Service System

A full-stack vehicle service management platform with three user panels: **User**, **Supplier**, and **Admin**.

---

## 🗂️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (Standalone Components) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Styling | SCSS with CSS Variables |

---

## 📁 Project Structure

```
vehicle-service-system/
├── backend/                  # Node.js / Express API
│   ├── server.js             # App entry point
│   ├── .env                  # Environment config
│   ├── models/
│   │   ├── User.js           # Users (user/supplier/admin roles)
│   │   ├── Supplier.js       # Supplier profiles + services
│   │   ├── Vehicle.js        # User vehicles
│   │   └── Booking.js        # Service bookings
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── supplier.controller.js
│   │   ├── booking.controller.js
│   │   ├── vehicle.controller.js
│   │   └── admin.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── supplier.routes.js
│   │   ├── booking.routes.js
│   │   ├── vehicle.routes.js
│   │   └── admin.routes.js
│   └── middleware/
│       └── auth.middleware.js # JWT + Role authorization
│
└── frontend/                 # Angular 17 App
    └── src/app/
        ├── core/services/
        │   ├── auth.service.ts     # Auth state + API calls
        │   └── api.service.ts      # All entity API services
        ├── guards/
        │   ├── auth.guard.ts       # Login required
        │   ├── role.guard.ts       # Role-based access
        │   └── guest.guard.ts      # Redirect if logged in
        ├── interceptors/
        │   └── auth.interceptor.ts # Auto-attach JWT token
        └── features/
            ├── auth/               # Login + Register
            ├── user/               # Full user panel
            ├── supplier/           # Full supplier panel
            └── admin/              # Full admin panel
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Angular CLI (`npm install -g @angular/cli`)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vehicle_service_db
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs at: `http://localhost:5000`

---

### 2. Create Admin Account (one-time)

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@demo.com",
    "password": "password123"
  }'
```

> Note: This endpoint only works if no admin exists yet.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
ng serve
```

App runs at: `http://localhost:4200`

The Angular dev server proxies `/api` calls to `http://localhost:5000` via `proxy.conf.json`.

---

## 👥 User Roles & Panels

### 🔵 User Panel (`/user`)
| Feature | Route |
|---|---|
| Dashboard with stats | `/user/dashboard` |
| Add/manage vehicles | `/user/vehicles` |
| Browse service suppliers | `/user/suppliers` |
| Book a service | `/user/book/:supplierId` |
| Track bookings + cancel | `/user/bookings` |
| Rate completed services | `/user/bookings` |
| Profile management | `/user/profile` |
| Apply to become supplier | `/register-supplier` |

---

### 🟢 Supplier Panel (`/supplier`)
| Feature | Route |
|---|---|
| Revenue & booking dashboard | `/supplier/dashboard` |
| Business profile management | `/supplier/profile` |
| Add/edit/delete services | `/supplier/services` |
| Accept/reject/complete bookings | `/supplier/bookings` |

Supplier registration flow:
1. User registers normally
2. Navigates to `/register-supplier`
3. Fills in business details
4. Submits — status is **pending**
5. Admin approves → user re-logs in as supplier

---

### 🟣 Admin Panel (`/admin`)
| Feature | Route |
|---|---|
| Platform dashboard + revenue | `/admin/dashboard` |
| User management (activate/deactivate/delete) | `/admin/users` |
| Supplier approval/rejection/suspension | `/admin/suppliers` |
| All bookings overview | `/admin/bookings` |

---

## 🔗 API Reference

### Auth
```
POST   /api/auth/register          # Register user
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user [Auth]
PUT    /api/auth/update-profile    # Update profile [Auth]
PUT    /api/auth/change-password   # Change password [Auth]
POST   /api/auth/create-admin      # Seed admin (one-time)
```

### Vehicles
```
POST   /api/vehicle                # Add vehicle [User]
GET    /api/vehicle/my-vehicles    # Get my vehicles [User]
GET    /api/vehicle/:id            # Get vehicle by ID [User]
PUT    /api/vehicle/:id            # Update vehicle [User]
DELETE /api/vehicle/:id            # Soft delete vehicle [User]
```

### Bookings
```
POST   /api/booking                    # Create booking [User]
GET    /api/booking/my-bookings        # My bookings [User]
GET    /api/booking/:id                # Get booking [Auth]
PUT    /api/booking/:id/cancel         # Cancel booking [User]
POST   /api/booking/:id/rate           # Rate booking [User]
```

### Suppliers (Public)
```
GET    /api/supplier/list              # Browse approved suppliers
GET    /api/supplier/:id               # Get supplier detail
```

### Suppliers (Protected)
```
POST   /api/supplier/register          # Register as supplier [Auth]
GET    /api/supplier/profile           # Get profile [Supplier]
PUT    /api/supplier/profile           # Update profile [Supplier]
GET    /api/supplier/dashboard         # Dashboard stats [Supplier]
POST   /api/supplier/services          # Add service [Supplier]
PUT    /api/supplier/services/:id      # Update service [Supplier]
DELETE /api/supplier/services/:id      # Delete service [Supplier]
GET    /api/supplier/bookings          # Get bookings [Supplier]
PUT    /api/supplier/bookings/:id/status  # Update booking status [Supplier]
```

### Admin
```
GET    /api/admin/dashboard                    # Dashboard stats [Admin]
GET    /api/admin/users                        # All users [Admin]
PUT    /api/admin/users/:id/toggle-status      # Toggle user [Admin]
DELETE /api/admin/users/:id                    # Delete user [Admin]
GET    /api/admin/suppliers                    # All suppliers [Admin]
PUT    /api/admin/suppliers/:id/status         # Update supplier status [Admin]
DELETE /api/admin/suppliers/:id                # Delete supplier [Admin]
GET    /api/admin/bookings                     # All bookings [Admin]
```

---

## 🗄️ MongoDB Schemas

### User
```json
{ name, email, password (hashed), phone, address, role, isActive, profileImage }
```

### Supplier
```json
{ user (ref), businessName, businessType, description, address, phone, email,
  services: [{name, description, price, duration}],
  operatingHours: {open, close, days},
  status: pending|approved|rejected|suspended,
  rating: {average, count}, adminNote }
```

### Vehicle
```json
{ owner (ref), make, model, year, licensePlate, vehicleType,
  color, fuelType, mileage, vin, insuranceExpiry, lastServiced, isActive }
```

### Booking
```json
{ user (ref), vehicle (ref), supplier (ref),
  services: [{name, price, description}],
  scheduledDate, scheduledTime,
  status: pending|confirmed|in_progress|completed|cancelled|rejected,
  totalAmount, bookingNumber (auto), paymentStatus,
  rating: {score, review}, supplierNote }
```

---

## ✅ Features Checklist

- [x] JWT Authentication (register, login, logout)
- [x] Role-based route guards (user / supplier / admin)
- [x] Auto JWT token injection via HTTP interceptor
- [x] User — Vehicle CRUD
- [x] User — Browse & search service suppliers
- [x] User — Multi-service booking with price calculation
- [x] User — Track, cancel, and rate bookings
- [x] Supplier — Self-registration with admin approval flow
- [x] Supplier — Business profile management
- [x] Supplier — Service catalog management
- [x] Supplier — Booking accept / reject / complete workflow
- [x] Supplier — Revenue dashboard
- [x] Admin — Platform statistics dashboard
- [x] Admin — User management (activate/deactivate/delete)
- [x] Admin — Supplier management (approve/reject/suspend/delete)
- [x] Admin — Platform-wide bookings overview
- [x] Automatic booking number generation
- [x] Supplier rating system (auto-calculated average)
- [x] Pagination on all list views
- [x] Search and filter on all admin tables

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (12 salt rounds)
- JWT tokens expire in 7 days
- Admin account can only be created via the seed endpoint (which locks after first use)
- Role-based middleware protects every sensitive route
- Supplier approval flow prevents unauthorized suppliers
- **Change `JWT_SECRET` in production!**
