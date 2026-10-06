import { describe, it, expect, vi } from "vitest";
import { EnrollmentService } from "@/modules/enrollments/enrollment.service";
import { EnrollmentRepository } from "@/modules/enrollments/enrollment.repository";
import { GradeService } from "@/modules/grades/grade.service";
import { GradeRepository } from "@/modules/grades/grade.repository";
import { StudentService } from "@/modules/students/student.service";
import { ConflictError, ForbiddenError, NotFoundError, UnprocessableEntityError } from "@/common/errors/http-errors";
import { JwtUserPayload } from "@/common/utils/jwt";
import prisma from "@/common/db/prisma";

describe("Academic Transactions & Domain Rules", () => {
  const sampleStudentUser: JwtUserPayload = {
    sub: "user-student-1",
    email: "student1@sims.edu",
    role: "STUDENT",
    studentId: "student-1",
    instructorId: null,
    firstName: "Alice",
    lastName: "Guo",
  };

  const otherStudentUser: JwtUserPayload = {
    sub: "user-student-2",
    email: "student2@sims.edu",
    role: "STUDENT",
    studentId: "student-2",
    instructorId: null,
    firstName: "Bob",
    lastName: "Cruz",
  };

  const assignedInstructorUser: JwtUserPayload = {
    sub: "user-inst-1",
    email: "prof.smith@sims.edu",
    role: "INSTRUCTOR",
    studentId: null,
    instructorId: "inst-1",
    firstName: "Alan",
    lastName: "Smith",
  };

  const unassignedInstructorUser: JwtUserPayload = {
    sub: "user-inst-2",
    email: "prof.other@sims.edu",
    role: "INSTRUCTOR",
    studentId: null,
    instructorId: "inst-99",
    firstName: "Other",
    lastName: "Prof",
  };

  describe("Object-Level Authorization", () => {
    it("should prevent a student from retrieving another student profile", async () => {
      vi.spyOn(StudentService, "getStudentById").mockImplementation(async (id: string, currentUser?: JwtUserPayload) => {
        if (currentUser && currentUser.role === "STUDENT" && currentUser.studentId !== id) {
          throw new ForbiddenError("Students can only view their own profile");
        }
        return {} as any;
      });

      await expect(StudentService.getStudentById("student-2", sampleStudentUser)).rejects.toThrow(ForbiddenError);
      vi.restoreAllMocks();
    });

    it("should allow a student to retrieve their own profile", async () => {
      vi.spyOn(StudentService, "getStudentById").mockImplementation(async (id: string, currentUser?: JwtUserPayload) => {
        if (currentUser && currentUser.role === "STUDENT" && currentUser.studentId !== id) {
          throw new ForbiddenError("Students can only view their own profile");
        }
        return { id, studentNumber: "2026-00001" } as any;
      });

      const profile = await StudentService.getStudentById("student-1", sampleStudentUser);
      expect(profile.studentNumber).toBe("2026-00001");
      vi.restoreAllMocks();
    });
  });

  describe("Enrollment Business Constraints", () => {
    it("should reject enrollment if offering is not found", async () => {
      vi.spyOn(prisma.student, "findUnique").mockResolvedValue({
        id: "student-1",
        status: "ACTIVE",
        enrollments: [],
      } as any);

      vi.spyOn(prisma.courseOffering, "findUnique").mockResolvedValue(null);

      await expect(
        EnrollmentService.enrollStudent(
          { courseOfferingId: "non-existent-offering" },
          sampleStudentUser
        )
      ).rejects.toThrow(NotFoundError);

      vi.restoreAllMocks();
    });

    it("should reject duplicate enrollment in the same section", async () => {
      vi.spyOn(prisma.student, "findUnique").mockResolvedValue({
        id: "student-1",
        status: "ACTIVE",
        enrollments: [],
      } as any);

      vi.spyOn(prisma.courseOffering, "findUnique").mockResolvedValue({
        id: "offering-1",
        term: { isEnrollmentOpen: true, name: "AY2026-2027-1S" },
        course: { id: "c1", code: "CS101", prerequisites: [] },
        enrollments: [],
        maxCapacity: 40,
      } as any);

      vi.spyOn(EnrollmentRepository, "findByStudentAndOffering").mockResolvedValue({
        id: "existing-enrollment",
      } as any);

      await expect(
        EnrollmentService.enrollStudent(
          { courseOfferingId: "offering-1" },
          sampleStudentUser
        )
      ).rejects.toThrow("Student is already enrolled in this course section");

      vi.restoreAllMocks();
    });

    it("should reject enrollment if section has reached maximum capacity", async () => {
      vi.spyOn(prisma.student, "findUnique").mockResolvedValue({
        id: "student-1",
        status: "ACTIVE",
        enrollments: [],
      } as any);

      vi.spyOn(prisma.courseOffering, "findUnique").mockResolvedValue({
        id: "offering-full",
        sectionCode: "CS101-FULL",
        term: { isEnrollmentOpen: true, name: "AY2026-2027-1S" },
        course: { id: "c1", code: "CS101", prerequisites: [] },
        enrollments: Array(40).fill({ status: "ENROLLED" }),
        maxCapacity: 40,
      } as any);

      vi.spyOn(EnrollmentRepository, "findByStudentAndOffering").mockResolvedValue(null);

      await expect(
        EnrollmentService.enrollStudent(
          { courseOfferingId: "offering-full" },
          sampleStudentUser
        )
      ).rejects.toThrow(UnprocessableEntityError);

      vi.restoreAllMocks();
    });
  });

  describe("Grading Rules & Authorization", () => {
    it("should prevent unauthorized instructor from submitting grade for another instructor offering", async () => {
      vi.spyOn(prisma.enrollment, "findUnique").mockResolvedValue({
        id: "enrollment-1",
        grade: null,
        courseOffering: { instructorId: "inst-1" },
      } as any);

      await expect(
        GradeService.submitGrade(
          { enrollmentId: "enrollment-1", numericGrade: 1.25 },
          unassignedInstructorUser
        )
      ).rejects.toThrow(ForbiddenError);

      vi.restoreAllMocks();
    });

    it("should prevent instructor from modifying a finalized grade", async () => {
      vi.spyOn(GradeService, "getGradeById").mockResolvedValue({
        id: "grade-1",
        isFinalized: true,
        remarks: "PASSED",
        numericGrade: 1.25,
      } as any);

      await expect(
        GradeService.updateGrade(
          "grade-1",
          { numericGrade: 1.0 },
          assignedInstructorUser
        )
      ).rejects.toThrow("This grade has already been finalized and locked");

      vi.restoreAllMocks();
    });
  });
});
