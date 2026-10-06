import prisma from "@/common/db/prisma";
import { OfferingRepository } from "./offering.repository";
import { CreateOfferingInput, UpdateOfferingInput, OfferingQueryInput } from "./offering.schema";
import { ConflictError, NotFoundError, ForbiddenError } from "@/common/errors/http-errors";
import { JwtUserPayload } from "@/common/utils/jwt";

export class OfferingService {
  static async listOfferings(query: OfferingQueryInput) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const termId = query.termId || query.term_id;
    const courseId = query.courseId || query.course_id;
    const instructorId = query.instructorId || query.instructor_id;

    const { offerings, total } = await OfferingRepository.findMany({
      skip,
      take: limit,
      termId,
      courseId,
      instructorId,
      search: query.search,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { offerings, total, page, limit };
  }

  static async getOfferingById(id: string) {
    const offering = await OfferingRepository.findById(id);
    if (!offering) {
      throw new NotFoundError(`Course Offering with ID '${id}' not found`);
    }
    return offering;
  }

  static async getRoster(id: string, user: JwtUserPayload) {
    const offering = await this.getOfferingById(id);

    // Instructor can only view rosters for their assigned course offering
    if (user.role === "INSTRUCTOR" && offering.instructorId !== user.instructorId) {
      throw new ForbiddenError("Instructors can only view student rosters for their assigned course offerings.");
    }

    const roster = await OfferingRepository.getRoster(id);
    return {
      offering: {
        id: offering.id,
        courseCode: offering.course.code,
        courseTitle: offering.course.title,
        termName: offering.term.name,
        sectionCode: offering.sectionCode,
        room: offering.room,
        schedule: offering.schedule,
        enrolledCount: roster.length,
        maxCapacity: offering.maxCapacity,
      },
      roster,
    };
  }

  static async createOffering(input: CreateOfferingInput) {
    // Check course
    const course = await prisma.course.findUnique({ where: { id: input.courseId } });
    if (!course) {
      throw new NotFoundError(`Course with ID '${input.courseId}' not found`);
    }

    // Check term
    const term = await prisma.academicTerm.findUnique({ where: { id: input.termId } });
    if (!term) {
      throw new NotFoundError(`Academic Term with ID '${input.termId}' not found`);
    }

    // Check instructor if provided
    if (input.instructorId) {
      const instructor = await prisma.instructor.findUnique({ where: { id: input.instructorId } });
      if (!instructor) {
        throw new NotFoundError(`Instructor with ID '${input.instructorId}' not found`);
      }
    }

    // Check unique section
    const existing = await OfferingRepository.findUniqueSection(
      input.courseId,
      input.termId,
      input.sectionCode
    );
    if (existing) {
      throw new ConflictError(
        `Section '${input.sectionCode}' already exists for this course in the selected academic term`
      );
    }

    return OfferingRepository.create({
      course: { connect: { id: input.courseId } },
      term: { connect: { id: input.termId } },
      sectionCode: input.sectionCode,
      schedule: input.schedule,
      room: input.room,
      maxCapacity: input.maxCapacity,
      ...(input.instructorId && {
        instructor: { connect: { id: input.instructorId } },
      }),
    });
  }

  static async updateOffering(id: string, input: UpdateOfferingInput) {
    const offering = await this.getOfferingById(id);

    if (input.instructorId) {
      const instructor = await prisma.instructor.findUnique({ where: { id: input.instructorId } });
      if (!instructor) {
        throw new NotFoundError(`Instructor with ID '${input.instructorId}' not found`);
      }
    }

    if (input.sectionCode && input.sectionCode !== offering.sectionCode) {
      const existing = await OfferingRepository.findUniqueSection(
        offering.courseId,
        offering.termId,
        input.sectionCode
      );
      if (existing) {
        throw new ConflictError(
          `Section '${input.sectionCode}' already exists for this course in the selected academic term`
        );
      }
    }

    return OfferingRepository.update(id, {
      ...(input.sectionCode && { sectionCode: input.sectionCode }),
      ...(input.schedule && { schedule: input.schedule }),
      ...(input.room && { room: input.room }),
      ...(input.maxCapacity !== undefined && { maxCapacity: input.maxCapacity }),
      ...(input.instructorId !== undefined && {
        instructor: input.instructorId ? { connect: { id: input.instructorId } } : { disconnect: true },
      }),
    });
  }

  static async deleteOffering(id: string) {
    await this.getOfferingById(id);
    return OfferingRepository.delete(id);
  }
}
