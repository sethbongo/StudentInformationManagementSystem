# SIMS Frontend - API Integration Map

This document maps all user interface views and features in the frontend application to the authoritative REST API endpoints implemented in Laboratory Activity I.

---

| Frontend View / Feature | REST API Endpoint | HTTP Method | Authorized Roles | Purpose & Behavior |
| :--- | :--- | :---: | :--- | :--- |
| **Login Screen** | `/api/v1/auth/login` | `POST` | Public | Authenticates credentials (`email`, `password`), receives JWT token and user profile. |
| **Session Header / Logout** | `/api/v1/auth/logout` | `POST` | Authenticated | Revokes session token on backend and clears client storage. |
| **Auth Session Restore** | `/api/v1/auth/me` | `GET` | Authenticated | Verifies JWT bearer token on app mount and retrieves current profile. |
| **Dashboard Metrics** | `/api/v1/programs` | `GET` | Authenticated | Retrieves total program count for dashboard stat cards. |
| | `/api/v1/course-offerings` | `GET` | Authenticated | Retrieves total offering count for dashboard stat cards. |
| | `/api/v1/students` | `GET` | Admin, Registrar | Retrieves total student count for dashboard. |
| | `/api/v1/enrollments` | `GET` | Authenticated | Retrieves enrollment count (all or self). |
| **Student Directory** | `/api/v1/students` | `GET` | Admin, Registrar | Paginated list with `search=`, `program_id=`, `year_level=`, `status=`, `sortBy=`, `sortOrder=`. |
| **Register Student Modal** | `/api/v1/students` | `POST` | Admin, Registrar | Creates student with auto-provisioned user account. Maps 422 errors to fields. |
| **Student Details Modal** | `/api/v1/students/:id` | `GET` | Admin, Registrar, Self | Retrieves full student demographic & contact details. |
| **Edit Student Modal** | `/api/v1/students/:id` | `PATCH` | Admin, Registrar | Updates student attributes with server validation feedback. |
| **Deactivate Student** | `/api/v1/students/:id` | `DELETE` | Admin | Deactivates/removes student record with confirmation dialog. |
| **Student Transcript Link** | `/api/v1/students/:id/academic-record` | `GET` | Admin, Registrar, Self | Official aggregated transcript with Term GWAs and Cumulative GWA. |
| **Programs View** | `/api/v1/programs` | `GET` | Authenticated | Lists degree programs with required units and statuses. |
| **Add Program Modal** | `/api/v1/programs` | `POST` | Admin, Registrar | Creates degree program record. |
| **Edit Program Modal** | `/api/v1/programs/:id` | `PATCH` | Admin, Registrar | Updates degree program details. |
| **Delete Program** | `/api/v1/programs/:id` | `DELETE` | Admin | Removes degree program with confirmation. |
| **Courses View** | `/api/v1/courses` | `GET` | Authenticated | Lists courses with units, lab/lecture hours, and program filter. |
| **Add Course Modal** | `/api/v1/courses` | `POST` | Admin, Registrar | Creates new curriculum course. |
| **Edit Course Modal** | `/api/v1/courses/:id` | `PATCH` | Admin, Registrar | Updates course metadata. |
| **Delete Course** | `/api/v1/courses/:id` | `DELETE` | Admin | Deletes curriculum course with confirmation. |
| **Course Prerequisites** | `/api/v1/courses/:id/prerequisites` | `GET` | Authenticated | Lists required prerequisite courses. |
| **Academic Terms View** | `/api/v1/academic-terms` | `GET` | Admin, Registrar | Lists academic years, semesters, and date ranges. |
| **Add Term Modal** | `/api/v1/academic-terms` | `POST` | Admin, Registrar | Creates new academic calendar term. |
| **Edit Term Modal** | `/api/v1/academic-terms/:id` | `PATCH` | Admin, Registrar | Updates term dates and active period status. |
| **Course Offerings View** | `/api/v1/course-offerings` | `GET` | Authenticated | Lists sections, terms, schedules, rooms, instructors, and capacities. |
| **Open Offering Modal** | `/api/v1/course-offerings` | `POST` | Admin, Registrar | Publishes new course section with max capacity. |
| **Class Roster Modal** | `/api/v1/course-offerings/:id/students` | `GET` | Admin, Registrar, Instructor | Lists students officially enrolled in the section. |
| **Enrollments View** | `/api/v1/enrollments` | `GET` | Admin, Registrar, Self (Student) | Lists course registrations. Students only see their own records. |
| **Enroll Student Modal** | `/api/v1/enrollments` | `POST` | Admin, Registrar, Student | Enrolls student. Enforces prerequisite check, duplicate prevention (409), and capacity. |
| **Drop Enrollment** | `/api/v1/enrollments/:id` | `DELETE` | Admin, Registrar | Updates enrollment status to `DROPPED`. |
| **Grades View** | `/api/v1/grades` | `GET` | Admin, Registrar, Instructor, Student | Lists course grades. Students see their own; Instructors see assigned sections. |
| **Encode Grade Modal** | `/api/v1/grades` | `POST` | Admin, Registrar, Instructor | Submits midterm, final, rating, and remarks (Philippine scale 1.00 - 5.00). |
| **Update Grade Modal** | `/api/v1/grades/:id` | `PATCH` | Admin, Registrar, Instructor | Updates grade ratings with server validation. |
| **User Profile View** | `/api/v1/auth/me` | `GET` | Authenticated | Displays identity, role, and security boundaries. |

---

### Error Mapping Summary

| HTTP Code | REST API Semantics | Frontend UI Presentation |
| :---: | :--- | :--- |
| **200 / 201** | Success / Created | Green non-blocking toast; table/view state dynamically refreshed. |
| **400** | Bad Request | Error modal or warning banner with specific error message. |
| **401** | Unauthorized | Clears stored token and redirects user to Login screen. |
| **403** | Forbidden | `AccessDeniedView` or descriptive "You are not authorized" toast. |
| **404** | Not Found | `EmptyState` or resource not found notification. |
| **409** | Conflict | Specific conflict banner (e.g., duplicate enrollment or unmet prerequisite). |
| **422** | Unprocessable Content | Field-level error messages attached beneath each erroneous input field. |
| **500** | Internal Error | Safe user message with retry action; avoids exposing raw database details. |
| **0** | Network Failure | `ErrorState` with "Backend Connection Failed" and retry button. |
