import prisma from "@/common/db/prisma";
import { Prisma, EnrollmentStatus } from "@prisma/client";

export class EnrollmentRepository {
  static async findMany(params: {
    skip: number;
    take: number;
    studentId?: string;
    courseOfferingId?: string;
    termId?: string;
    status?: EnrollmentStatus;
    sort?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: Prisma.EnrollmentWhereInput = {
      ...(params.studentId && { studentId: params.studentId }),
      ...(params.courseOfferingId && { courseOfferingId: params.courseOfferingId }),
      ...(params.status && { status: params.status }),
      ...(params.termId && { courseOffering: { termId: params.termId } }),
    };

    let orderBy: Prisma.EnrollmentOrderByWithRelationInput = { enrolledAt: "desc" };
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
        case "status":
          orderBy = { status: orderDirection };
          break;
        case "student_number":
        case "studentNumber":
          orderBy = { student: { studentNumber: orderDirection } };
          break;
        case "student_name":
        case "studentName":
          orderBy = { student: { user: { lastName: orderDirection } } };
          break;
        case "course_code":
        case "courseCode":
          orderBy = { courseOffering: { course: { code: orderDirection } } };
          break;
        case "enrolled_at":
        case "enrolledAt":
        default:
          orderBy = { enrolledAt: orderDirection };
          break;
      }
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
              program: { select: { code: true, name: true } },
            },
          },
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
      }),
      prisma.enrollment.count({ where }),
    ]);

    return { enrollments, total };
  }

  static async findById(id: string) {
    return prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            program: true,
          },
        },
        courseOffering: {
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
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        grade: true,
      },
    });
  }

  static async findByStudentAndOffering(studentId: string, courseOfferingId: string) {
    return prisma.enrollment.findUnique({
      where: {
        studentId_courseOfferingId: {
          studentId,
          courseOfferingId,
        },
      },
    });
  }

  static async create(data: Prisma.EnrollmentCreateInput) {
    return prisma.enrollment.create({
      data,
      include: {
        courseOffering: {
          include: {
            course: true,
            term: true,
          },
        },
        student: true,
      },
    });
  }

  static async updateStatus(id: string, status: EnrollmentStatus) {
    return prisma.enrollment.update({
      where: { id },
      data: { status },
      include: {
        courseOffering: true,
        grade: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.enrollment.delete({
      where: { id },
    });
  }
}
