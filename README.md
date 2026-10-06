# Student Information Management System (SIMS) REST API
### AI-Assisted Backend Application Development

A robust, secured, and fully documented RESTful API backend for higher education student records, curricula, course scheduling, enrollments, grading, and transcript evaluations.

---

## 1. Selected Technology Stack

| Layer / Concern | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime & Language** | Node.js (v20+) & TypeScript | Type-safe backend server runtime |
| **Framework** | Next.js 15 (App Router Route Handlers) | High-performance HTTP REST endpoints |
| **Database** | PostgreSQL | Normalized relational database management system |
| **ORM & Migrations** | Prisma ORM 6.19 | Schema management, type safety, and SQL migrations |
| **Validation** | Zod 3.24 | Strict runtime schema parsing and error formatting |
| **Authentication** | JWT (`jsonwebtoken`) & Bcrypt (`bcryptjs`) | Stateless bearer authentication and password hashing |
| **API Documentation** | OpenAPI 3.0 & Swagger UI | Interactive documentation and contract definition |
| **Automated Testing** | Vitest 3.0 | Unit and domain business constraint testing |
| **API Client** | Postman Collection & Environment | End-to-end positive and negative demonstration cases |

---

## 2. Prerequisites

Ensure you have the following installed on your host machine:
- **Node.js**: v18.18+ or v20.x
- **npm**: v9+
- **PostgreSQL**: v14+ running locally or in Docker

---

## 3. Installation & Environment Configuration

### 3.1 Clone and Install Dependencies
```bash
git clone <repository-url>
cd StudentInformationManagementSystem
npm install
```

### 3.2 Environment Setup
Copy the environment template file:
```bash
cp .env.example .env
```
Configure your `.env` variables:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/StudentInformationManagementSystem?schema=public"
JWT_SECRET="your-super-secret-jwt-signing-key-32-chars-minimum"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
API_BASE_URL="http://localhost:3000"
```

---

## 4. Database Setup, Migrations & Seeding

### 4.1 Generate Prisma Client
```bash
npm run prisma:generate
```

### 4.2 Apply Database Migrations
Run the committed SQL migrations against your PostgreSQL instance:
```bash
npm run prisma:migrate
```
*(Alternatively, for automated schema push: `npx prisma migrate deploy`)*

### 4.3 Populate Demonstration Seed Data
Populate the database with minimum required demonstration records (105 Students, 22 Courses, 24 Course Offerings, 220 Enrollments, 110 Grades):
```bash
npm run prisma:seed
```

---

## 5. Starting the API Server

### Development Mode:
```bash
npm run dev
```
The REST API server will start on: **`http://localhost:3000`** (Base API Path: `http://localhost:3000/api/v1`).

### Production Build & Start:
```bash
npm run build
npm run start
```

---

## 6. Authentication Guide

All protected endpoints require an HTTP `Authorization` header containing a valid Bearer token:
```
Authorization: Bearer <your_jwt_access_token>
```

### Authentication Endpoints:
- **Login**: `POST /api/v1/auth/login`
- **Current User Profile**: `GET /api/v1/auth/me`
- **Logout / Invalidate**: `POST /api/v1/auth/logout`
- **Student Registration**: `POST /api/v1/auth/register`

---

## 7. Development Demonstration Accounts

The database seed provides predefined demonstration accounts across all 4 roles:

| Role | Email Address | Password | Permissions & Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sims.edu` | `Admin123!` | Full system administration and access to all resources |
| **Registrar** | `registrar@sims.edu` | `Registrar123!` | Student records, curricula, terms, and enrollments |
| **Instructor** | `prof.smith@sims.edu` | `Password123!` | View assigned offerings and encode/update grades |
| **Instructor** | `prof.johnson@sims.edu` | `Password123!` | IT department offerings and student grades |
| **Student** | `student.alice@sims.edu` | `Password123!` | Alice Guo (2026-00001): View own profile, grades, record |
| **Student** | `student.bob@sims.edu` | `Password123!` | Bob Cruz (2026-00002): View own profile, grades, record |

---

## 8. API Documentation Locations

- **Interactive Swagger UI**: [http://localhost:3000/api/v1/docs/ui](http://localhost:3000/api/v1/docs/ui)
- **Direct OpenAPI Route**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI 3.0 Specification JSON**: [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
- **Postman Collection**: Located in `postman/SIMS-API.postman_collection.json`
- **Postman Environment**: Located in `postman/SIMS-Local.postman_environment.json`
- **Entity Relationship Diagram**: Documented in [`docs/ERD.md`](docs/ERD.md)
- **Architecture & AI Document**: Documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 9. How to Run Automated Tests

Execute the automated test suite powered by Vitest:
```bash
npm test
```
To run tests in watch mode:
```bash
npm run test:watch
```

### Automated Test Coverage:
- **`auth-authorization.test.ts`**: Valid login, invalid credentials, role permissions, and token extraction.
- **`student-operations.test.ts`**: Student creation, duplicate student number handling, and query mappings.
- **`academic-transactions.test.ts`**: Capacity checks, duplicate enrollment prevention, grading permissions, and finalized grade locking.
- **`domain-logic.test.ts`**: Cyclic prerequisite dependency detection.
- **`gpa-calculator.test.ts`**: Term and cumulative GWA calculation and academic honor standings.
- **`validation-schemas.test.ts`**: Zod parsing and edge-case boundary validations.

---

## 10. Summary of AI Tools & Verification Workflow

As mandated by the **AI-Assisted Development Policy**:
1. **Scaffolding & Architecture**:
   - AI tools assisted in drafting initial CRUD route handlers, Zod schemas, and Vitest test fixtures.
2. **Review & Human Verification**:
   - All generated code was checked for compliance with Next.js App Router semantics, Prisma relational constraints, and HTTP status codes (e.g. enforcing `422 Unprocessable Content` for validation failures).
   - Identified gaps in prerequisite cycles, capacity checking, and role segregation were manually tested and confirmed.
3. **Database & Security Scrutiny**:
   - Database migrations and indexes were reviewed to ensure relational integrity.
   - Sensitive credentials were never shared with AI tools, and production passwords are fully hashed with Bcrypt.