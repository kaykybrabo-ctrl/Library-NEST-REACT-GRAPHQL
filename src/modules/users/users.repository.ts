import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuthUser, Prisma } from '@prisma/client';
import { DatabaseOperationException } from '@/common/exceptions/custom.exception';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AuthUserCreateInput): Promise<AuthUser> {
    try {
      return await this.prisma.authUser.create({
        data,
      });
    } catch (error) {
      throw new DatabaseOperationException('criar usuário', error.message);
    }
  }

  async findAll(): Promise<AuthUser[]> {
    try {
      return await this.prisma.authUser.findMany({
        orderBy: {
          id: 'asc',
        },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar usuários', error.message);
    }
  }

  async findById(id: number): Promise<AuthUser | null> {
    try {
      return await this.prisma.authUser.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar usuário por ID', error.message);
    }
  }

  async findByUsername(username: string): Promise<AuthUser | null> {
    try {
      console.log('🔍 UsersRepository.findByUsername - username recebido:', username);
      
      if (!username) {
        console.log('❌ Username está vazio ou undefined');
        return null;
      }
      
      const result = await this.prisma.authUser.findUnique({
        where: { username },
      });
      
      console.log('👤 Resultado da busca:', result ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      return result;
    } catch (error) {
      console.error('💥 Erro na busca por username:', error);
      throw new DatabaseOperationException('buscar usuário por username', error.message);
    }
  }

  async findByUserId(userId: number): Promise<AuthUser | null> {
    try {
      return await this.prisma.authUser.findUnique({
        where: { user_id: userId },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar usuário por user_id', error.message);
    }
  }

  async update(id: number, data: Prisma.AuthUserUpdateInput): Promise<AuthUser> {
    try {
      return await this.prisma.authUser.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar usuário', error.message);
    }
  }

  async updateByUserId(userId: number, data: Prisma.AuthUserUpdateInput): Promise<AuthUser> {
    try {
      return await this.prisma.authUser.update({
        where: { user_id: userId },
        data,
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar usuário por user_id', error.message);
    }
  }

  async delete(id: number): Promise<AuthUser> {
    try {
      return await this.prisma.authUser.delete({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseOperationException('excluir usuário', error.message);
    }
  }

  async updateDisplayName(userId: number, displayName: string): Promise<void> {
    try {
      await this.prisma.authUser.update({
        where: { user_id: userId },
        data: { display_name: displayName },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar nome de exibição', error.message);
    }
  }

  async updateDescription(userId: number, description: string): Promise<void> {
    try {
      await this.prisma.authUser.update({
        where: { user_id: userId },
        data: { description },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar descrição do usuário', error.message);
    }
  }

  async updateProfileImage(userId: number, profileImage: string): Promise<void> {
    try {
      await this.prisma.authUser.update({
        where: { user_id: userId },
        data: { profile_image: profileImage },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar imagem de perfil', error.message);
    }
  }

  async addToFavorites(userId: number, bookId: number): Promise<void> {
    try {
      await this.prisma.authUser.update({
        where: { user_id: userId },
        data: { favorite_book_id: bookId },
      });
    } catch (error) {
      throw new DatabaseOperationException('adicionar aos favoritos', error.message);
    }
  }

  async getFavoriteBook(userId: number): Promise<any> {
    try {
      return await this.prisma.authUser.findUnique({
        where: { user_id: userId },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar livro favorito', error.message);
    }
  }
}
