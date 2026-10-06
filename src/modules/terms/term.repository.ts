import prisma from "@/common/db/prisma";
import { Prisma } from "@prisma/client";

export class TermRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    search?: string;
    isCurrent?: boolean;
    isEnrollmentOpen?: boolean;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.AcademicTermWhereInput = {
      ...(params.isCurrent !== undefined && { isCurrent: params.isCurrent }),
      ...(params.isEnrollmentOpen !== undefined && { isEnrollmentOpen: params.isEnrollmentOpen }),
      ...(params.search && {
        OR: [
          { code: { contains: params.search, mode: "insensitive" } },
          { name: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    let orderBy: Prisma.AcademicTermOrderByWithRelationInput = { startDate: "desc" };
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
        case "code":
          orderBy = { code: orderDirection };
          break;
        case "name":
          orderBy = { name: orderDirection };
          break;
        case "end_date":
        case "endDate":
          orderBy = { endDate: orderDirection };
          break;
        case "start_date":
        case "startDate":
        default:
          orderBy = { startDate: orderDirection };
          break;
      }
    }

    const [terms, total] = await Promise.all([
      prisma.academicTerm.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          _count: {
            select: { offerings: true },
          },
        },
      }),
      prisma.academicTerm.count({ where }),
    ]);

    return { terms, total };
  }

  static async findById(id: string) {
    return prisma.academicTerm.findUnique({
      where: { id },
      include: {
        offerings: {
          include: {
            course: true,
            instructor: { include: { user: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
  }

  static async findByCode(code: string) {
    return prisma.academicTerm.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  static async findCurrent() {
    return prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });
  }

  static async create(data: Prisma.AcademicTermCreateInput) {
    return prisma.academicTerm.create({ data });
  }

  static async update(id: string, data: Prisma.AcademicTermUpdateInput) {
    return prisma.academicTerm.update({
      where: { id },
      data,
    });
  }

  static async unsetAllCurrentExcept(id?: string) {
    return prisma.academicTerm.updateMany({
      where: {
        ...(id && { NOT: { id } }),
        isCurrent: true,
      },
      data: { isCurrent: false },
    });
  }

  static async delete(id: string) {
    return prisma.academicTerm.delete({
      where: { id },
    });
  }
}
