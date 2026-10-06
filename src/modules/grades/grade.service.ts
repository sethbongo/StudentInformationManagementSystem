import prisma from "@/common/db/prisma";
import { GradeRepository } from "./grade.repository";
import { SubmitGradeInput, UpdateGradeInput, GradeQueryInput } from "./grade.schema";
import { ConflictError, NotFoundError, ForbiddenError } from "@/common/errors/http-errors";
import { JwtUserPayload } from "@/common/utils/jwt";
import { GradeRemark } from "@prisma/client";

export class GradeService {
  static async listGrades(query: GradeQueryInput) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const offeringId = query.offeringId || query.offering_id;
    const studentId = query.studentId || query.student_id;
    const isFinalizedParam = query.isFinalized || query.is_finalized;

    const isFinalizedBool =
      isFinalizedParam === "true" ? true : isFinalizedParam === "false" ? false : undefined;

    const { grades, total } = await GradeRepository.findMany({
      skip,
      take: limit,
      offeringId,
      studentId,
      remarks: query.remarks as GradeRemark,
      isFinalized: isFinalizedBool,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { grades, total, page, limit };
  }

  static async getGradeById(id: string, currentUser: JwtUserPayload) {
    const grade = await GradeRepository.findById(id);
    if (!grade) {
      throw new NotFoundError(`Grade record with ID '${id}' not found`);
    }

    // Role security:
    // If student, can only view own grade
    if (currentUser.role === "STUDENT" && grade.enrollment.studentId !== currentUser.studentId) {
      throw new ForbiddenError("You can only view your own grades");
    }

    // If instructor, can only view grades for their offerings
    if (
      currentUser.role === "INSTRUCTOR" &&
      grade.enrollment.courseOffering.instructorId !== currentUser.instructorId
    ) {
      throw new ForbiddenError("Instructors can only view grades for their assigned course offerings");
    }

    return grade;
  }

  static async submitGrade(input: SubmitGradeInput, currentUser: JwtUserPayload) {
    const enrollmentId = (input.enrollmentId || input.enrollment_id)!;

    // 1. Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        courseOffering: true,
        grade: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundError(`Enrollment with ID '${enrollmentId}' not found`);
    }

    if (enrollment.grade) {
      throw new ConflictError("A grade has already been submitted for this enrollment. Use PATCH to update.");
    }

    // 2. Instructor check: must be assigned to this offering
    const isStaff = currentUser.role === "ADMINISTRATOR" || currentUser.role === "REGISTRAR";
    if (currentUser.role === "INSTRUCTOR" && enrollment.courseOffering.instructorId !== currentUser.instructorId) {
      throw new ForbiddenError("You are not the assigned instructor for this course offering.");
    }

    const midtermGrade = input.midtermGrade ?? input.midterm_grade ?? null;
    const finalGrade = input.finalGrade ?? input.final_grade ?? null;
    const numericGrade = input.numericGrade ?? input.numeric_grade ?? finalGrade ?? null;

    // Determine remarks based on standard Philippine collegiate scale if not custom
    let derivedRemarks = input.remarks;
    if (numericGrade !== null && numericGrade !== undefined) {
      if (numericGrade <= 3.0) {
        derivedRemarks = "PASSED";
      } else {
        derivedRemarks = "FAILED";
      }
    }

    return GradeRepository.create({
      enrollment: { connect: { id: enrollmentId } },
      numericGrade: numericGrade !== null ? numericGrade : null,
      midtermGrade: midtermGrade !== null ? midtermGrade : null,
      finalGrade: finalGrade !== null ? finalGrade : null,
      letterGrade: input.letterGrade ?? null,
      remarks: derivedRemarks,
      isFinalized: input.isFinalized,
      submittedAt: new Date(),
      submittedBy: { connect: { id: currentUser.sub } },
    });
  }

  static async updateGrade(id: string, input: UpdateGradeInput, currentUser: JwtUserPayload) {
    const existing = await this.getGradeById(id, currentUser);

    // Instructor cannot edit a finalized grade without Admin/Registrar override
    if (currentUser.role === "INSTRUCTOR") {
      if (existing.isFinalized) {
        throw new ForbiddenError(
          "This grade has already been finalized and locked. Contact the Registrar to request changes."
        );
      }
    }

    const midtermGrade = input.midtermGrade ?? input.midterm_grade;
    const finalGrade = input.finalGrade ?? input.final_grade;
    const numericGrade = input.numericGrade ?? input.numeric_grade ?? finalGrade;

    let derivedRemarks = input.remarks || existing.remarks;
    if (numericGrade !== undefined && numericGrade !== null) {
      if (numericGrade <= 3.0) {
        derivedRemarks = "PASSED";
      } else {
        derivedRemarks = "FAILED";
      }
    }

    return GradeRepository.update(id, {
      ...(numericGrade !== undefined && { numericGrade: numericGrade !== null ? numericGrade : null }),
      ...(midtermGrade !== undefined && { midtermGrade: midtermGrade !== null ? midtermGrade : null }),
      ...(finalGrade !== undefined && { finalGrade: finalGrade !== null ? finalGrade : null }),
      ...(input.letterGrade !== undefined && { letterGrade: input.letterGrade }),
      ...(derivedRemarks && { remarks: derivedRemarks as GradeRemark }),
      ...(input.isFinalized !== undefined && { isFinalized: input.isFinalized }),
      submittedAt: new Date(),
      submittedBy: { connect: { id: currentUser.sub } },
    });
  }

  static async deleteGrade(id: string, currentUser: JwtUserPayload) {
    const isStaff = currentUser.role === "ADMINISTRATOR" || currentUser.role === "REGISTRAR";
    if (!isStaff) {
      throw new ForbiddenError("Only Administrators and Registrars can delete grade records.");
    }

    await this.getGradeById(id, currentUser);
    return GradeRepository.delete(id);
  }
}
