import { ProgramRepository } from "./program.repository";
import { CreateProgramInput, UpdateProgramInput, ProgramQueryInput } from "./program.schema";
import { ConflictError, NotFoundError } from "@/common/errors/http-errors";

export class ProgramService {
  static async listPrograms(query: ProgramQueryInput) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const isActiveBool = query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;

    const { programs, total } = await ProgramRepository.findMany({
      skip,
      take: limit,
      department: query.department,
      search: query.search,
      isActive: isActiveBool,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { programs, total, page, limit };
  }

  static async getProgramById(id: string) {
    const program = await ProgramRepository.findById(id);
    if (!program) {
      throw new NotFoundError(`Academic Program with ID '${id}' not found`);
    }
    return program;
  }

  static async createProgram(input: CreateProgramInput) {
    const existing = await ProgramRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError(`A program with code '${input.code.toUpperCase()}' already exists`);
    }

    return ProgramRepository.create({
      code: input.code.toUpperCase(),
      name: input.name,
      department: input.department,
      totalUnitsRequired: input.totalUnitsRequired,
      isActive: input.isActive,
    });
  }

  static async updateProgram(id: string, input: UpdateProgramInput) {
    await this.getProgramById(id);

    if (input.code) {
      const existing = await ProgramRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A program with code '${input.code.toUpperCase()}' already exists`);
      }
    }

    return ProgramRepository.update(id, {
      ...(input.code && { code: input.code.toUpperCase() }),
      ...(input.name && { name: input.name }),
      ...(input.department && { department: input.department }),
      ...(input.totalUnitsRequired !== undefined && { totalUnitsRequired: input.totalUnitsRequired }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });
  }

  static async deleteProgram(id: string) {
    await this.getProgramById(id);
    return ProgramRepository.delete(id);
  }
}
