import { Injectable } from "@nestjs/common";
import { AuthorsRepository } from "./authors.repository";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";

@Injectable()
export class AuthorsService {
  constructor(private authorsRepository: AuthorsRepository) {}

  async create(createAuthorDto: CreateAuthorDto) {
    return this.authorsRepository.create(createAuthorDto);
  }

  async findAll(page?: number, limit?: number, includeDeleted: boolean = false): Promise<any> {
    const whereClause: any = includeDeleted ? {} : { deleted_at: null };
    if (page !== undefined && limit !== undefined && page > 0 && limit > 0) {
      const offset = (page - 1) * limit;

      const [authors, total] = await Promise.all([
        this.authorsRepository.findAll({
          where: whereClause,
          skip: offset,
          take: limit,
          orderBy: { author_id: "asc" },
        }),
        this.authorsRepository.count(whereClause),
      ]);

      return {
        authors,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    }

    const authors = await this.authorsRepository.findAll({
      where: whereClause,
      orderBy: { author_id: "asc" },
    });
    return {
      authors: authors,
      total: authors.length,
      page: 1,
      limit: authors.length,
      totalPages: 1,
    };
  }

  async findOne(id: number) {
    return this.authorsRepository.findById(id);
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    const exists = await this.authorsRepository.findById(id);
    if (!exists) {
      throw new Error("Autor não encontrado");
    }
    return this.authorsRepository.update(id, updateAuthorDto);
  }

  async remove(id: number): Promise<void> {
    const author = await this.authorsRepository.findById(id);

    if (!author) {
      throw new Error('Autor não encontrado');
    }

    await this.authorsRepository.softDelete(id);
  }

  async count(): Promise<number> {
    return this.authorsRepository.count({
      deleted_at: null,
    });
  }

  async updatePhoto(id: number, photo: string): Promise<void> {
    await this.authorsRepository.updatePhoto(id, photo);
  }

  async restore(id: number): Promise<void> {
    const author = await this.authorsRepository.findById(id);

    if (!author) {
      throw new Error('Autor não encontrado');
    }

    await this.authorsRepository.restore(id);
  }
}
