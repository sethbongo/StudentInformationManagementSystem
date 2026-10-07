# SIMS Frontend Architecture & Technical Design

## 1. Architectural Overview

The **Student Information Management System (SIMS) Frontend** is an independent, client-side web application built with **React 19**, **TypeScript**, and **Vite**. It strictly consumes the authoritative backend REST API built in Laboratory Activity I via HTTP, adhering strictly to the **Pure Frontend Requirement**:
- **No Direct Database Access**: The frontend never connects to PostgreSQL directly.
- **Authoritative Backend**: All validation, authentication, authorization, business rules (prerequisites, capacity, duplicate detection, GWA calculation), and persistent states belong entirely to the backend REST API.
- **Client-Side Role Adaptations**: The UI adapts menus, buttons, and views according to the authenticated user's role without treating UI hides as security boundaries.

```
+-------------------------------------------------------------------------+
|                        Browser / React Application                       |
|                                                                         |
|  +-------------------+  +--------------------------------------------+  |
|  |   Left Sidebar    |  |               Top Header                   |  |
|  |  (Role-Aware Nav) |  |  (Connection Status, Role Badge, Title)    |  |
|  +-------------------+  +--------------------------------------------+  |
|  |                                                                    |  |
|  |  +--------------------------------------------------------------+  |  |
|  |  |                      Active View                             |  |  |
|  |  |  - Dashboard      - Students       - Programs    - Courses   |  |  |
|  |  |  - Terms          - Offerings      - Enrollments - Grades    |  |  |
|  |  |  - Academic Record (Transcript)    - Profile     - 403 / 404 |  |  |
|  |  +--------------------------------------------------------------+  |  |
|  +--------------------------------------------------------------------+  |
|                                     |                                   |
|                          State & Auth Context                           |
|                                     |                                   |
|                       Centralized API Client Layer                      |
|              (JWT Bearer, Error Normalization: 401/403/409/422)         |
+-------------------------------------------------------------------------+
                                      |  HTTP JSON Requests
                                      v
+-------------------------------------------------------------------------+
|                  Existing Laboratory Activity I REST API                |
|                    (Next.js App Router on Port 3000)                    |
+-------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                      PostgreSQL Relational Database                     |
+-------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
frontend/
├── public/                 # Static assets & icons
├── src/
│   ├── types/              # Strongly typed TypeScript interfaces (API, Auth, Entities)
│   ├── services/           # Dedicated service modules (api-client, auth, student, etc.)
│   ├── context/            # React Contexts (AuthContext, ToastContext)
│   ├── components/
│   │   ├── common/         # Atomic reusable components (Button, Input, Select, Modal, etc.)
│   │   └── layout/         # Left Sidebar, Header, AppLayout shell
│   ├── views/              # Full page views for all domain modules
│   ├── tests/              # Vitest automated test suites
│   ├── index.css           # Vanilla CSS Design System with exact requested palette & Poppins
│   ├── App.tsx             # Root application shell & route controller
│   └── main.tsx            # Application entrypoint
├── docs/                   # Architecture, API Integration Map, AI Dev Log
├── .env.example            # Environment template with VITE_API_BASE_URL
├── package.json            # Scripts: dev, build, test, preview
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 3. Strict Color Palette & Design System

The application strictly implements the required color palette and typography across all components:

| Hex Code | Semantic Role in Application |
| :--- | :--- |
| **`#1B1931`** | Primary Deep Dark background, base body fill, canvas backdrop. |
| **`#44174E`** | Deep Plum secondary surfaces, table headers, elevated cards, sidebar bottom gradient. |
| **`#662249`** | Wine accent, subtle card borders, active row hover backgrounds. |
| **`#A34054`** | Rose-crimson primary action buttons, active navigation item gradient, focus glow. |
| **`#ED9E59`** | Warm Amber secondary highlights, student numbers, key metrics, warning states. |
| **`#E98C89`** | Soft Coral pill badges, status indicators, validation alert borders. |

- **Typography**: Google Font **Poppins** imported at `300`, `400`, `500`, `600`, `700`, `800` weights.
- **Consistent Control Sizing**:
  - Buttons: Standard `42px`, Small `32px`, Large `48px`.
  - Form Inputs / Selects: Fixed `42px` height with `10px 14px` padding and `10px` border radius.
  - Table rows: `48px` minimum height with vertical alignment.
  - Left navigation: Fixed `260px` sidebar with responsive mobile collapse.

---

## 4. Centralized API Client & Error Normalization

[`frontend/src/services/api-client.ts`](file:///c:/Users/rbong/Desktop/school/4thyr/special%20topics/StudentInformationManagementSystem/frontend/src/services/api-client.ts) provides a single interceptor for all HTTP calls:
- Automatically injects `Authorization: Bearer <token>` from `localStorage`.
- Intercepts **401 Unauthorized**: Clears expired tokens and dispatches an event that returns the user to the Login view.
- Intercepts **422 Unprocessable Content**: Normalizes field-level errors (`errors: { [field]: string[] }`) and feeds them into form field states.
- Intercepts **409 Conflict**: Extracts specific business rule messages (e.g. duplicate enrollment, prerequisite unmet) for non-blocking notifications.
- Intercepts **403 Forbidden**: Displays an access denied state.
- Intercepts **Network Failures**: Catches unreachable server states and provides a clean "Backend Connection Failed" screen with a retry button instead of hanging or crashing.
