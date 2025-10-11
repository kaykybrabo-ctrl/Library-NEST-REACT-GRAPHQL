import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    return this.prisma.author.create({
      data: createAuthorDto,
    });
  }

  async findAll(page?: number, limit?: number, includeDeleted: boolean = false): Promise<any> {
    const whereClause: any = includeDeleted ? {} : { deleted_at: null };
    if (page !== undefined && limit !== undefined && page > 0 && limit > 0) {
      const offset = (page - 1) * limit;

      const [authors, total] = await Promise.all([
        this.prisma.author.findMany({
          where: whereClause,
          skip: offset,
          take: limit,
          orderBy: { author_id: "asc" },
        }),
        this.prisma.author.count({ where: whereClause }),
      ]);

      return {
        authors,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    }

    const authors = await this.prisma.author.findMany({
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
    return this.prisma.author.findFirst({
      where: { author_id: id },
    });
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    const exists = await this.prisma.author.findFirst({ where: { author_id: id } });
    if (!exists) {
      throw new Error("Autor não encontrado");
    }
    return this.prisma.author.update({
      where: { author_id: id },
      data: updateAuthorDto,
    });
  }

  async remove(id: number): Promise<void> {
    const author = await this.prisma.author.findFirst({ 
      where: { author_id: id } 
    });

    if (!author) {
      throw new Error('Autor não encontrado');
    }

    await this.prisma.author.update({
      where: { author_id: id },
      data: { deleted_at: new Date() },
    });
  }

  async count(): Promise<number> {
    return this.prisma.author.count({
      where: { deleted_at: null },
    });
  }

  async updatePhoto(id: number, photo: string): Promise<void> {
    await this.prisma.author.update({
      where: { author_id: id },
      data: { photo },
    });
  }

  async restore(id: number): Promise<void> {
    const author = await this.prisma.author.findFirst({ 
      where: { author_id: id } 
    });

    if (!author) {
      throw new Error('Autor não encontrado');
    }

    await this.prisma.author.update({
      where: { author_id: id },
      data: { deleted_at: null },
    });
  }
}
