import { describe, it, expect, vi } from "vitest";
import { StudentService } from "@/modules/students/student.service";
import { StudentRepository } from "@/modules/students/student.repository";
import { ConflictError, NotFoundError } from "@/common/errors/http-errors";
import prisma from "@/common/db/prisma";

describe("Student Operations & Collection Features", () => {
  describe("Student Creation & Validation", () => {
    it("should prevent creating student with duplicate student number", async () => {
      vi.spyOn(StudentRepository, "findByStudentNumber").mockResolvedValue({
        id: "student-1",
        studentNumber: "2026-00001",
      } as any);

      await expect(
        StudentService.createStudent({
          studentNumber: "2026-00001",
          programId: "00000000-0000-0000-0000-000000000001",
          firstName: "Duplicate",
          lastName: "Student",
        })
      ).rejects.toThrow(ConflictError);

      vi.restoreAllMocks();
    });

    it("should reject student creation when program does not exist", async () => {
      vi.spyOn(StudentRepository, "findByStudentNumber").mockResolvedValue(null);
      vi.spyOn(prisma.program, "findUnique").mockResolvedValue(null);

      await expect(
        StudentService.createStudent({
          studentNumber: "2026-00099",
          programId: "non-existent-program-id",
          firstName: "New",
          lastName: "Student",
        })
      ).rejects.toThrow(NotFoundError);

      vi.restoreAllMocks();
    });

    it("should throw NotFoundError when student does not exist", async () => {
      vi.spyOn(StudentRepository, "findById").mockResolvedValue(null);

      await expect(
        StudentService.getStudentById("non-existent-student-id")
      ).rejects.toThrow(NotFoundError);

      vi.restoreAllMocks();
    });
  });

  describe("Collection Queries & Sorting", () => {
    it("should map pagination parameters and per_page alias correctly", async () => {
      vi.spyOn(StudentRepository, "findMany").mockResolvedValue({
        students: [{ id: "1" }, { id: "2" }] as any,
        total: 50,
      });

      const result = await StudentService.listStudents({
        page: 2,
        per_page: 25,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.total).toBe(50);
      expect(result.students.length).toBe(2);

      vi.restoreAllMocks();
    });
  });
});
