import { TermRepository } from "./term.repository";
import { CreateTermInput, UpdateTermInput, TermQueryInput } from "./term.schema";
import { ConflictError, NotFoundError, BadRequestError } from "@/common/errors/http-errors";

export class TermService {
  static async listTerms(query: TermQueryInput) {
    const page = query.page || 1;
    const limit = query.per_page || query.limit || 10;
    const skip = (page - 1) * limit;

    const isCurrentBool = query.isCurrent === "true" ? true : query.isCurrent === "false" ? false : undefined;
    const isEnrollmentOpenBool =
      query.isEnrollmentOpen === "true" ? true : query.isEnrollmentOpen === "false" ? false : undefined;

    const { terms, total } = await TermRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      isCurrent: isCurrentBool,
      isEnrollmentOpen: isEnrollmentOpenBool,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return { terms, total, page, limit };
  }

  static async getTermById(id: string) {
    const term = await TermRepository.findById(id);
    if (!term) {
      throw new NotFoundError(`Academic Term with ID '${id}' not found`);
    }
    return term;
  }

  static async getCurrentTerm() {
    const term = await TermRepository.findCurrent();
    if (!term) {
      throw new NotFoundError("No active current academic term is configured");
    }
    return term;
  }

  static async createTerm(input: CreateTermInput) {
    const existing = await TermRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError(`An academic term with code '${input.code.toUpperCase()}' already exists`);
    }

    if (input.isCurrent) {
      await TermRepository.unsetAllCurrentExcept();
    }

    return TermRepository.create({
      code: input.code.toUpperCase(),
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      isEnrollmentOpen: input.isEnrollmentOpen,
      isCurrent: input.isCurrent,
    });
  }

  static async updateTerm(id: string, input: UpdateTermInput) {
    const term = await this.getTermById(id);

    if (input.code) {
      const existing = await TermRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`An academic term with code '${input.code.toUpperCase()}' already exists`);
      }
    }

    const startDate = input.startDate || term.startDate;
    const endDate = input.endDate || term.endDate;
    if (endDate <= startDate) {
      throw new BadRequestError("End date must be after start date");
    }

    if (input.isCurrent) {
      await TermRepository.unsetAllCurrentExcept(id);
    }

    return TermRepository.update(id, {
      ...(input.code && { code: input.code.toUpperCase() }),
      ...(input.name && { name: input.name }),
      ...(input.startDate && { startDate: input.startDate }),
      ...(input.endDate && { endDate: input.endDate }),
      ...(input.isEnrollmentOpen !== undefined && { isEnrollmentOpen: input.isEnrollmentOpen }),
      ...(input.isCurrent !== undefined && { isCurrent: input.isCurrent }),
    });
  }

  static async deleteTerm(id: string) {
    await this.getTermById(id);
    return TermRepository.delete(id);
  }
}
