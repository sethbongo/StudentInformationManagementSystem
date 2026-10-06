import prisma from "@/common/db/prisma";
import { Prisma, StudentStatus } from "@prisma/client";

export class StudentRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    programId?: string;
    yearLevel?: number;
    status?: StudentStatus;
    search?: string;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.StudentWhereInput = {
      ...(params.programId && { programId: params.programId }),
      ...(params.yearLevel && { yearLevel: params.yearLevel }),
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { studentNumber: { contains: params.search, mode: "insensitive" } },
          { user: { firstName: { contains: params.search, mode: "insensitive" } } },
          { user: { lastName: { contains: params.search, mode: "insensitive" } } },
          { user: { email: { contains: params.search, mode: "insensitive" } } },
        ],
      }),
    };

    // Dynamic sorting
    let orderBy: Prisma.StudentOrderByWithRelationInput = { studentNumber: "asc" };
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
        case "last_name":
        case "lastName":
          orderBy = { user: { lastName: orderDirection } };
          break;
        case "first_name":
        case "firstName":
          orderBy = { user: { firstName: orderDirection } };
          break;
        case "email":
          orderBy = { user: { email: orderDirection } };
          break;
        case "year_level":
        case "yearLevel":
          orderBy = { yearLevel: orderDirection };
          break;
        case "status":
          orderBy = { status: orderDirection };
          break;
        case "created_at":
        case "createdAt":
          orderBy = { createdAt: orderDirection };
          break;
        case "student_number":
        case "studentNumber":
        default:
          orderBy = { studentNumber: orderDirection };
          break;
      }
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
          },
          program: {
            select: { id: true, code: true, name: true, department: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  static async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
        },
        program: true,
      },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: { program: true },
    });
  }

  static async findByStudentNumber(studentNumber: string) {
    return prisma.student.findUnique({
      where: { studentNumber },
      include: { user: true, program: true },
    });
  }

  static async getAcademicHistory(studentId: string) {
    return prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        program: true,
        enrollments: {
          include: {
            courseOffering: {
              include: {
                course: true,
                term: true,
                instructor: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
            grade: true,
          },
          orderBy: {
            courseOffering: {
              term: { startDate: "asc" },
            },
          },
        },
      },
    });
  }

  static async create(data: Prisma.StudentCreateInput) {
    return prisma.student.create({
      data,
      include: {
        user: true,
        program: true,
      },
    });
  }

  static async update(id: string, data: Prisma.StudentUpdateInput) {
    return prisma.student.update({
      where: { id },
      data,
      include: {
        user: true,
        program: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.student.delete({
      where: { id },
    });
  }
}
