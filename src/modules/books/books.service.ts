import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author_id: createBookDto.author_id,
      },
      include: {
        author: true,
      },
    });
  }

  async findAll(page?: number, limit?: number, search?: string, includeDeleted: boolean = false): Promise<any> {
    const pageNum = page || 1;
    const limitNum = limit || 5;
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
    };

    const books = await this.prisma.book.findMany({
      where: whereClause,
      skip: offset,
      take: limitNum,
      include: {
        author: true,
      },
      orderBy: {
        book_id: "asc",
      },
    });

    const totalBooks = await this.prisma.book.count({ where: whereClause });

    const transformedBooks = books.map((book) => ({
      book_id: book.book_id,
      title: book.title,
      description: this.getBookDescription(book.title), // Descrições específicas por título
      photo: null,
      author_name: book.author.name_author,
      author_id: book.author.author_id,
    }));

    return {
      books: transformedBooks,
      totalPages: Math.ceil(totalBooks / limitNum),
    };
  }

  async findOne(id: number): Promise<any> {
    const book = await this.prisma.book.findFirst({
      where: { book_id: id },
      include: {
        author: true,
      },
    });

    if (!book) return null;

    return {
      book_id: book.book_id,
      title: book.title,
      description: this.getBookDescription(book.title),
      photo: null,
      author_name: book.author.name_author,
      author_id: book.author.author_id,
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const exists = await this.prisma.book.findFirst({ where: { book_id: id } });
    if (!exists) {
      throw new Error("Book not found");
    }
    return this.prisma.book.update({
      where: { book_id: id },
      data: {
        title: updateBookDto.title,
        author_id: updateBookDto.author_id,
      },
      include: {
        author: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    const book = await this.prisma.book.findFirst({
      where: { book_id: id },
    });

    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }

    await this.prisma.$transaction([
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
      data: { title: 'temp' }, // { photo },
    });
  }

  async restore(id: number): Promise<void> {
  }

  private getBookDescription(title: string): string {
    const descriptions = {
      "Life in Silence": "Uma narrativa profunda sobre a busca pela paz interior em meio ao caos urbano.",
      "Fragments of Everyday Life": "Pequenos momentos que compõem a grandeza da existência humana.",
      "Stories of the Wind": "Contos místicos que navegam entre realidade e fantasia.",
      "Between Noise and Calm": "Uma jornada filosófica sobre encontrar equilíbrio na vida moderna.",
      "The Horizon and the Sea": "Romance épico que explora os limites do amor e da aventura.",
      "Winds of Change": "Drama histórico sobre transformações sociais e pessoais.",
      "Paths of the Soul": "Reflexões espirituais sobre o propósito da vida.",
      "Under the Grey Sky": "Thriller psicológico ambientado em uma cidade sombria.",
      "Notes of a Silence": "Poesia em prosa sobre a beleza do silêncio.",
      "The Last Letter": "Mistério envolvente sobre segredos familiares."
    };
    
    return descriptions[title] || "Uma obra literária que cativa e emociona o leitor.";
  }
}
