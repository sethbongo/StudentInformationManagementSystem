import { User, Role } from "./auth";

export type StudentStatus = "ACTIVE" | "INACTIVE" | "PROBATION" | "GRADUATED" | "DROPPED_OUT";
export type ProgramStatus = "ACTIVE" | "INACTIVE" | "PHASED_OUT";
export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type TermStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CLOSED";
export type OfferingStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type EnrollmentStatus = "ENROLLED" | "DROPPED" | "COMPLETED" | "CANCELLED";
export type GradeRemark = "PASSED" | "FAILED" | "INCOMPLETE" | "DROPPED";

export interface Program {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  totalUnitsRequired: number;
  status: ProgramStatus;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    students?: number;
    courses?: number;
  };
}

export interface CoursePrerequisite {
  prerequisiteId: string;
  prerequisiteCourse: {
    id: string;
    code: string;
    title: string;
    units: number;
  };
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  units: number;
  lectureHours: number;
  labHours: number;
  status: CourseStatus;
  programId?: string | null;
  program?: {
    id: string;
    code: string;
    name: string;
  } | null;
  prerequisites?: CoursePrerequisite[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicTerm {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: TermStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Instructor {
  id: string;
  employeeNumber: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CourseOffering {
  id: string;
  courseId: string;
  termId: string;
  instructorId?: string | null;
  sectionCode: string;
  room?: string | null;
  schedulePattern?: string | null;
  schedule?: string | null;
  maxCapacity: number;
  status: OfferingStatus;
  course: {
    id: string;
    code: string;
    title: string;
    units: number;
  };
  term: {
    id: string;
    code: string;
    name: string;
    isCurrent: boolean;
  };
  instructor?: Instructor | null;
  enrolledCount?: number;
  _count?: {
    enrollments?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  studentNumber: string;
  userId: string;
  programId: string;
  yearLevel: number;
  status: StudentStatus;
  middleName?: string | null;
  suffix?: string | null;
  dateOfBirth?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: Role;
  };
  program: {
    id: string;
    code: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  student: {
    id: string;
    studentNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    program: {
      code: string;
      name: string;
    };
  };
  courseOffering: {
    id: string;
    sectionCode: string;
    schedulePattern?: string | null;
    room?: string | null;
    course: {
      id: string;
      code: string;
      title: string;
      units: number;
    };
    term: {
      id: string;
      code: string;
      name: string;
    };
    instructor?: Instructor | null;
  };
  grade?: Grade | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Grade {
  id: string;
  enrollmentId: string;
  numericGrade?: number | null;
  midtermGrade?: number | null;
  finalGrade?: number | null;
  letterGrade?: string | null;
  remarks: GradeRemark;
  isFinalized: boolean;
  submittedAt?: string | null;
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  enrollment: {
    id: string;
    studentId: string;
    student: {
      studentNumber: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
    courseOffering: {
      id: string;
      sectionCode: string;
      course: {
        code: string;
        title: string;
        units: number;
      };
      term: {
        code: string;
        name: string;
      };
      instructorId?: string | null;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicRecordTerm {
  term: {
    id: string;
    code: string;
    name: string;
    isCurrent: boolean;
  };
  courses: Array<{
    enrollmentId: string;
    courseCode: string;
    courseTitle: string;
    units: number;
    sectionCode: string;
    instructorName: string | null;
    enrollmentStatus: string;
    numericGrade: number | null;
    letterGrade: string | null;
    remarks: string | null;
    isFinalized: boolean;
  }>;
  summary: {
    totalUnitsAttempted: number;
    totalUnitsEarned: number;
    termGwa: number | null;
  };
}

export interface AcademicRecord {
  student: {
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    program: {
      id: string;
      code: string;
      name: string;
    };
  };
  academicProgress: {
    totalUnitsAttempted: number;
    totalUnitsEarned: number;
    totalUnitsRequired: number;
    remainingUnits: number;
    cumulativeGwa: number | null;
    academicStanding: string;
  };
  academicTerms: AcademicRecordTerm[];
}
