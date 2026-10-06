import { CourseRepository } from "./course.repository";
import { CreateCourseInput, UpdateCourseInput, CourseQueryInput } from "./course.schema";
import { ConflictError, NotFoundError, BadRequestError } from "@/common/errors/http-errors";

export class CourseService {
  static async listCourses(query: CourseQueryInput) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const programId = query.programId || query.program_id;
    const isActiveBool = query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;

    const { courses, total } = await CourseRepository.findMany({
      skip,
      take: limit,
      programId,
      search: query.search,
      isActive: isActiveBool,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { courses, total, page, limit };
  }

  static async getCourseById(id: string) {
    const course = await CourseRepository.findById(id);
    if (!course) {
      throw new NotFoundError(`Course with ID '${id}' not found`);
    }
    return course;
  }

  static async createCourse(input: CreateCourseInput) {
    const existing = await CourseRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError(`A course with code '${input.code.toUpperCase()}' already exists`);
    }

    return CourseRepository.create({
      code: input.code.toUpperCase(),
      title: input.title,
      description: input.description,
      units: input.units,
      isActive: input.isActive,
      ...(input.programId && {
        program: { connect: { id: input.programId } },
      }),
      ...(input.prerequisiteCourseIds && input.prerequisiteCourseIds.length > 0 && {
        prerequisites: {
          create: input.prerequisiteCourseIds.map((preId) => ({
            prerequisite: { connect: { id: preId } },
          })),
        },
      }),
    });
  }

  static async updateCourse(id: string, input: UpdateCourseInput) {
    await this.getCourseById(id);

    if (input.code) {
      const existing = await CourseRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A course with code '${input.code.toUpperCase()}' already exists`);
      }
    }

    return CourseRepository.update(id, {
      ...(input.code && { code: input.code.toUpperCase() }),
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.units !== undefined && { units: input.units }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.programId !== undefined && {
        program: input.programId ? { connect: { id: input.programId } } : { disconnect: true },
      }),
    });
  }

  static async deleteCourse(id: string) {
    await this.getCourseById(id);
    return CourseRepository.delete(id);
  }

  static async addPrerequisite(courseId: string, prerequisiteId: string) {
    if (courseId === prerequisiteId) {
      throw new BadRequestError("A course cannot be a prerequisite of itself");
    }

    await this.getCourseById(courseId);
    await this.getCourseById(prerequisiteId);

    // Check cyclic dependency
    const reversePrereq = await CourseRepository.findById(prerequisiteId);
    const hasCycle = reversePrereq?.prerequisites.some((p) => p.prerequisiteId === courseId);
    if (hasCycle) {
      throw new BadRequestError("Adding this prerequisite would create a cyclic dependency");
    }

    try {
      return await CourseRepository.addPrerequisite(courseId, prerequisiteId);
    } catch {
      throw new ConflictError("This prerequisite relationship already exists");
    }
  }

  static async removePrerequisite(courseId: string, prerequisiteId: string) {
    await this.getCourseById(courseId);
    return CourseRepository.removePrerequisite(courseId, prerequisiteId);
  }
}
