# Architecture & Technical Documentation
### Student Information Management System (SIMS) REST API

This document describes the software architecture, design patterns, security decisions, and AI-assisted engineering workflow applied in the development of the SIMS backend REST API.

---

## 1. Architectural Style & Layered Pattern

The application is built using **Next.js App Router (Route Handlers)** utilizing an enterprise **3-Tier Layered Architecture** ensuring Separation of Concerns (SoC):

```
HTTP Client (Postman / Browser / Test Suite)
                  │
                  ▼
         [ Next.js Middleware ]
       (CORS, Security Headers)
                  │
                  ▼
       [ API Route Handlers ]
     (Path / Query / Body Parsing)
                  │
                  ▼
     [ Controller / Handler Wrapper ]
      (apiHandler, Error Interceptor)
                  │
                  ▼
            [ Service Layer ]
  (Business Rules, Access Control, GWA Engine)
                  │
                  ▼
          [ Repository Layer ]
    (Prisma Client, Database Queries)
                  │
                  ▼
      [ PostgreSQL Relational DB ]
```

### Layer Responsibilities
1. **API Route Layer (`src/app/api/v1/*`)**:
   - Parses HTTP methods and inputs.
   - Delegates request execution to `apiHandler`.
   - Formats responses using `ApiResponse`.
2. **Middleware & Security Guards (`src/common/middleware/*`)**:
   - `auth-guard.ts`: Extracts and verifies JWT bearer tokens.
   - `role-guard.ts`: Enforces Role-Based Access Control (RBAC).
   - `validate.ts`: Validates request bodies, query params, and route params against Zod schemas.
3. **Service Layer (`src/modules/*/*.service.ts`)**:
   - Encapsulates domain logic and business rules:
     - Cyclic prerequisite checking.
     - Section capacity thresholds.
     - Duplicate enrollment detection.
     - Grade finalization locks.
     - Cumulative and Term GWA calculations (`gpa-calculator.ts`).
4. **Repository Layer (`src/modules/*/*.repository.ts`)**:
   - Isolates all Prisma ORM database interactions.
   - Implements dynamic sorting, search, filtering, and pagination.

---

## 2. Major Design & Technical Decisions

1. **Next.js App Router as a Backend API**:
   - Eliminates the need for separate Express boilerplate while leveraging TypeScript, fast bundling, and built-in route handlers (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
2. **Prisma ORM with PostgreSQL**:
   - Provides end-to-end type safety, automated migration tracking (`prisma/migrations`), and declarative schema definitions (`prisma/schema.prisma`).
3. **Zod Validation & OpenAPI Contract Synchrony**:
   - All inputs are strictly validated prior to persistence.
   - Validation failures automatically return HTTP `422 Unprocessable Content` with specific field details.
4. **Philippine Collegiate Grading & GWA Calculation Engine**:
   - Supports numeric grades from `1.00` (Excellent) to `3.00` (Passing), and `5.00` (Failing).
   - Automatically derives academic standing honors (President's Lister $\le 1.45$, Dean's Lister $\le 1.75$, Academic Probation $> 3.50$).

---

## 3. Security Architecture & Threat Mitigations

| Security Concern | Implementation Approach |
| :--- | :--- |
| **Password Hashing** | Bcrypt with 10 salt rounds (`bcryptjs`). Plaintext passwords are never persisted or returned in API responses. |
| **Authentication** | Stateless JWT tokens signed with a 256-bit secret, containing user ID, role, studentId, and instructorId. |
| **Role Authorization** | Strict server-side RBAC for 4 roles: `ADMINISTRATOR`, `REGISTRAR`, `INSTRUCTOR`, and `STUDENT`. |
| **Object-Level Access Control** | Enforced at the service layer: A student attempting to view another student's record or grades receives `403 Forbidden`. |
| **SQL Injection** | Parameterized queries automatically enforced via Prisma ORM. No raw string interpolation is used. |
| **Information Disclosure** | Internal stack traces and raw database errors are caught by `handleApiError` and sanitized before reaching clients. |
| **CORS & Headers** | Global Next.js middleware defines CORS headers and security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`). |

---

## 4. AI-Assisted Development Workflow & Accountability

In compliance with the **AI-Assisted Development Policy (Section 3)**:

1. **Understand**:
   - Each domain requirement (prerequisites, enrollment limits, RBAC) was decomposed before drafting code.
2. **Plan & Scaffold**:
   - AI tools assisted in scaffolding the initial repository, repository layer abstractions, and Zod schemas.
3. **Review & Human Verification**:
   - Every AI-generated file was reviewed for framework conventions, type correctness, and edge-case handling.
   - Identified gaps (e.g., missing sorting, deficient seed volume, missing logout, Prisma version mismatches) were caught through manual audit.
4. **Automated Testing & Refactoring**:
   - Vitest automated tests were implemented to verify critical business logic and authorization constraints independently of AI generation.
