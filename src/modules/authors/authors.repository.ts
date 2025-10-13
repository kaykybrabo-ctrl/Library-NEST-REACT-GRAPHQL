import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Author, Prisma } from '@prisma/client';
import { DatabaseOperationException } from '@/common/exceptions/custom.exception';

@Injectable()
export class AuthorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AuthorCreateInput): Promise<Author> {
    try {
      return await this.prisma.author.create({ data });
    } catch (error) {
      throw new DatabaseOperationException('criar autor', error.message);
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AuthorWhereInput;
    orderBy?: Prisma.AuthorOrderByWithRelationInput;
  }): Promise<Author[]> {
    try {
      return await this.prisma.author.findMany(params);
    } catch (error) {
      throw new DatabaseOperationException('buscar autores', error.message);
    }
  }

  async findById(id: number): Promise<Author | null> {
    try {
      return await this.prisma.author.findFirst({
        where: { author_id: id },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar autor por ID', error.message);
    }
  }

  async update(id: number, data: Prisma.AuthorUpdateInput): Promise<Author> {
    try {
      return await this.prisma.author.update({
        where: { author_id: id },
        data,
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar autor', error.message);
    }
  }

  async softDelete(id: number): Promise<Author> {
    try {
      return await this.prisma.author.update({
        where: { author_id: id },
        data: { deleted_at: new Date() } as any,
      });
    } catch (error) {
      throw new DatabaseOperationException('excluir autor', error.message);
    }
  }

  async restore(id: number): Promise<Author> {
    try {
      return await this.prisma.author.update({
        where: { author_id: id },
        data: { deleted_at: null } as any,
      });
    } catch (error) {
      throw new DatabaseOperationException('restaurar autor', error.message);
    }
  }

  async count(where?: Prisma.AuthorWhereInput): Promise<number> {
    try {
      return await this.prisma.author.count({ where });
    } catch (error) {
      throw new DatabaseOperationException('contar autores', error.message);
    }
  }

  async updatePhoto(id: number, photo: string): Promise<Author> {
    try {
      return await this.prisma.author.update({
        where: { author_id: id },
        data: { photo },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar foto do autor', error.message);
    }
  }
}
