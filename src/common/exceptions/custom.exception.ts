import { HttpException, HttpStatus } from '@nestjs/common';

export class BookNotFoundException extends HttpException {
  constructor(bookId: number) {
    super(
      {
        success: false,
        message: `Livro com ID ${bookId} não encontrado`,
        error: 'Book Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AuthorNotFoundException extends HttpException {
  constructor(authorId: number) {
    super(
      {
        success: false,
        message: `Autor com ID ${authorId} não encontrado`,
        error: 'Author Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class BookAlreadyDeletedException extends HttpException {
  constructor(bookId: number) {
    super(
      {
        success: false,
        message: `Livro com ID ${bookId} já está excluído`,
        error: 'Book Already Deleted',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DatabaseOperationException extends HttpException {
  constructor(operation: string, details?: string) {
    super(
      {
        success: false,
        message: `Erro ao executar operação: ${operation}`,
        error: 'Database Operation Failed',
        details: details || 'Erro interno do banco de dados',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
