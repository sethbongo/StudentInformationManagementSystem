import prisma from "@/common/db/prisma";
import { Prisma } from "@prisma/client";

export class ProgramRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    department?: string;
    search?: string;
    isActive?: boolean;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.ProgramWhereInput = {
      ...(params.department && { department: { contains: params.department, mode: "insensitive" } }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && {
        OR: [
          { code: { contains: params.search, mode: "insensitive" } },
          { name: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    let orderBy: Prisma.ProgramOrderByWithRelationInput = { code: "asc" };
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
        case "name":
          orderBy = { name: orderDirection };
          break;
        case "department":
          orderBy = { department: orderDirection };
          break;
        case "units":
        case "totalUnitsRequired":
          orderBy = { totalUnitsRequired: orderDirection };
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

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          _count: {
            select: { students: true, courses: true },
          },
        },
      }),
      prisma.program.count({ where }),
    ]);

    return { programs, total };
  }

  static async findById(id: string) {
    return prisma.program.findUnique({
      where: { id },
      include: {
        courses: {
          where: { isActive: true },
          orderBy: { code: "asc" },
        },
        _count: {
          select: { students: true },
        },
      },
    });
  }

  static async findByCode(code: string) {
    return prisma.program.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  static async create(data: Prisma.ProgramCreateInput) {
    return prisma.program.create({ data });
  }

  static async update(id: string, data: Prisma.ProgramUpdateInput) {
    return prisma.program.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.program.delete({
      where: { id },
    });
  }
}
