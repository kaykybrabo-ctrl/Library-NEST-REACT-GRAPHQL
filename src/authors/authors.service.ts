import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    return this.prisma.author.create({
      data: createAuthorDto,
    });
  }

  async findAll(page?: number, limit?: number): Promise<any> {
    if (page !== undefined && limit !== undefined && page > 0 && limit > 0) {
      const offset = (page - 1) * limit;
      
      const [authors, total] = await Promise.all([
        this.prisma.author.findMany({
          skip: offset,
          take: limit,
          orderBy: { author_id: 'asc' }
        }),
        this.prisma.author.count(),
      ]);
      
      return {
        authors,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      };
    }

    const authors = await this.prisma.author.findMany({ 
      orderBy: { author_id: 'asc' } 
    });
    return { 
      authors: authors,
      total: authors.length,
      page: 1,
      limit: authors.length,
      totalPages: 1
    };
  }

  async findOne(id: number) {
    return this.prisma.author.findUnique({ 
      where: { author_id: id } 
    });
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return this.prisma.author.update({
      where: { author_id: id },
      data: updateAuthorDto,
    });
  }

  async remove(id: number): Promise<void> {
    // Find all books for this author
    const books = await this.prisma.book.findMany({ where: { author_id: id }, select: { book_id: true } });

    const bookIds = books.map(b => b.book_id);

    // In a transaction, delete related reviews and loans for those books,
    // then delete the books, and finally delete the author.
    await this.prisma.$transaction([
      // Delete reviews and loans that depend on the author's books
      this.prisma.review.deleteMany({ where: { book_id: { in: bookIds.length ? bookIds : [-1] } } }),
      this.prisma.loan.deleteMany({ where: { book_id: { in: bookIds.length ? bookIds : [-1] } } }),
      // Delete books for the author
      this.prisma.book.deleteMany({ where: { author_id: id } }),
      // Delete the author
      this.prisma.author.delete({ where: { author_id: id } }),
    ]);
  }

  async count(): Promise<number> {
    return this.prisma.author.count();
  }

  async updatePhoto(id: number, photo: string): Promise<void> {
    await this.prisma.author.update({
      where: { author_id: id },
      data: { photo },
    });
  }
}
