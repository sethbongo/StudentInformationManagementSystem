import prisma from "@/common/db/prisma";
import { Prisma, GradeRemark } from "@prisma/client";

export class GradeRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    offeringId?: string;
    studentId?: string;
    remarks?: GradeRemark;
    isFinalized?: boolean;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.GradeWhereInput = {
      ...(params.offeringId && { enrollment: { courseOfferingId: params.offeringId } }),
      ...(params.studentId && { enrollment: { studentId: params.studentId } }),
      ...(params.remarks && { remarks: params.remarks }),
      ...(params.isFinalized !== undefined && { isFinalized: params.isFinalized }),
    };

    let orderBy: Prisma.GradeOrderByWithRelationInput = { updatedAt: "desc" };
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
        case "numeric_grade":
        case "numericGrade":
        case "grade":
          orderBy = { numericGrade: orderDirection };
          break;
        case "remarks":
          orderBy = { remarks: orderDirection };
          break;
        case "is_finalized":
        case "isFinalized":
          orderBy = { isFinalized: orderDirection };
          break;
        case "student_number":
        case "studentNumber":
          orderBy = { enrollment: { student: { studentNumber: orderDirection } } };
          break;
        case "student_name":
        case "studentName":
          orderBy = { enrollment: { student: { user: { lastName: orderDirection } } } };
          break;
        case "created_at":
        case "createdAt":
          orderBy = { createdAt: orderDirection };
          break;
        case "updated_at":
        case "updatedAt":
        default:
          orderBy = { updatedAt: orderDirection };
          break;
      }
    }

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          enrollment: {
            include: {
              student: {
                include: {
                  user: { select: { firstName: true, lastName: true, email: true } },
                },
              },
              courseOffering: {
                include: {
                  course: true,
                  term: true,
                },
              },
            },
          },
          submittedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.grade.count({ where }),
    ]);

    return { grades, total };
  }

  static async findById(id: string) {
    return prisma.grade.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } },
              },
            },
            courseOffering: {
              include: {
                course: true,
                term: true,
                instructor: true,
              },
            },
          },
        },
        submittedBy: true,
      },
    });
  }

  static async findByEnrollmentId(enrollmentId: string) {
    return prisma.grade.findUnique({
      where: { enrollmentId },
    });
  }

  static async create(data: Prisma.GradeCreateInput) {
    return prisma.grade.create({
      data,
      include: {
        enrollment: {
          include: {
            student: true,
            courseOffering: { include: { course: true } },
          },
        },
      },
    });
  }

  static async update(id: string, data: Prisma.GradeUpdateInput) {
    return prisma.grade.update({
      where: { id },
      data,
      include: {
        enrollment: {
          include: {
            student: true,
            courseOffering: { include: { course: true } },
          },
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.grade.delete({
      where: { id },
    });
  }
}
