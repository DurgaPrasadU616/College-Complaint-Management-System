# Project Overview & Tech Stack

## Project Overview
Build a web-based **College Complaint Management System** that lets students report problems or complaints within their college and track those complaints until resolution. The system connects students with the appropriate college department or administrator, covering issues related to classrooms, laboratories, hostels, Wi-Fi, infrastructure, transportation, cleanliness, or other campus facilities. The goal is to replace a manual, ad-hoc complaint process with a centralized digital complaint tracking system that gives students visibility into status and gives admins a structured way to triage, assign, and resolve issues.

## Tech Stack
**Frontend:** React (Vite) or Next.js (Pages Router), Tailwind CSS, Zustand or Context API for state, Axios, react-hot-toast for notifications, lucide-react icons.

**Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, bcryptjs, multer (file/image uploads), express-validator, helmet, morgan, cors.

**Storage:** Local disk storage or Cloudinary/S3-compatible bucket for complaint image/file attachments.

**Notifications (bonus):** Nodemailer for email notifications; Socket.IO for real-time status updates.

**Deployment:** Frontend on Vercel/Netlify, backend on Render/Railway, MongoDB Atlas for the database.

---

# Authentication, Complaint Lifecycle & Roles

## Authentication
The system must support student registration and login, JWT-based session handling, protected routes, a `/auth/me` profile endpoint, role separation between **student** and **admin**, password hashing with bcrypt at cost factor 12, and persistent login state on the client.

## Complaint Lifecycle
Every complaint moves through a fixed status pipeline:

```
Submitted → Under Review → Assigned → In Progress → Resolved → Closed
```

- **Submitted** — Student creates the complaint.
- **Under Review** — Admin has seen it but not yet assigned it.
- **Assigned** — Admin has assigned it to a department or staff member.
- **In Progress** — Assigned staff/department is actively working on it.
- **Resolved** — Issue fixed; resolution details recorded.
- **Closed** — Student (or admin) confirms closure, optionally with feedback/rating.

Every status transition must be timestamped and, ideally, logged with the actor who made the change (for auditability).

## Roles
- **Student:** submit complaints, attach files/images, track status, view history, comment/view admin updates, optionally rate the resolution.
- **Admin:** view all complaints, filter/search, assign department/staff, set priority, update status, add comments/resolution notes, view basic statistics.

---

# Core Feature Set

## Student-Facing Features
- User authentication (register/login)
- Student dashboard — summary of own complaints by status
- Complaint submission form: category, description, location, priority hint, image/file attachment
- Complaint categories (e.g., Classroom, Lab, Hostel, Wi-Fi/Network, Infrastructure, Transportation, Cleanliness, Other)
- Complaint status tracking with the pipeline above
- Complaint history — list of all previously submitted complaints
- Complaint details page — full description, attachments, status timeline, admin comments/updates

## Admin-Facing Features
- Admin dashboard — complaint counts by status/category/priority
- Admin complaint management — view, search, and filter all complaints (by status, category, priority, date, department)
- Department/staff assignment
- Priority setting: Low / Medium / High / Critical
- Status management — move a complaint through the pipeline
- Admin comments and resolution notes
- Basic complaint statistics (totals, resolved vs. open, average resolution time if tracked)

## Cross-Cutting / Platform Features
- Complaint data persisted in MongoDB with full CRUD via REST API
- Frontend–backend integration over a documented API
- Image/file attachment upload and retrieval
- Responsive UI suitable for both desktop and mobile browsers
- Working, deployed application (frontend + backend + database)

## Bonus / Optional Features (Stretch Goals)
- Email notifications on status change
- Real-time status notifications (Socket.IO)
- Admin analytics dashboard (charts by category/department/time)
- Department-wise statistics
- Complaint resolution time tracking
- Student feedback and resolution rating after closure
- Duplicate complaint detection (basic similarity check)
- AI-based complaint categorization from free-text description
- AI-generated complaint summaries for admins
- Image-based issue classification
- Automatic escalation for complaints unresolved past an SLA window
- Mobile-responsive / installable PWA interface

---

# Database Collections

**Users**
`name, email, password (select: false), role: student | admin, department (for admin), createdAt`

**Complaints**
`title, description, category, location, priority: low | medium | high | critical, status: submitted | under_review | assigned | in_progress | resolved | closed, attachments [ {url, filename, mimeType} ], submittedBy (ref User), assignedDepartment, assignedTo (ref User, nullable), resolutionDetails, createdAt, updatedAt`

**ComplaintUpdates** (status/comment timeline)
`complaintId (ref Complaint), actor (ref User), actorRole, previousStatus, newStatus, comment, createdAt`

**Departments** (optional, for structured assignment)
`name, description, staffMembers [ref User]`

**Notifications** (if email/real-time notifications are implemented)
`owner (ref User), complaintId, type, title, message, isRead, createdAt`

---

# API Endpoints

## Auth
- `POST /api/auth/register` — Register a new student or admin account
- `POST /api/auth/login` — Authenticate user and issue JWT
- `GET /api/auth/me` — Fetch current user profile

## Complaints (Student)
- `POST /api/complaints` — Submit a new complaint (with optional attachments)
- `GET /api/complaints/mine` — List complaints submitted by the logged-in student
- `GET /api/complaints/:id` — Fetch a single complaint's details and status timeline
- `POST /api/complaints/:id/feedback` — Submit feedback/rating after resolution (bonus)

## Complaints (Admin)
- `GET /api/complaints` — List all complaints with pagination/filter/search (by status, category, priority, department)
- `PATCH /api/complaints/:id/assign` — Assign a complaint to a department/staff member
- `PATCH /api/complaints/:id/status` — Update complaint status (with optional comment)
- `PATCH /api/complaints/:id/priority` — Update complaint priority
- `POST /api/complaints/:id/resolve` — Mark resolved and record resolution details

## Departments (optional)
- `GET /api/departments` — List departments
- `POST /api/departments` — Create a department (admin only)

## Statistics
- `GET /api/stats/dashboard` — Aggregated counts by status/category/priority for dashboards

## Notifications (bonus)
- `GET /api/notifications` — List notifications for the logged-in user

---

# Folder Structure

## Frontend
```
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── ComplaintCard/
    │   ├── ComplaintForm/
    │   ├── StatusBadge/
    │   ├── StatsWidgets/
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── index.jsx
    │   ├── login.jsx
    │   ├── register.jsx
    │   ├── student/
    │   │   ├── dashboard.jsx
    │   │   ├── new-complaint.jsx
    │   │   ├── my-complaints.jsx
    │   │   └── complaint/[id].jsx
    │   └── admin/
    │       ├── dashboard.jsx
    │       ├── complaints.jsx
    │       └── complaint/[id].jsx
    ├── store/
    │   └── authStore.js
    └── services/
        └── api.js
```

## Backend
```
server/
└── src/
    ├── config/
    │   ├── env.js
    │   └── db.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── complaintRoutes.js
    │   ├── departmentRoutes.js
    │   └── statsRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── complaintController.js
    │   └── statsController.js
    ├── services/
    │   ├── authService.js
    │   ├── complaintService.js
    │   └── uploadService.js
    ├── models/
    │   ├── User.js
    │   ├── Complaint.js
    │   ├── ComplaintUpdate.js
    │   ├── Department.js
    │   └── Notification.js
    └── middleware/
        ├── authMiddleware.js
        └── errorHandler.js
```

---

# Development Phases

**Phase 1:** Project setup — frontend/backend scaffolding, MongoDB connection, JWT authentication (register/login/me), role-based route protection.

**Phase 2:** Complaint submission and student experience — complaint form with category/location/attachment, student dashboard, complaint history, complaint details page.

**Phase 3:** Admin experience — admin dashboard, complaint list with search/filter, department/staff assignment, priority and status management, resolution notes.

**Phase 4:** Statistics and polish — basic dashboard statistics, responsive UI pass, loading/empty states, deployment.

**Phase 5 (Bonus):** Notifications (email and/or real-time), resolution feedback/rating, analytics dashboard, escalation rules, AI-assisted categorization/summaries.

---

# UI, Security & Outcome

## UI/UX Requirements
Clean, form-first design with Tailwind; responsive layout for mobile and desktop; clear status badges color-coded by pipeline stage; a details page combining description, attachments, and a status timeline; skeleton/loading states for lists and dashboards.

## Security Requirements
Hash passwords with bcrypt (cost 12); sign/verify JWTs with a secret from environment config; validate all request bodies with express-validator; restrict admin-only routes via role-based middleware; sanitize and size-limit file uploads; apply CORS restricted to the deployed client URL; use helmet for HTTP security headers; never expose another student's complaints to a non-owning, non-admin user.

## Final Expected Outcome
A deployed platform where a student can submit a complaint with a category, location, and optional attachment; watch it move through Submitted → Under Review → Assigned → In Progress → Resolved → Closed; see admin comments and resolution details; and, where implemented, receive notifications and leave feedback — while an admin has a single dashboard to triage, assign, prioritize, and resolve every open complaint across the college.

## Implementation Instructions (for AI Coding Agent)
Build phase by phase; follow the folder structure; keep controllers thin (parse request, call service, shape response); keep all business logic in services; never query MongoDB directly from a controller; treat every secret as `process.env`; validate every incoming request; return explicit error codes (e.g., `NOT_FOUND`, `UNAUTHORIZED`, `VALIDATION_ERROR`) rather than generic 500s; report the list of files created or changed at the end of every phase.