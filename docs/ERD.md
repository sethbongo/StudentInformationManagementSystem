# Entity Relationship Diagram (ERD)
### Student Information Management System (SIMS) REST API

This document describes the relational database schema, entities, primary keys, foreign key constraints, and relationships for the Student Information Management System.

---

## 1. Visual Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o| STUDENT : "has student profile"
    USER ||--o| INSTRUCTOR : "has instructor profile"
    USER ||--o{ GRADE : "submits"
    
    PROGRAM ||--o{ STUDENT : "enrolls in"
    PROGRAM ||--o{ COURSE : "curriculum includes"
    
    COURSE ||--o{ COURSE_PREREQUISITE : "requires"
    COURSE ||--o{ COURSE_PREREQUISITE : "prerequisite for"
    COURSE ||--o{ COURSE_OFFERING : "offered as"
    
    ACADEMIC_TERM ||--o{ COURSE_OFFERING : "contains"
    INSTRUCTOR ||--o{ COURSE_OFFERING : "teaches"
    
    STUDENT ||--o{ ENROLLMENT : "registers"
    COURSE_OFFERING ||--o{ ENROLLMENT : "receives"
    
    ENROLLMENT ||--o| GRADE : "evaluates"

    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum role "ADMINISTRATOR, REGISTRAR, INSTRUCTOR, STUDENT"
        string firstName
        string lastName
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    STUDENT {
        uuid id PK
        string studentNumber UK
        uuid userId FK
        uuid programId FK
        int yearLevel
        enum status "ACTIVE, INACTIVE, PROBATION, GRADUATED, DROPPED_OUT"
        string middleName
        string suffix
        datetime dateOfBirth
        string contactNumber
        string address
        datetime createdAt
        datetime updatedAt
    }

    INSTRUCTOR {
        uuid id PK
        string employeeNumber UK
        uuid userId FK
        string department
        string title
        datetime createdAt
        datetime updatedAt
    }

    PROGRAM {
        uuid id PK
        string code UK
        string name
        string department
        int totalUnitsRequired
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    COURSE {
        uuid id PK
        string code UK
        string title
        string description
        int units
        uuid programId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    COURSE_PREREQUISITE {
        uuid courseId PK,FK
        uuid prerequisiteId PK,FK
        datetime createdAt
    }

    ACADEMIC_TERM {
        uuid id PK
        string code UK
        string name
        datetime startDate
        datetime endDate
        boolean isEnrollmentOpen
        boolean isCurrent
        datetime createdAt
        datetime updatedAt
    }

    COURSE_OFFERING {
        uuid id PK
        uuid courseId FK
        uuid termId FK
        uuid instructorId FK
        string sectionCode
        string schedule
        string room
        int maxCapacity
        datetime createdAt
        datetime updatedAt
    }

    ENROLLMENT {
        uuid id PK
        uuid studentId FK
        uuid courseOfferingId FK
        enum status "ENROLLED, DROPPED, COMPLETED, CANCELLED"
        datetime enrolledAt
        datetime updatedAt
    }

    GRADE {
        uuid id PK
        uuid enrollmentId UK,FK
        decimal numericGrade
        decimal midtermGrade
        decimal finalGrade
        string letterGrade
        enum remarks "PASSED, FAILED, INCOMPLETE, DROPPED"
        boolean isFinalized
        datetime submittedAt
        uuid submittedById FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 2. Cardinality & Relationship Breakdown

1. **User $\leftrightarrow$ Profiles (1:1 optional)**:
   - A `User` represents the core authentication principal.
   - If `role == "STUDENT"`, it connects 1:1 with `Student` (Cascade delete).
   - If `role == "INSTRUCTOR"`, it connects 1:1 with `Instructor` (Cascade delete).
2. **Program $\leftrightarrow$ Student (1:N)**:
   - One Academic Program has many enrolled Students.
   - Deletion of a Program is restricted (`onDelete: Restrict`) if active students are registered.
3. **Course $\leftrightarrow$ Offerings (1:N)**:
   - One Course blueprint may be offered across multiple Academic Terms as distinct sections.
4. **Academic Term $\leftrightarrow$ Offerings (1:N)**:
   - One term contains multiple course offering sections with scheduling and capacity limits.
5. **Instructor $\leftrightarrow$ Offerings (1:N optional)**:
   - An instructor is assigned to teach multiple course offering sections.
6. **Student $\leftrightarrow$ Enrollments (1:N)**:
   - A student registers for multiple course offerings across their academic stay.
7. **Course Offering $\leftrightarrow$ Enrollments (1:N)**:
   - A course offering section receives student enrollments up to `maxCapacity`.
8. **Enrollment $\leftrightarrow$ Grade (1:1 optional)**:
   - An enrollment produces at most one official grade evaluation record.
   - Unique composite constraint prevents duplicate enrollments: `@@unique([studentId, courseOfferingId])`.

---

## 3. Data Integrity & Constraints

- **Unique Constraints**:
  - `User.email`
  - `Student.studentNumber`
  - `Instructor.employeeNumber`
  - `Program.code`
  - `Course.code`
  - `AcademicTerm.code`
  - `CourseOffering(courseId, termId, sectionCode)`
  - `Enrollment(studentId, courseOfferingId)`
  - `Grade.enrollmentId`
- **Check Validations & Foreign Keys**:
  - All relationship references enforce Referential Integrity.
  - Cascade deletion applies to dependent profiles when a User account is deleted.
  - Restrict deletion applies to Courses and Terms referenced in Offerings.
