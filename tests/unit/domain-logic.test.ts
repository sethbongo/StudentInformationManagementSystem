import { describe, it, expect, vi } from "vitest";
import { CourseService } from "@/modules/courses/course.service";
import { CourseRepository } from "@/modules/courses/course.repository";
import { BadRequestError } from "@/common/errors/http-errors";

describe("Course Domain Logic", () => {
  it("should prevent adding a course as a prerequisite to itself", async () => {
    const courseId = "00000000-0000-0000-0000-000000000001";
    await expect(CourseService.addPrerequisite(courseId, courseId)).rejects.toThrow(BadRequestError);
  });

  it("should detect cyclic prerequisite dependencies", async () => {
    const courseA = "00000000-0000-0000-0000-000000000001";
    const courseB = "00000000-0000-0000-0000-000000000002";

    // Mock findById to simulate courseB already having courseA as a prerequisite
    vi.spyOn(CourseRepository, "findById").mockImplementation(async (id: string) => {
      if (id === courseA) {
        return {
          id: courseA,
          code: "CS101",
          title: "Course A",
          description: null,
          units: 3,
          programId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          program: null,
          prerequisites: [],
          requiredFor: [],
        };
      }
      if (id === courseB) {
        return {
          id: courseB,
          code: "CS102",
          title: "Course B",
          description: null,
          units: 3,
          programId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          program: null,
          prerequisites: [
            {
              courseId: courseB,
              prerequisiteId: courseA,
              createdAt: new Date(),
              prerequisite: { id: courseA, code: "CS101", title: "Course A", units: 3 },
            },
          ],
          requiredFor: [],
        };
      }
      return null;
    });

    // Attempting to add courseB as a prerequisite to courseA should throw BadRequestError (cyclic dependency)
    await expect(CourseService.addPrerequisite(courseA, courseB)).rejects.toThrow(
      "Adding this prerequisite would create a cyclic dependency"
    );

    vi.restoreAllMocks();
  });
});
