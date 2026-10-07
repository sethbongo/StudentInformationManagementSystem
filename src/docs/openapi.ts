export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Student Information Management System (SIMS) REST API",
    version: "1.0.0",
    description:
      "Enterprise-grade, role-based RESTful API for Higher Education Student Information Management. Built with Next.js App Router, PostgreSQL, Prisma ORM, and Zod validation.",
    contact: {
      name: "SIMS Engineering Team",
      email: "api-support@sims.edu",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Bearer token obtained from `/auth/login` or `/auth/register`",
      },
    },
    schemas: {
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 100 },
          totalPages: { type: "integer", example: 10 },
          hasNextPage: { type: "boolean", example: true },
          hasPreviousPage: { type: "boolean", example: false },
        },
      },
      ApiResponseSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object" },
          meta: {
            type: "object",
            properties: {
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
      ApiResponsePaginated: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "array", items: { type: "object" } },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      ApiResponseError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed." },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Validation failed." },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string", example: "email" },
                    message: { type: "string", example: "A valid email address is required" },
                  },
                },
              },
            },
          },
          errors: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
            example: { email: ["A valid email address is required"] },
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@sims.edu" },
          password: { type: "string", example: "Admin123!" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "firstName", "lastName"],
        properties: {
          email: { type: "string", format: "email", example: "new.student@sims.edu" },
          password: { type: "string", minLength: 6, example: "Password123!" },
          firstName: { type: "string", example: "David" },
          lastName: { type: "string", example: "Tan" },
          role: {
            type: "string",
            enum: ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR", "STUDENT"],
            default: "STUDENT",
          },
          programId: { type: "string", format: "uuid" },
          studentNumber: { type: "string", example: "2026-00099" },
        },
      },
      CreateStudentRequest: {
        type: "object",
        required: ["studentNumber", "programId"],
        properties: {
          studentNumber: { type: "string", example: "2026-00101" },
          programId: { type: "string", format: "uuid" },
          firstName: { type: "string", example: "John" },
          lastName: { type: "string", example: "Doe" },
          middleName: { type: "string", example: "M." },
          suffix: { type: "string", example: "Jr." },
          email: { type: "string", format: "email", example: "john.doe@sims.edu" },
          yearLevel: { type: "integer", minimum: 1, maximum: 6, default: 1 },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE", "PROBATION", "GRADUATED", "DROPPED_OUT"], default: "ACTIVE" },
          dateOfBirth: { type: "string", format: "date", example: "2004-05-15" },
          contactNumber: { type: "string", example: "+639171234567" },
          address: { type: "string", example: "Manila, Philippines" },
        },
      },
      UpdateStudentRequest: {
        type: "object",
        properties: {
          programId: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          yearLevel: { type: "integer", minimum: 1, maximum: 6 },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE", "PROBATION", "GRADUATED", "DROPPED_OUT"] },
          contactNumber: { type: "string" },
          address: { type: "string" },
        },
      },
      CreateProgramRequest: {
        type: "object",
        required: ["code", "name", "department"],
        properties: {
          code: { type: "string", example: "BSCS" },
          name: { type: "string", example: "Bachelor of Science in Computer Science" },
          department: { type: "string", example: "Department of Computer Science" },
          totalUnitsRequired: { type: "integer", default: 120, example: 124 },
          isActive: { type: "boolean", default: true },
        },
      },
      CreateCourseRequest: {
        type: "object",
        required: ["code", "title"],
        properties: {
          code: { type: "string", example: "CS101" },
          title: { type: "string", example: "Introduction to Computer Science" },
          description: { type: "string", example: "Fundamental concepts of programming" },
          units: { type: "integer", default: 3, minimum: 1, maximum: 10 },
          programId: { type: "string", format: "uuid" },
          prerequisiteCourseIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
      },
      CreateAcademicTermRequest: {
        type: "object",
        required: ["code", "name", "startDate", "endDate"],
        properties: {
          code: { type: "string", example: "AY2026-2027-1S" },
          name: { type: "string", example: "Academic Year 2026-2027 1st Semester" },
          startDate: { type: "string", format: "date-time", example: "2026-08-15T00:00:00Z" },
          endDate: { type: "string", format: "date-time", example: "2026-12-20T00:00:00Z" },
          isEnrollmentOpen: { type: "boolean", default: false },
          isCurrent: { type: "boolean", default: false },
        },
      },
      CreateCourseOfferingRequest: {
        type: "object",
        required: ["courseId", "termId", "sectionCode", "schedule", "room"],
        properties: {
          courseId: { type: "string", format: "uuid" },
          termId: { type: "string", format: "uuid" },
          instructorId: { type: "string", format: "uuid" },
          sectionCode: { type: "string", example: "CS101-A" },
          schedule: { type: "string", example: "MWF 08:00-09:00 AM" },
          room: { type: "string", example: "Room 101" },
          maxCapacity: { type: "integer", default: 40, example: 40 },
        },
      },
      CreateEnrollmentRequest: {
        type: "object",
        required: ["courseOfferingId"],
        properties: {
          courseOfferingId: { type: "string", format: "uuid" },
          studentId: { type: "string", format: "uuid", description: "Required for staff; optional for students (auto-inferred)" },
        },
      },
      SubmitGradeRequest: {
        type: "object",
        required: ["enrollmentId"],
        properties: {
          enrollmentId: { type: "string", format: "uuid" },
          numericGrade: { type: "number", minimum: 1.0, maximum: 5.0, example: 1.25 },
          midtermGrade: { type: "number", minimum: 1.0, maximum: 5.0, example: 1.5 },
          finalGrade: { type: "number", minimum: 1.0, maximum: 5.0, example: 1.25 },
          letterGrade: { type: "string", example: "A" },
          remarks: { type: "string", enum: ["PASSED", "FAILED", "INCOMPLETE", "DROPPED"], default: "PASSED" },
          isFinalized: { type: "boolean", default: false },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with email and password",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: { description: "Login successful; returns JWT access token" },
          401: { description: "Invalid credentials" },
          422: { description: "Validation failed" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Invalidate current user session",
        description:
          "Requires Bearer token authentication. In Swagger UI, copy the `token` from `/auth/login`, click the green 'Authorize 🔓' button at the top of the page, paste the token, and click Authorize.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Logged out successfully" },
          401: { description: "Unauthenticated (missing or invalid Bearer token)" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user profile",
        description:
          "Requires Bearer token authentication. In Swagger UI, paste the token via the green 'Authorize 🔓' button.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "User profile data" },
          401: { description: "Unauthenticated (missing or invalid Bearer token)" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Self-register new student account",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: {
          201: { description: "Account created successfully" },
          409: { description: "Email already registered" },
          422: { description: "Validation failed" },
        },
      },
    },
    "/students": {
      get: {
        tags: ["Students"],
        summary: "List students (Search, Filter, Sort, Paginate)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "per_page", in: "query", schema: { type: "integer" } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by student number, name, or email" },
          { name: "programId", in: "query", schema: { type: "string" } },
          { name: "yearLevel", in: "query", schema: { type: "integer" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "PROBATION", "GRADUATED", "DROPPED_OUT"] } },
          { name: "sort", in: "query", schema: { type: "string" }, description: "Sort field (e.g. last_name, -last_name, student_number)" },
        ],
        responses: {
          200: { description: "Paginated student collection", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponsePaginated" } } } },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Students"],
        summary: "Create a new student profile (Administrator, Registrar)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateStudentRequest" } } },
        },
        responses: {
          201: { description: "Student created" },
          409: { description: "Duplicate student number or user conflict" },
          422: { description: "Validation error" },
        },
      },
    },
    "/students/{id}": {
      get: {
        tags: ["Students"],
        summary: "Retrieve student by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Student details" },
          403: { description: "Forbidden (Students can only view own record)" },
          404: { description: "Student not found" },
        },
      },
      put: {
        tags: ["Students"],
        summary: "Replace/update student profile",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStudentRequest" } } } },
        responses: {
          200: { description: "Student updated" },
          403: { description: "Forbidden" },
          404: { description: "Student not found" },
        },
      },
      patch: {
        tags: ["Students"],
        summary: "Partial update student profile",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStudentRequest" } } } },
        responses: {
          200: { description: "Student updated" },
          403: { description: "Forbidden" },
          404: { description: "Student not found" },
        },
      },
      delete: {
        tags: ["Students"],
        summary: "Delete student profile",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          204: { description: "Student deleted" },
          403: { description: "Forbidden" },
          404: { description: "Student not found" },
        },
      },
    },
    "/students/{id}/enrollments": {
      get: {
        tags: ["Students"],
        summary: "Get enrollments for a specific student",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Student enrollments list" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/students/{id}/grades": {
      get: {
        tags: ["Students"],
        summary: "Get grades for a specific student",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Student grades list" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/students/{id}/academic-record": {
      get: {
        tags: ["Academic Records"],
        summary: "Get full academic transcript, term breakdowns, and cumulative GWA",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Academic record with cumulative GWA and standing" },
          403: { description: "Forbidden (Enforces object-level authorization)" },
          404: { description: "Student not found" },
        },
      },
    },
    "/programs": {
      get: {
        tags: ["Programs"],
        summary: "List academic programs",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "department", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Programs list" } },
      },
      post: {
        tags: ["Programs"],
        summary: "Create academic program (Admin, Registrar)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateProgramRequest" } } } },
        responses: { 201: { description: "Program created" }, 409: { description: "Duplicate program code" } },
      },
    },
    "/programs/{id}": {
      get: {
        tags: ["Programs"],
        summary: "Get program by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Program details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Programs"],
        summary: "Replace program",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Program updated" } },
      },
      patch: {
        tags: ["Programs"],
        summary: "Partial update program",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Program updated" } },
      },
      delete: {
        tags: ["Programs"],
        summary: "Delete program",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Program deleted" } },
      },
    },
    "/courses": {
      get: {
        tags: ["Courses"],
        summary: "List courses with prerequisites",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "programId", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Courses list" } },
      },
      post: {
        tags: ["Courses"],
        summary: "Create course (Admin, Registrar)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCourseRequest" } } } },
        responses: { 201: { description: "Course created" }, 409: { description: "Duplicate course code" } },
      },
    },
    "/courses/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Get course details",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Course details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Courses"],
        summary: "Replace course",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Course updated" } },
      },
      patch: {
        tags: ["Courses"],
        summary: "Partial update course",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Course updated" } },
      },
      delete: {
        tags: ["Courses"],
        summary: "Delete course",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Course deleted" } },
      },
    },
    "/academic-terms": {
      get: {
        tags: ["Academic Terms"],
        summary: "List academic terms",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "isCurrent", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "sort", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Academic terms list" } },
      },
      post: {
        tags: ["Academic Terms"],
        summary: "Create academic term (Admin, Registrar)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAcademicTermRequest" } } } },
        responses: { 201: { description: "Term created" }, 409: { description: "Duplicate code" } },
      },
    },
    "/academic-terms/{id}": {
      get: {
        tags: ["Academic Terms"],
        summary: "Get academic term by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Term details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Academic Terms"],
        summary: "Replace academic term",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Term updated" } },
      },
      patch: {
        tags: ["Academic Terms"],
        summary: "Partial update academic term",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Term updated" } },
      },
      delete: {
        tags: ["Academic Terms"],
        summary: "Delete academic term",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Term deleted" } },
      },
    },
    "/course-offerings": {
      get: {
        tags: ["Course Offerings"],
        summary: "List course offerings sections",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "termId", in: "query", schema: { type: "string" } },
          { name: "courseId", in: "query", schema: { type: "string" } },
          { name: "instructorId", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Course offerings list" } },
      },
      post: {
        tags: ["Course Offerings"],
        summary: "Create course offering (Admin, Registrar)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCourseOfferingRequest" } } } },
        responses: { 201: { description: "Offering created" }, 409: { description: "Section conflict" } },
      },
    },
    "/course-offerings/{id}": {
      get: {
        tags: ["Course Offerings"],
        summary: "Get offering details",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Offering details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Course Offerings"],
        summary: "Replace offering",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Offering updated" } },
      },
      patch: {
        tags: ["Course Offerings"],
        summary: "Partial update offering",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Offering updated" } },
      },
      delete: {
        tags: ["Course Offerings"],
        summary: "Delete offering",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Offering deleted" } },
      },
    },
    "/course-offerings/{id}/students": {
      get: {
        tags: ["Course Offerings"],
        summary: "Get enrolled student roster (Admin, Registrar, Assigned Instructor)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Enrolled student roster" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
    "/enrollments": {
      get: {
        tags: ["Enrollments"],
        summary: "List enrollments (Students see own; Staff sees all)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "studentId", in: "query", schema: { type: "string" } },
          { name: "courseOfferingId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Enrollments list" } },
      },
      post: {
        tags: ["Enrollments"],
        summary: "Enroll in course offering (Enforces capacity, prerequisites, and duplicate prevention)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateEnrollmentRequest" } } } },
        responses: {
          201: { description: "Enrolled successfully" },
          409: { description: "Duplicate enrollment in course/section" },
          422: { description: "Prerequisite not satisfied or capacity reached" },
        },
      },
    },
    "/enrollments/{id}": {
      get: {
        tags: ["Enrollments"],
        summary: "Get enrollment by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Enrollment details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Enrollments"],
        summary: "Update enrollment status",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Status updated" } },
      },
      patch: {
        tags: ["Enrollments"],
        summary: "Partial update enrollment status",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Status updated" } },
      },
      delete: {
        tags: ["Enrollments"],
        summary: "Delete enrollment (Admin, Registrar)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Enrollment deleted" } },
      },
    },
    "/grades": {
      get: {
        tags: ["Grades"],
        summary: "List grades (Admin, Registrar, Instructor)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "studentId", in: "query", schema: { type: "string" } },
          { name: "offeringId", in: "query", schema: { type: "string" } },
          { name: "remarks", in: "query", schema: { type: "string" } },
          { name: "isFinalized", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Grades list" } },
      },
      post: {
        tags: ["Grades"],
        summary: "Submit grade for an enrollment (Assigned Instructor, Registrar, Admin)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SubmitGradeRequest" } } } },
        responses: {
          201: { description: "Grade submitted" },
          403: { description: "Instructor not assigned to offering" },
          409: { description: "Grade already submitted for enrollment" },
          422: { description: "Validation error" },
        },
      },
    },
    "/grades/{id}": {
      get: {
        tags: ["Grades"],
        summary: "Get grade by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Grade details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Grades"],
        summary: "Replace grade",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Grade updated" } },
      },
      patch: {
        tags: ["Grades"],
        summary: "Update grade (Locks finalized grades for instructors)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Grade updated" },
          403: { description: "Grade locked/finalized or unauthorized" },
        },
      },
      delete: {
        tags: ["Grades"],
        summary: "Delete grade record (Admin, Registrar)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Grade deleted" } },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users (Admin, Registrar)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "role", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Users list" } },
      },
      post: {
        tags: ["Users"],
        summary: "Create new user account (Admin only)",
        responses: { 201: { description: "User created" } },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User details" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Users"],
        summary: "Replace user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User updated" } },
      },
      patch: {
        tags: ["Users"],
        summary: "Partial update user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User updated" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Deactivate user (Admin only)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "User deactivated" } },
      },
    },
  },
};
