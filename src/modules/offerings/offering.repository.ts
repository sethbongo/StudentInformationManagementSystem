import prisma from "@/common/db/prisma";
import { Prisma } from "@prisma/client";

export class OfferingRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    termId?: string;
    courseId?: string;
    instructorId?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.CourseOfferingWhereInput = {
      ...(params.termId && { termId: params.termId }),
      ...(params.courseId && { courseId: params.courseId }),
      ...(params.instructorId && { instructorId: params.instructorId }),
      ...(params.search && {
        OR: [
          { sectionCode: { contains: params.search, mode: "insensitive" } },
          { room: { contains: params.search, mode: "insensitive" } },
          { course: { code: { contains: params.search, mode: "insensitive" } } },
          { course: { title: { contains: params.search, mode: "insensitive" } } },
        ],
      }),
    };

    let orderBy: any = [{ term: { startDate: "desc" } }, { course: { code: "asc" } }, { sectionCode: "asc" }];
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
        case "section":
        case "sectionCode":
          orderBy = { sectionCode: orderDirection };
          break;
        case "room":
          orderBy = { room: orderDirection };
          break;
        case "capacity":
        case "maxCapacity":
          orderBy = { maxCapacity: orderDirection };
          break;
        case "course_code":
        case "courseCode":
          orderBy = { course: { code: orderDirection } };
          break;
        case "created_at":
        case "createdAt":
          orderBy = { createdAt: orderDirection };
          break;
        default:
          orderBy = { sectionCode: orderDirection };
          break;
      }
    }

    const [offerings, total] = await Promise.all([
      prisma.courseOffering.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          course: { select: { id: true, code: true, title: true, units: true } },
          term: { select: { id: true, code: true, name: true, isEnrollmentOpen: true, isCurrent: true } },
          instructor: {
            select: {
              id: true,
              employeeNumber: true,
              department: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      }),
      prisma.courseOffering.count({ where }),
    ]);

    return { offerings, total };
  }

  static async findById(id: string) {
    return prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            prerequisites: {
              include: { prerequisite: true },
            },
          },
        },
        term: true,
        instructor: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  static async findUniqueSection(courseId: string, termId: string, sectionCode: string) {
    return prisma.courseOffering.findUnique({
      where: {
        courseId_termId_sectionCode: {
          courseId,
          termId,
          sectionCode,
        },
      },
    });
  }

  static async getRoster(offeringId: string) {
    return prisma.enrollment.findMany({
      where: { courseOfferingId: offeringId },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            program: { select: { code: true, name: true } },
          },
        },
        grade: true,
      },
      orderBy: { student: { user: { lastName: "asc" } } },
    });
  }

  static async create(data: Prisma.CourseOfferingCreateInput) {
    return prisma.courseOffering.create({
      data,
      include: {
        course: true,
        term: true,
        instructor: { include: { user: true } },
      },
    });
  }

  static async update(id: string, data: Prisma.CourseOfferingUpdateInput) {
    return prisma.courseOffering.update({
      where: { id },
      data,
      include: {
        course: true,
        term: true,
        instructor: { include: { user: true } },
      },
    });
  }

  static async delete(id: string) {
    return prisma.courseOffering.delete({
      where: { id },
    });
  }
}
