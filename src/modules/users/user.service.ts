import { UserRepository } from "./user.repository";
import { CreateUserInput, UpdateUserInput, UserQueryInput } from "./user.schema";
import { hashPassword } from "@/common/utils/password";
import { ConflictError, NotFoundError } from "@/common/errors/http-errors";

export class UserService {
  static async listUsers(query: UserQueryInput) {
    const { page, limit, role, search } = query;
    const skip = (page - 1) * limit;

    const { users, total } = await UserRepository.findMany({
      skip,
      take: limit,
      role,
      search,
    });

    return { users, total, page, limit };
  }

  static async getUserById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }
    return user;
  }

  static async createUser(input: CreateUserInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("A user with this email address already exists");
    }

    const passwordHash = await hashPassword(input.password);

    return UserRepository.create({
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: input.isActive,
    });
  }

  static async updateUser(id: string, input: UpdateUserInput) {
    await this.getUserById(id);

    if (input.email) {
      const existing = await UserRepository.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new ConflictError("A user with this email address already exists");
      }
    }

    const updateData: Record<string, unknown> = {
      ...(input.email && { email: input.email.toLowerCase() }),
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.role && { role: input.role }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    };

    if (input.password) {
      updateData.passwordHash = await hashPassword(input.password);
    }

    return UserRepository.update(id, updateData);
  }

  static async deleteUser(id: string) {
    await this.getUserById(id);
    return UserRepository.delete(id);
  }
}
