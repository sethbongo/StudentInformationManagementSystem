import prisma from "@/common/db/prisma";
import { EnrollmentRepository } from "./enrollment.repository";
import { CreateEnrollmentInput, UpdateEnrollmentStatusInput, EnrollmentQueryInput } from "./enrollment.schema";
import { ConflictError, NotFoundError, ForbiddenError, UnprocessableEntityError } from "@/common/errors/http-errors";
import { JwtUserPayload } from "@/common/utils/jwt";

export class EnrollmentService {
  static async listEnrollments(query: EnrollmentQueryInput, currentUser: JwtUserPayload) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const studentId = query.studentId || query.student_id;
    const courseOfferingId = query.courseOfferingId || query.course_offering_id;
    const courseId = query.courseId || query.course_id;
    const termId = query.termId || query.term_id;

    let targetStudentId = studentId;

    // Students can only view their own enrollments
    if (currentUser.role === "STUDENT") {
      targetStudentId = currentUser.studentId ?? undefined;
    }

    const { enrollments, total } = await EnrollmentRepository.findMany({
      skip,
      take: limit,
      studentId: targetStudentId,
      courseOfferingId,
      courseId,
      termId,
      status: query.status,
      search: query.search,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { enrollments, total, page, limit };
  }

  static async getEnrollmentById(id: string, currentUser: JwtUserPayload) {
    const enrollment = await EnrollmentRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundError(`Enrollment with ID '${id}' not found`);
    }

    if (currentUser.role === "STUDENT" && enrollment.studentId !== currentUser.studentId) {
      throw new ForbiddenError("You are not authorized to view another student's enrollment record");
    }

    return enrollment;
  }

  static async enrollStudent(input: CreateEnrollmentInput, currentUser: JwtUserPayload) {
    // 1. Determine student ID
    let studentId = input.studentId || input.student_id;
    const courseOfferingId = (input.courseOfferingId || input.course_offering_id)!;

    if (currentUser.role === "STUDENT") {
      if (!currentUser.studentId) {
        throw new ForbiddenError("No student profile linked to this user account");
      }
      studentId = currentUser.studentId;
    }

    if (!studentId) {
      throw new UnprocessableEntityError("Student ID is required for enrollment");
    }

    // 2. Fetch student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            grade: true,
            courseOffering: { include: { course: true } },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError(`Student with ID '${studentId}' not found`);
    }

    if (student.status !== "ACTIVE") {
      throw new UnprocessableEntityError(
        `Cannot enroll: Student status is '${student.status}'. Must be 'ACTIVE'.`
      );
    }

    // 3. Fetch offering with term and prerequisites
    const offering = await prisma.courseOffering.findUnique({
      where: { id: input.courseOfferingId },
      include: {
        term: true,
        course: {
          include: {
            prerequisites: {
              include: { prerequisite: true },
            },
          },
        },
        enrollments: true,
      },
    });

    if (!offering) {
      throw new NotFoundError(`Course Offering with ID '${input.courseOfferingId}' not found`);
    }

    // 4. Verify term enrollment window
    const isStaff = currentUser.role === "ADMINISTRATOR" || currentUser.role === "REGISTRAR";
    if (!offering.term.isEnrollmentOpen && !isStaff) {
      throw new UnprocessableEntityError(
        `Enrollment is currently closed for academic term '${offering.term.name}'.`
      );
    }

    // 5. Check duplicate section enrollment
    const existing = await EnrollmentRepository.findByStudentAndOffering(studentId, offering.id);
    if (existing) {
      throw new ConflictError("Student is already enrolled in this course section");
    }

    // 6. Check if already enrolled in another section of the same course in the same term
    const duplicateCourseInTerm = student.enrollments.some(
      (e) =>
        e.courseOffering.courseId === offering.courseId &&
        e.courseOffering.termId === offering.termId &&
        e.status === "ENROLLED"
    );
    if (duplicateCourseInTerm) {
      throw new ConflictError(
        `Student is already enrolled in another section of '${offering.course.code}' for this term.`
      );
    }

    // 7. Check section capacity
    const activeEnrollmentsCount = offering.enrollments.filter(
      (e) => e.status === "ENROLLED"
    ).length;

    if (activeEnrollmentsCount >= offering.maxCapacity && !isStaff) {
      throw new UnprocessableEntityError(
        `Section '${offering.sectionCode}' has reached maximum capacity (${offering.maxCapacity} students).`
      );
    }

    // 8. Check prerequisites
    const requiredPrereqs = offering.course.prerequisites.map((p) => p.prerequisite);
    for (const prereq of requiredPrereqs) {
      const hasPassedPrereq = student.enrollments.some(
        (e) =>
          e.courseOffering.courseId === prereq.id &&
          e.grade?.remarks === "PASSED" &&
          e.grade.isFinalized
      );

      if (!hasPassedPrereq) {
        throw new UnprocessableEntityError(
          `Prerequisite requirement not satisfied: Must complete and pass '${prereq.code} - ${prereq.title}' before enrolling in '${offering.course.code}'.`
        );
      }
    }

    // 9. Atomic transaction creation
    return prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId,
          courseOfferingId: offering.id,
          status: "ENROLLED",
        },
        include: {
          courseOffering: {
            include: {
              course: true,
              term: true,
            },
          },
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      return newEnrollment;
    });
  }

  static async updateStatus(id: string, input: UpdateEnrollmentStatusInput, currentUser: JwtUserPayload) {
    const enrollment = await this.getEnrollmentById(id, currentUser);

    if (currentUser.role === "STUDENT") {
      if (enrollment.studentId !== currentUser.studentId) {
        throw new ForbiddenError("You can only modify your own enrollment status");
      }
      // Students can only request to drop
      if (input.status !== "DROPPED") {
        throw new ForbiddenError("Students can only change enrollment status to 'DROPPED'");
      }
    }

    return EnrollmentRepository.updateStatus(id, input.status);
  }

  static async deleteEnrollment(id: string, currentUser: JwtUserPayload) {
    await this.getEnrollmentById(id, currentUser);
    return EnrollmentRepository.delete(id);
  }
}
