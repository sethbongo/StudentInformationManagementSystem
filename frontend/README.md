# Student Information Management System (SIMS) - Frontend Client

This repository contains the standalone, client-side web application for the **Student Information Management System (SIMS)** developed for **Laboratory Activity II: AI-Assisted Frontend Framework Integration with an Existing REST API**.

The application communicates exclusively with the existing **Laboratory Activity I REST API** over HTTP, maintaining strict separation of concerns, zero direct database access, and robust server-side security boundaries.

---

## 🎨 Visual Design & Theme Specifications

- **Font Family**: Google Font **Poppins** (`300`, `400`, `500`, `600`, `700`, `800`)
- **Navigation**: Fixed / Responsive **Left Side Navigation**
- **Consistent Element Sizing**: Standardized button heights (`32px`, `42px`, `48px`), input controls (`42px`), card radii (`14px`), and table row heights (`48px`).
- **Required Color Palette**:
  - `#1B1931` — Deep Dark Background & Canvas Base
  - `#44174E` — Deep Plum Surface & Elevated Card Gradient
  - `#662249` — Wine Borders & Hover States
  - `#A34054` — Rose-Crimson Primary Action Buttons & Navigation Highlight
  - `#ED9E59` — Warm Amber Metrics, Student Numbers & Warnings
  - `#E98C89` — Soft Coral Pill Badges & Validation Alerts

---

## 🚀 Prerequisites

1. **Node.js**: v18.0.0 or later (v20+ recommended).
2. **Backend REST API**: The Laboratory Activity I backend running locally on `http://localhost:3000`.

---

## ⚙️ Installation & Setup

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
   Ensure `.env` points to your backend REST API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

---

## 💻 Available Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server (usually at `http://localhost:5173`). |
| `npm test` | Runs the Vitest automated test suite. |
| `npm run build` | Compiles the production bundle with TypeScript type-checking into `/dist`. |
| `npm run preview` | Previews the compiled production build locally. |

---

## 👥 Pre-Configured Demo Accounts

Use these accounts to test role-aware navigation and permissions (Quick-fill buttons are provided on the Login screen):

| Role | Email Address | Password | Permissions & Views |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sims.edu` | `Password123!` | Full access: Students, Programs, Courses, Terms, Offerings, Enrollments, Grades, Delete actions. |
| **Registrar** | `registrar@sims.edu` | `Password123!` | Student directory, Academic terms, Curriculum, Offerings, Enrollments, Grades. |
| **Instructor** | `faculty@sims.edu` | `Password123!` | Assigned offerings, class rosters, grade submission/update for authorized enrollments. |
| **Student** | `student@sims.edu` | `Password123!` | View only personal profile, personal enrollments, personal grades, and official academic record / GWA. |

---

## 🧪 Automated Testing

Run the test suite:
```bash
npm test
```
The test suite validates:
- API client authentication injection and error normalization (`401`, `403`, `409`, `422`, network error).
- Role-based permissions matrix for route protection.
- Philippine collegiate grading scale evaluation (President's List, Dean's List, Good Standing, Probation).

---

## 📂 Documentation Deliverables

- [`docs/API_INTEGRATION_MAP.md`](file:///c:/Users/rbong/Desktop/school/4thyr/special%20topics/StudentInformationManagementSystem/frontend/docs/API_INTEGRATION_MAP.md): Detailed table linking every frontend view and action to HTTP endpoints and roles.
- [`docs/ARCHITECTURE.md`](file:///c:/Users/rbong/Desktop/school/4thyr/special%20topics/StudentInformationManagementSystem/frontend/docs/ARCHITECTURE.md): Frontend architectural design, state management, and security boundaries.
- [`docs/AI_DEVELOPMENT_LOG.md`](file:///c:/Users/rbong/Desktop/school/4thyr/special%20topics/StudentInformationManagementSystem/frontend/docs/AI_DEVELOPMENT_LOG.md): Record of AI-assisted tasks, prompt summaries, and human verification.
