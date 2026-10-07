# Student Information Management System (SIMS)

An enterprise-grade, role-secured Student Information Management System featuring a high-performance **REST API backend** built with Next.js 15 App Router, PostgreSQL, Prisma ORM, and Zod, accompanied by a **modern client-side frontend** built with React 19, TypeScript, and Vite.

---

## Table of Contents
1. [System Architecture & Technology Stack](#1-system-architecture--technology-stack)
2. [Prerequisites](#2-prerequisites)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Setup, Migrations & Seeding](#4-database-setup-migrations--seeding)
5. [Starting the System](#5-starting-the-system)
   - [Starting the Backend API](#51-starting-the-backend-api)
   - [Starting the Frontend Client](#52-starting-the-frontend-client)
6. [How to View the Database in Prisma Studio](#6-how-to-view-the-database-in-prisma-studio)
7. [API Testing & Documentation URLs](#7-api-testing--documentation-urls)
8. [Demonstration Credentials & Roles](#8-demonstration-credentials--roles)
9. [Core System Modules & Capabilities](#9-core-system-modules--capabilities)
10. [Automated Testing Suite](#10-automated-testing-suite)

---

## 1. System Architecture & Technology Stack

### Backend Stack
| Layer / Tool | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Language** | Node.js (v20+) & TypeScript | Strongly-typed, modern server execution environment |
| **Framework** | Next.js 15 (App Router Route Handlers) | High-performance modular REST API endpoints |
| **Database** | PostgreSQL | Enterprise ACID-compliant relational database |
| **ORM & Migrations** | Prisma ORM 6.19 | Schema management, migrations, relations, and type safety |
| **Schema Validation** | Zod 3.24 | Runtime schema validation and formatted error responses |
| **Authentication** | JWT (`jsonwebtoken`) & Bcrypt (`bcryptjs`) | Stateless Bearer token auth with salted password hashing |
| **API Documentation** | OpenAPI 3.0 & Swagger UI | Interactive in-browser documentation and API testing sandbox |
| **Testing** | Vitest 3.0 | Unit, integration, and business domain constraint tests |

### Frontend Stack
| Layer / Tool | Technology | Description |
| :--- | :--- | :--- |
| **Framework & Build** | React 19 + TypeScript + Vite | Ultra-fast client-side SPA with HMR |
| **Design System** | Custom Glassmorphic CSS | Tailored dark theme, amber/coral accents, Poppins typography |
| **State & Security** | Context API & HTTP Client | JWT session storage, 401 interception, and role-based guards |

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.18+` or `v20.x` (Recommended: Node `v20+`)
- **npm**: `v9+`
- **PostgreSQL**: `v14+` running locally or in Docker

Verify your installations:
```bash
node -v
npm -v
psql --version
```

---

## 3. Environment Configuration

1. In the project root directory, locate or create the `.env` file:
```bash
# Copy example if setting up for the first time
cp .env.example .env
```

2. Configure your database connection string and secret keys in `.env`:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/StudentInformationManagementSystem?schema=public"

# Authentication Security
JWT_SECRET="your-super-secret-jwt-signing-key-32-chars-minimum"
JWT_EXPIRES_IN="7d"

# Server Settings
PORT=3000
NODE_ENV="development"
API_BASE_URL="http://localhost:3000"
```

> **Note**: Update `postgres:password@localhost:5432` with your actual PostgreSQL user credentials and port.

---

## 4. Database Setup, Migrations & Seeding

Run the following commands in the root directory:

### 4.1 Install Backend Dependencies
```bash
npm install
```

### 4.2 Generate Prisma Client
```bash
npm run prisma:generate
```

### 4.3 Apply Database Migrations
Applies all relational schemas, indexes, and foreign keys:
```bash
npm run prisma:migrate
```
*(Alternatively, for non-interactive migration: `npx prisma migrate dev`)*

### 4.4 Populate Demonstration Seed Data
Seeds comprehensive sample data across all academic modules:
```bash
npm run prisma:seed
```
This populates:
- **4 User Roles** (Administrator, Registrar, Faculty/Instructor, Student)
- **3 Degree Programs** (BSCS, BSIT, BSIS)
- **22 Courses** with full prerequisites
- **2 Academic Terms** (Past AY2025-2026-2S & Current AY2026-2027-1S)
- **24 Course Offerings** with section codes, schedules, and instructor assignments
- **105 Student Profiles**
- **220 Course Enrollments**
- **110 Grade Submissions**

---

## 5. Starting the System

To experience the full application, run both the backend server and frontend client.

### 5.1 Starting the Backend API
In your terminal, execute:
```bash
npm run dev
```
- **Backend API Server**: Runs on `http://localhost:3000`
- **Base REST API URL**: `http://localhost:3000/api/v1`

---

### 5.2 Starting the Frontend Client
Open a **new terminal tab or window** in the project root:

1. Install frontend dependencies (if first time):
```bash
npm run frontend:install
```

2. Start the Vite dev server:
```bash
npm run frontend:dev
```
- **Frontend Web Application**: Opens on **`http://localhost:5173`**

---

## 6. How to View the Database in Prisma Studio

Prisma provides an interactive visual database browser called **Prisma Studio**. It allows you to inspect, search, filter, edit, and create records directly inside your browser without needing PgAdmin or external SQL tools.

### To Launch Prisma Studio:
Run either of the following commands in your terminal:
```bash
npm run prisma:studio
```
or
```bash
npx prisma studio
```

### Accessing Prisma Studio:
- **Prisma Studio URL**: **`http://localhost:5555`**

### Available Models to Inspect:
- `User`: All system user accounts, roles, and hashed passwords.
- `Student`: Student profiles, student numbers (`2026-XXXXX`), program links, and academic standing.
- `Instructor`: Faculty profiles, employee numbers, and assigned departments.
- `Program`: Degree programs (BSCS, BSIT, BSIS) and total unit requirements.
- `Course`: Curricular course catalog, lecture/lab units, and descriptions.
- `CoursePrerequisite`: Directed acyclic graph of course prerequisite requirements.
- `AcademicTerm`: Academic calendars, semester duration dates, and active flags.
- `CourseOffering`: Scheduled sections, room assignments, schedules, and max capacities.
- `Enrollment`: Student class registrations and enrollment statuses (`ENROLLED`, `DROPPED`, `COMPLETED`).
- `Grade`: Midterm, final, numeric grades (1.00 - 5.00), evaluation remarks, and finalized locks.

---

## 7. API Testing & Documentation URLs

The system provides multiple testing interfaces and documentation formats:

| Testing Interface / Tool | URL / Location | Purpose |
| :--- | :--- | :--- |
| **Interactive Swagger UI (Primary)** | [http://localhost:3000/api/v1/docs/ui](http://localhost:3000/api/v1/docs/ui) | Full interactive documentation. Click **"Authorize"**, paste a Bearer token, and test any endpoint directly in your browser. |
| **Swagger UI (Alternative Route)** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | Direct route to the interactive Swagger documentation. |
| **OpenAPI 3.0 Specification (JSON)** | [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs) | Raw OpenAPI 3.0 JSON specification for Swagger/Postman imports. |
| **Postman Collection** | `postman/SIMS-API.postman_collection.json` | 40+ positive and negative test requests organized by module. |
| **Postman Environment** | `postman/SIMS-Local.postman_environment.json` | Preconfigured environment variables (`baseUrl`, `jwt_token`). |
| **Frontend Web Application** | [http://localhost:5173](http://localhost:5173) | Modern graphical client with quick-demo credentials buttons. |

---

### Using Postman for Automated API Testing:
1. Open Postman.
2. Click **Import** and select:
   - `postman/SIMS-API.postman_collection.json`
   - `postman/SIMS-Local.postman_environment.json`
3. Select the **SIMS Local** environment from the top-right environment picker.
4. Execute `1. Authentication -> Login (Admin)`:
   - The test script automatically extracts the JWT token into `{{jwt_token}}` for all subsequent requests.
5. You can now execute and test all protected endpoints seamlessly.

---

## 8. Demonstration Credentials & Roles

The database comes pre-seeded with test accounts across all 4 roles. You can also use the **Quick Demo Fill** buttons on the frontend login page:

| Role | Email Address | Password | Permissions & Dashboard Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sims.edu` | `Admin123!` | Complete access: students, faculty, programs, courses, terms, offerings, enrollments, grades, and system settings. |
| **Registrar** | `registrar@sims.edu` | `Registrar123!` | Academic operations: manages student records, enrollments, curriculum, course offerings, and official transcripts. |
| **Faculty / Instructor** | `faculty@sims.edu` | `Password123!` | Primary demo faculty account: views assigned course sections, inspects student rosters, and encodes/finalizes grades. |
| **Faculty / Instructor** | `prof.smith@sims.edu` | `Password123!` | Faculty member (CS Department): assigned to CS101, CS102, and MATH101 sections. |
| **Student** | `student@sims.edu` | `Password123!` | Primary demo student: browses course offerings, registers for sections, tracks grades, and views official transcript. |
| **Student** | `student.alice@sims.edu` | `Password123!` | Alice Guo (BSCS, 2026-00001): view own profile, grades, and academic transcript. |

---

## 9. Core System Modules & Capabilities

### 1. Authentication & Security
- Stateless JWT Bearer token authentication.
- Passwords hashed with salted Bcrypt (cost factor 10).
- Strict role-based authorization guards on all API routes.
- Automatic token expiration and client-side 401 handling.

### 2. Student Directory & Profiling
- Auto-generated Philippine student number format (`2026-XXXXX`).
- Program affiliation, academic year levels (1st–4th year), and status tracking (`ACTIVE`, `INACTIVE`, `PROBATION`).
- Searchable directory with program and year-level filters.

### 3. Courses & Prerequisite Graph
- Curricular course catalog with lecture and laboratory units.
- Prerequisite validation preventing cyclic dependencies (e.g. A → B → A).
- Interactive prerequisites viewer with quick course lookup.

### 4. Academic Terms
- Academic calendars, semester duration dates, and active registration flags.
- Interactive term inspection displaying connected course offerings, enrollment numbers, and capacity utilization metrics.

### 5. Course Offerings & Sections
- Class sections with assigned faculty, schedule patterns (e.g., `MWF 08:00-09:00 AM`), and physical classrooms.
- Real-time class capacity tracking and over-enrollment prevention.
- Role-scoped views: Faculty only see sections assigned to them; students see catalog sections with "View Course".

### 6. Course Enrollments
- Atomic student registration into open course offerings.
- Strict validation rules:
  - Duplicate enrollment prevention.
  - Prerequisite course completion verification.
  - Section capacity limit enforcement.
- Status management: `ENROLLED`, `DROPPED`, `COMPLETED`.

### 7. Grading System (Philippine Scale)
- Supports Philippine standard grading scale (`1.00` to `5.00` in 0.25 increments).
- Midterm and final grade ratings.
- Automatic remark determination (`PASSED`, `FAILED`, `INCOMPLETE`, `DROPPED`).
- Draft vs. Finalized locking mechanism preventing post-submission tampering.

### 8. Academic Records & Official Transcript
- Real-time Cumulative and Term General Weighted Average (GWA) calculation.
- Total units attempted, earned, and remaining.
- Academic honor standing classification (President's List, Dean's List, In Good Standing, Academic Probation).
- Live course and term search across the transcript.

---

## 10. Automated Testing Suite

The repository includes comprehensive automated tests for both backend and frontend.

### Run Backend Unit & Integration Tests (Vitest):
```bash
npm test
```
*Runs 41 automated tests covering GPA calculators, authentication guards, domain logic, Zod schemas, student operations, and academic transactions.*

To run backend tests in watch mode:
```bash
npm run test:watch
```

### Run Frontend Component & Integration Tests:
```bash
npm run frontend:test
```
*Runs 13 frontend tests covering role authorization, GWA display, and API client interceptors.*

### Verify Frontend Production Bundle:
```bash
npm run frontend:build
```
*Executes TypeScript type-checking (`tsc -b`) and Vite production bundling.*