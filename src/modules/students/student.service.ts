import prisma from "@/common/db/prisma";
import { StudentRepository } from "./student.repository";
import { CreateStudentInput, UpdateStudentInput, StudentQueryInput } from "./student.schema";
import { ConflictError, NotFoundError, ForbiddenError } from "@/common/errors/http-errors";
import { JwtUserPayload } from "@/common/utils/jwt";
import { calculateGwa, GradedCourseItem } from "@/common/utils/gpa-calculator";
import { hashPassword } from "@/common/utils/password";
import { Role } from "@prisma/client";

export class StudentService {
  static async listStudents(query: StudentQueryInput) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const programId = query.programId || query.program_id;
    const yearLevel = query.yearLevel !== undefined ? query.yearLevel : query.year_level;

    const { students, total } = await StudentRepository.findMany({
      skip,
      take: limit,
      programId,
      yearLevel,
      status: query.status,
      search: query.search,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { students, total, page, limit };
  }

  static async getStudentById(id: string, currentUser?: JwtUserPayload) {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw new NotFoundError(`Student with ID '${id}' not found`);
    }

    // Role-based access check
    if (currentUser && currentUser.role === "STUDENT") {
      if (student.userId !== currentUser.sub && student.id !== currentUser.studentId) {
        throw new ForbiddenError("Students can only view their own profile");
      }
    }

    return student;
  }

  static async getAcademicRecord(studentId: string, currentUser: JwtUserPayload) {
    const history = await StudentRepository.getAcademicHistory(studentId);
    if (!history) {
      throw new NotFoundError(`Student with ID '${studentId}' not found`);
    }

    // Student can only access their own academic record
    if (currentUser.role === "STUDENT") {
      if (history.userId !== currentUser.sub && history.id !== currentUser.studentId) {
        throw new ForbiddenError("You are not authorized to view another student's academic record");
      }
    } else if (currentUser.role === "INSTRUCTOR") {
      throw new ForbiddenError("Instructors cannot access full student transcripts directly");
    }

    // Group enrollments by academic term
    const termsMap = new Map<string, {
      term: { id: string; code: string; name: string; isCurrent: boolean };
      courses: GradedCourseItem[];
      records: Array<{
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
    }>();

    const allGradedCourses: GradedCourseItem[] = [];

    for (const enrollment of history.enrollments) {
      const { courseOffering, grade, status: enrollmentStatus } = enrollment;
      const { term, course, sectionCode, instructor } = courseOffering;

      if (!termsMap.has(term.id)) {
        termsMap.set(term.id, {
          term: {
            id: term.id,
            code: term.code,
            name: term.name,
            isCurrent: term.isCurrent,
          },
          courses: [],
          records: [],
        });
      }

      const numGrade = grade?.numericGrade ? Number(grade.numericGrade) : null;
      const remarks = grade?.remarks || (enrollmentStatus === "DROPPED" ? "DROPPED" : "INCOMPLETE");

      const gradedItem: GradedCourseItem = {
        courseCode: course.code,
        courseTitle: course.title,
        units: course.units,
        numericGrade: numGrade,
        letterGrade: grade?.letterGrade ?? null,
        remarks: remarks as any,
      };

      const instructorName = instructor?.user
        ? `${instructor.user.firstName} ${instructor.user.lastName}`
        : null;

      termsMap.get(term.id)!.records.push({
        enrollmentId: enrollment.id,
        courseCode: course.code,
        courseTitle: course.title,
        units: course.units,
        sectionCode,
        instructorName,
        enrollmentStatus,
        numericGrade: numGrade,
        letterGrade: grade?.letterGrade ?? null,
        remarks: grade ? grade.remarks : null,
        isFinalized: grade?.isFinalized ?? false,
      });

      if (grade && grade.isFinalized) {
        termsMap.get(term.id)!.courses.push(gradedItem);
        allGradedCourses.push(gradedItem);
      }
    }

    // Build term summaries with Term GWA
    const termSummaries = Array.from(termsMap.values()).map((termGroup) => {
      const calculation = calculateGwa(termGroup.courses);
      return {
        term: termGroup.term,
        courses: termGroup.records,
        summary: {
          totalUnitsAttempted: calculation.totalUnitsAttempted,
          totalUnitsEarned: calculation.totalUnitsEarned,
          termGwa: calculation.gwa,
        },
      };
    });

    const overallCalculation = calculateGwa(allGradedCourses);
    const totalRequired = history.program.totalUnitsRequired;
    const remainingUnits = Math.max(0, totalRequired - overallCalculation.totalUnitsEarned);

    return {
      student: {
        id: history.id,
        studentNumber: history.studentNumber,
        firstName: history.user.firstName,
        lastName: history.user.lastName,
        email: history.user.email,
        program: {
          id: history.program.id,
          code: history.program.code,
          name: history.program.name,
          department: history.program.department,
          totalUnitsRequired: totalRequired,
        },
      },
      academicProgress: {
        totalUnitsAttempted: overallCalculation.totalUnitsAttempted,
        totalUnitsEarned: overallCalculation.totalUnitsEarned,
        totalUnitsRequired: totalRequired,
        remainingUnits,
        cumulativeGwa: overallCalculation.gwa,
        academicStanding: overallCalculation.academicStanding,
      },
      academicTerms: termSummaries,
    };
  }

  static async getStudentGrades(studentId: string, currentUser: JwtUserPayload) {
    const student = await this.getStudentById(studentId, currentUser);

    const grades = await prisma.grade.findMany({
      where: {
        enrollment: {
          studentId: student.id,
        },
      },
      include: {
        enrollment: {
          include: {
            courseOffering: {
              include: {
                course: true,
                term: true,
                instructor: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return grades;
  }

  static async createStudent(input: CreateStudentInput) {
    const existing = await StudentRepository.findByStudentNumber(input.studentNumber);
    if (existing) {
      throw new ConflictError(`Student with number '${input.studentNumber}' already exists`);
    }

    const program = await prisma.program.findUnique({ where: { id: input.programId } });
    if (!program) {
      throw new NotFoundError(`Program with ID '${input.programId}' not found`);
    }

    let targetUserId = input.userId;

    if (!targetUserId) {
      // Create user account directly from student input
      const email = input.email || `${input.studentNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@sims.edu`;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictError(`User account with email '${email}' already exists`);
      }

      const passwordHash = await hashPassword(input.password || "Password123!");
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: Role.STUDENT,
          firstName: input.firstName || "Student",
          lastName: input.lastName || input.studentNumber,
        },
      });
      targetUserId = newUser.id;
    } else {
      const existingUser = await StudentRepository.findByUserId(targetUserId);
      if (existingUser) {
        throw new ConflictError("This user already has an associated student profile");
      }
    }

    return StudentRepository.create({
      user: { connect: { id: targetUserId } },
      program: { connect: { id: input.programId } },
      studentNumber: input.studentNumber,
      yearLevel: input.yearLevel,
      status: input.status,
      middleName: input.middleName,
      suffix: input.suffix,
      dateOfBirth: input.dateOfBirth,
      contactNumber: input.contactNumber,
      address: input.address,
    });
  }

  static async updateStudent(id: string, input: UpdateStudentInput) {
    const student = await this.getStudentById(id);

    if (input.programId) {
      const program = await prisma.program.findUnique({ where: { id: input.programId } });
      if (!program) {
        throw new NotFoundError(`Program with ID '${input.programId}' not found`);
      }
    }

    // If user names/email are updated, reflect in User record
    if (input.firstName || input.lastName || input.email) {
      await prisma.user.update({
        where: { id: student.userId },
        data: {
          ...(input.firstName && { firstName: input.firstName }),
          ...(input.lastName && { lastName: input.lastName }),
          ...(input.email && { email: input.email.toLowerCase() }),
        },
      });
    }

    return StudentRepository.update(id, {
      ...(input.programId && { program: { connect: { id: input.programId } } }),
      ...(input.yearLevel !== undefined && { yearLevel: input.yearLevel }),
      ...(input.status && { status: input.status }),
      ...(input.middleName !== undefined && { middleName: input.middleName }),
      ...(input.suffix !== undefined && { suffix: input.suffix }),
      ...(input.dateOfBirth !== undefined && { dateOfBirth: input.dateOfBirth }),
      ...(input.contactNumber !== undefined && { contactNumber: input.contactNumber }),
      ...(input.address !== undefined && { address: input.address }),
    });
  }

  static async deleteStudent(id: string) {
    await this.getStudentById(id);
    return StudentRepository.delete(id);
  }
}
