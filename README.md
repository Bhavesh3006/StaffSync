# StaffSync — Modern Human Resource Management System (HRMS)

StaffSync is an enterprise-grade full-stack HRMS built on the **MERN** stack (MongoDB, Express.js, React.js with Vite, and Node.js). It provides end-to-end workforce management with strict role-based access control (RBAC), multi-tier approval workflows, attendance tracking, and reporting analytics.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**
   - **HR Administrator**: Full employee lifecycle management, org-wide attendance correction, leave policies, announcement broadcasts, and high-level company analytics.
   - **Team Manager**: Direct report management, team attendance tracking, leave approval workflows, and training assignments.
   - **Employee**: Daily clock-in & clock-out, leave application with balance checks, self-enrollment in professional training, in-app notifications, and personal profile management.

2. **Attendance Management**
   - Single check-in constraint per workday (duplicate prevention).
   - Real-time work duration calculation.
   - Late check-in detection (threshold 9:30 AM).
   - Half-day auto-marking for shifts under 4 hours.
   - Missing check-out detection and administrative correction with audit logging.

3. **Leave Management Workflow**
   - Employee submits leave request (Annual, Sick, Casual, Maternity, Paternity, Unpaid).
   - Balance verification and overlapping date validation.
   - Manager/HR review pipeline with customized decision comments.
   - Automatic quota deduction upon approval.

4. **Announcements & Communication**
   - Categorized broadcasts: Company News, Statutory Holidays, Policy Updates, Events, Notices.
   - Target audience filtering (All, Employees, Managers).
   - Priority tagging (Urgent, High, Medium, Low).

5. **Training & Skills Development**
   - Course catalog with capacity limits and trainer information.
   - Self-enrollment and manager assignments.
   - Incremental progress tracking (0% to 100%) and certification.

6. **In-App Notification Center**
   - Real-time notifications for leave decisions, announcements, and training assignments.
   - Unread badges and instant mark-as-read.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance SPA with client-side routing |
| **Styling** | Bootstrap 5, Bootstrap Icons, Lucide Icons | Responsive modern enterprise UI |
| **Routing** | React Router v6 | Client-side RBAC route protection |
| **State** | Redux Toolkit | Centralized authentication and notifications state |
| **HTTP Client** | Axios | Configured with automatic JWT token attachment |
| **Backend** | Node.js, Express.js | Scalable REST API with layered architecture |
| **Database** | MongoDB, Mongoose ODM | Document database with schemas & indexes |
| **Security** | JWT, bcryptjs | Stateless auth & encrypted password hashing |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 2. Environment Variables
Backend configuration is managed via `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_super_secure_jwt_secret_key_2026_hrms
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB
If using local MongoDB:
```bash
cd backend
npm run db:start
```
Or ensure your local MongoDB service is running on `mongodb://127.0.0.1:27017`.

### 4. Seed Database with Demo Accounts
Populate demo users, attendance records, leaves, announcements, and trainings:
```bash
cd backend
npm run seed
```

### 5. Launch Backend Server
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

### 6. Launch Frontend Client
In a separate terminal:
```bash
cd frontend
npm run dev
# React Vite application runs on http://localhost:5173
```

---

## 🔑 Pre-Configured Demo Credentials

All demo accounts share the password: `Password123!`

| Role | Name | Email | Password | Key Permissions |
|---|---|---|---|---|
| **HR Admin** | Sarah Jenkins | `hr@staffsync.com` | `Password123!` | Full directory CRUD, org attendance, publish notices, org analytics |
| **Team Manager** | Michael Chang | `manager@staffsync.com` | `Password123!` | Review team leaves, monitor team attendance, assign trainings |
| **Employee** | Alex Rivera | `employee@staffsync.com` | `Password123!` | Clock in/out, apply for leaves, enroll in trainings, personal profile |

---

## 📂 Project Structure

```text
StaffSync/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, DashboardCard, ProtectedRoute
│   │   ├── layouts/          # MainLayout with responsive sidebar
│   │   ├── pages/            # Home, Login, Register, Dashboards, Employees, Attendance, Leaves, Announcements, Trainings, Profile
│   │   ├── services/         # Axios instance & interceptors
│   │   ├── store/            # Redux Toolkit auth and notification slices
│   │   ├── App.jsx           # App routes & role protection
│   │   ├── index.css         # Bootstrap custom styling
│   │   └── main.jsx          # React DOM entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── config/               # Database connection
    ├── controllers/          # Business logic (auth, employee, attendance, leave, announcement, training, report)
    ├── middleware/           # authMiddleware, roleMiddleware, errorMiddleware
    ├── models/               # User, Employee, Attendance, Leave, Announcement, Training, TrainingEnrollment, Notification, AuditLog
    ├── routes/               # Modular Express REST endpoints
    ├── utils/                # Database seeder
    ├── .env
    ├── package.json
    └── server.js
```

---

## 🧪 Testing Checklist

- [x] **Login / Auth**: Secure login with JWT; passwords hashed with bcryptjs.
- [x] **Role Redirection**: HR, Manager, and Employee each land on customized dashboards.
- [x] **Attendance Constraints**: Duplicate check-in on the same day is prohibited; checkout before check-in is blocked.
- [x] **Leave Approvals**: Overlapping dates and balance constraints are validated on server.
- [x] **Route Guards**: Unauthorized attempts to access `/employees` by employees are denied.
- [x] **Announcements**: Broadcast with audience and priority indicators.
- [x] **Trainings**: Capacity verification and user enrollment progress tracking.
- [x] **Responsive Design**: Fully responsive navigation with mobile drawer and desktop sidebar.

