import { Injectable } from "@nestjs/common";
import { BooksRepository } from "./books.repository";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BooksService {
  constructor(private booksRepository: BooksRepository) {}

  async create(createBookDto: CreateBookDto) {
    return this.booksRepository.create({
      title: createBookDto.title,
      author: {
        connect: { author_id: createBookDto.author_id }
      },
    });
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
      description: this.getBookDescription(book.title),
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
      description: this.getBookDescription(book.title),
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

  async restore(id: number): Promise<void> {
    const book = await this.booksRepository.findById(id);

    if (!book) {
      throw new Error('Livro não encontrado');
    }

    await this.booksRepository.restore(id);
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
      "The Last Letter": "Mistério envolvente sobre segredos familiares.",
      "Between Words": "Explorando o não dito e os significados ocultos nas entrelinhas da comunicação.",
      "Colors of the City": "Um retrato vibrante da vida urbana através de suas múltiplas cores e nuances.",
      "The Weight of the Rain": "Metáfora poética sobre os fardos que carregamos e a renovação que vem das lágrimas.",
      "Blue Night": "Jornada misteriosa através da escuridão iluminada pela luz azulada da noite.",
      "Faces of Memory": "Histórias que capturam a natureza efêmera das lembranças e dos rostos que marcam nossas vidas.",
      "Origin Tales": "Explorando as raízes e os começos que moldam quem somos.",
      "Echoes of Tomorrow": "Narrativa futurista sobre esperança, possibilidades e os ecos do que está por vir.",
      "The Garden of Words": "Coleção de reflexões poéticas sobre linguagem, significado e expressão.",
      "Shadows and Light": "História sobre contrastes e a beleza encontrada na dualidade da existência.",
      "The River of Time": "Exploração profunda sobre memória, tempo e o fluxo constante da vida."
    };
    
    return descriptions[title] || "Uma obra literária que cativa e emociona o leitor.";
  }
}
