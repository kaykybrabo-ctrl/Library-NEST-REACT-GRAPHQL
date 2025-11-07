import { Injectable } from "@nestjs/common";
import { BooksRepository } from "./books.repository";
import { CreateBookDto } from "./dto/create-book.dto";
import { CreateBookWithAuthorDto } from "./dto/create-book-with-author.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { AuthorsService } from "../authors/authors.service";

@Injectable()
export class BooksService {
  constructor(
    private booksRepository: BooksRepository,
    private authorsService: AuthorsService
  ) {}

  async create(createBookDto: CreateBookDto) {
    return this.booksRepository.create({
      title: createBookDto.title,
      author: {
        connect: { author_id: createBookDto.author_id }
      },
    });
  }

  async createWithAuthor(createBookWithAuthorDto: CreateBookWithAuthorDto) {
    let authorId: number;

    if (createBookWithAuthorDto.author_id) {
      authorId = createBookWithAuthorDto.author_id;
    } else if (createBookWithAuthorDto.author_name) {
      const existingAuthor = await this.authorsService.findByName(createBookWithAuthorDto.author_name);
      
      if (existingAuthor) {
        authorId = existingAuthor.author_id;
      } else {
        const newAuthor = await this.authorsService.create({
          name_author: this.formatAuthorName(createBookWithAuthorDto.author_name),
          biography: `Biografia de ${this.formatAuthorName(createBookWithAuthorDto.author_name)}`
        });
        authorId = newAuthor.author_id;
      }
    } else {
      throw new Error('É necessário fornecer author_id ou author_name');
    }

    const existingBook = await this.booksRepository.findByTitleAndAuthor(
      createBookWithAuthorDto.title, 
      authorId
    );

    if (existingBook) {
      throw new Error('Já existe um livro com este título deste autor');
    }

    return this.booksRepository.create({
      title: createBookWithAuthorDto.title,
      description: createBookWithAuthorDto.description,
      photo: createBookWithAuthorDto.photo,
      author: {
        connect: { author_id: authorId }
      },
    });
  }

  private formatAuthorName(name: string): string {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  async findAll(page?: number, limit?: number, search?: string, includeDeleted: boolean = false, authorId?: number): Promise<any> {
    const pageNum = page || 1;
    const limitNum = limit || 5;
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {
      ...(includeDeleted ? {} : { deleted_at: null }),
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
      ...(authorId ? { author_id: authorId } : {}),
    };

    const books = await this.booksRepository.findAll({
      where: whereClause,
      skip: offset,
      take: limitNum,
      orderBy: {
        book_id: "asc",
      },
    });

    const totalBooks = await this.booksRepository.count(whereClause);

    const transformedBooks = books.map((book: any) => ({
      book_id: book.book_id,
      title: book.title,
      description: book.description,
      photo: book.photo,
      author_id: book.author_id,
      deleted_at: book.deleted_at,
      author: book.author ? {
        author_id: book.author.author_id,
        name_author: book.author.name_author,
        biography: book.author.biography,
        photo: book.author.photo,
        deleted_at: book.author.deleted_at,
      } : null,
    }));

    return {
      books: transformedBooks,
      totalPages: Math.ceil(totalBooks / limitNum),
    };
  }

  async findOne(id: number): Promise<any> {
    const book: any = await this.booksRepository.findById(id);

    if (!book) return null;

    return {
      book_id: book.book_id,
      title: book.title,
      description: book.description || 'Descrição não disponível para este livro.',
      photo: book.photo,
      author_id: book.author_id,
      deleted_at: book.deleted_at,
      author: book.author ? {
        author_id: book.author.author_id,
        name_author: book.author.name_author,
        biography: book.author.biography,
        photo: book.author.photo,
        deleted_at: book.author.deleted_at,
      } : null,
      categories: book.book_categories?.map((bc: any) => bc.categories.name_category) || [],
      publishers: book.book_publishers?.map((bp: any) => bp.publishers.publish_name) || [],
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const exists = await this.booksRepository.findById(id);
    if (!exists) {
      throw new Error("Livro não encontrado");
    }
    return this.booksRepository.update(id, {
      title: updateBookDto.title,
      author: updateBookDto.author_id ? {
        connect: { author_id: updateBookDto.author_id }
      } : undefined,
    });
  }

  async remove(id: number): Promise<void> {
    const book = await this.booksRepository.findById(id);

    if (!book) {
      throw new Error(`Livro com ID ${id} não encontrado`);
    }

    await this.booksRepository.softDelete(id);
  }

  async count(): Promise<number> {
    return this.booksRepository.count({
      deleted_at: null,
    });
  }

  async updatePhoto(id: number, photo: string): Promise<void> {
    await this.booksRepository.updatePhoto(id, photo);
  }

  async restore(id: number) {
    const book = await this.booksRepository.findById(id);

    if (!book) {
      throw new Error(`Livro com ID ${id} não encontrado`);
    }

    return this.booksRepository.restore(id);
  }

}
