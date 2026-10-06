import prisma from "@/common/db/prisma";
import { Prisma } from "@prisma/client";

export class CourseRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    programId?: string;
    search?: string;
    isActive?: boolean;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.CourseWhereInput = {
      ...(params.programId && { programId: params.programId }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && {
        OR: [
          { code: { contains: params.search, mode: "insensitive" } },
          { title: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    let orderBy: Prisma.CourseOrderByWithRelationInput = { code: "asc" };
    const sortField = params.sortBy || params.sort;
    let orderDirection: "asc" | "desc" = params.sortOrder || "asc";

    if (sortField) {
      let field = sortField;
      if (field.startsWith("-")) {
        field = field.slice(1);
        orderDirection = "desc";
      } else if (field.startsWith("+")) {
        field = field.slice(1);
        orderDirection = "asc";
      }

      switch (field) {
        case "title":
          orderBy = { title: orderDirection };
          break;
        case "units":
          orderBy = { units: orderDirection };
          break;
        case "created_at":
        case "createdAt":
          orderBy = { createdAt: orderDirection };
          break;
        case "code":
        default:
          orderBy = { code: orderDirection };
          break;
      }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          program: { select: { id: true, code: true, name: true } },
          prerequisites: {
            include: {
              prerequisite: {
                select: { id: true, code: true, title: true, units: true },
              },
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  static async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        program: true,
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, code: true, title: true, units: true },
            },
          },
        },
        requiredFor: {
          include: {
            course: {
              select: { id: true, code: true, title: true, units: true },
            },
          },
        },
      },
    });
  }

  static async findByCode(code: string) {
    return prisma.course.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  static async create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
    });
  }

  static async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  static async addPrerequisite(courseId: string, prerequisiteId: string) {
    return prisma.coursePrerequisite.create({
      data: {
        courseId,
        prerequisiteId,
      },
      include: {
        prerequisite: true,
      },
    });
  }

  static async removePrerequisite(courseId: string, prerequisiteId: string) {
    return prisma.coursePrerequisite.delete({
      where: {
        courseId_prerequisiteId: {
          courseId,
          prerequisiteId,
        },
      },
    });
  }
}
