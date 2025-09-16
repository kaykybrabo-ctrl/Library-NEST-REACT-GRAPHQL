import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        description: createBookDto.description || null,
        author_id: createBookDto.author_id,
        photo: createBookDto.photo || null,
      },
      include: {
        author: true,
      },
    });
  }

  async findAll(page?: number, limit?: number, search?: string): Promise<any> {
    const pageNum = page || 1;
    const limitNum = limit || 5;
    const offset = (pageNum - 1) * limitNum;
    
    const whereClause = search ? {
      title: {
        contains: search
      }
    } : {};
    
    const books = await this.prisma.book.findMany({
      where: whereClause,
      skip: offset,
      take: limitNum,
      include: {
        author: true,
      },
      orderBy: {
        book_id: 'asc',
      },
    });

    const totalBooks = await this.prisma.book.count({ where: whereClause });

    const transformedBooks = books.map(book => ({
      book_id: book.book_id,
      title: book.title,
      description: book.description,
      photo: book.photo ? `http://localhost:8080/api/uploads/${book.photo}` : null,
      author_name: book.author.name_author,
      author_id: book.author.author_id,
    }));

    return {
      books: transformedBooks,
      totalPages: Math.ceil(totalBooks / limitNum),
    };
  }

  async findOne(id: number): Promise<any> {
    const book = await this.prisma.book.findUnique({
      where: { book_id: id },
      include: {
        author: true,
      },
    });

    if (!book) return null;

    return {
      book_id: book.book_id,
      title: book.title,
      description: book.description,
      photo: book.photo ? `http://localhost:8080/api/uploads/${book.photo}` : null,
      author_name: book.author.name_author,
      author_id: book.author.author_id,
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    return this.prisma.book.update({
      where: { book_id: id },
      data: {
        title: updateBookDto.title,
        description: updateBookDto.description || null,
        author_id: updateBookDto.author_id,
        photo: updateBookDto.photo || null,
      },
      include: {
        author: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    const book = await this.prisma.book.findUnique({
      where: { book_id: id },
    });

    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.review.deleteMany({ where: { book_id: id } }),
      this.prisma.loan.deleteMany({ where: { book_id: id } }),
      this.prisma.book.delete({ where: { book_id: id } }),
    ]);
  }

  async count(): Promise<number> {
    return this.prisma.book.count();
  }

  async updatePhoto(id: number, photo: string): Promise<void> {
    await this.prisma.book.update({
      where: { book_id: id },
      data: { photo },
    });
  }
}
