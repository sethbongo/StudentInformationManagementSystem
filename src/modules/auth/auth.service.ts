import prisma from "@/common/db/prisma";
import { hashPassword, comparePassword } from "@/common/utils/password";
import { generateToken } from "@/common/utils/jwt";
import { UnauthorizedError, ConflictError, NotFoundError } from "@/common/errors/http-errors";
import { LoginInput, RegisterInput } from "./auth.schema";

export class AuthService {
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        studentProfile: true,
        instructorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact an administrator.");
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentProfile?.id ?? null,
      instructorId: user.instructorProfile?.id ?? null,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateToken(tokenPayload);

    return {
      accessToken,
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentProfile?.id ?? null,
        instructorId: user.instructorProfile?.id ?? null,
      },
    };
  }

  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError("A user with this email address already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });

      if (input.role === "STUDENT") {
        // Fallback or find first program if not provided
        let targetProgramId = input.programId;
        if (!targetProgramId) {
          const firstProgram = await tx.program.findFirst();
          if (firstProgram) {
            targetProgramId = firstProgram.id;
          }
        }

        if (targetProgramId) {
          const studentCount = await tx.student.count();
          const studentNumber =
            input.studentNumber ||
            `STU-${new Date().getFullYear()}-${String(studentCount + 1).padStart(5, "0")}`;

          await tx.student.create({
            data: {
              userId: newUser.id,
              studentNumber,
              programId: targetProgramId,
              yearLevel: 1,
            },
          });
        }
      } else if (input.role === "INSTRUCTOR") {
        const instructorCount = await tx.instructor.count();
        const employeeNumber =
          input.employeeNumber ||
          `EMP-${new Date().getFullYear()}-${String(instructorCount + 1).padStart(4, "0")}`;

        await tx.instructor.create({
          data: {
            userId: newUser.id,
            employeeNumber,
            department: input.department || "General Academics",
          },
        });
      }

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          studentProfile: true,
          instructorProfile: true,
        },
      });
    });

    if (!user) {
      throw new NotFoundError("Failed to retrieve created user");
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentProfile?.id ?? null,
      instructorId: user.instructorProfile?.id ?? null,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateToken(tokenPayload);

    return {
      accessToken,
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentProfile?.id ?? null,
        instructorId: user.instructorProfile?.id ?? null,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        studentProfile: {
          include: {
            program: true,
          },
        },
        instructorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
