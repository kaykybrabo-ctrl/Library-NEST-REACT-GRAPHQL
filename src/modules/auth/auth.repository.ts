import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuthUser, Prisma } from '@prisma/client';
import { DatabaseOperationException } from '@/common/exceptions/custom.exception';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<AuthUser | null> {
    try {
      return await this.prisma.authUser.findUnique({
        where: { username },
      });
    } catch (error) {
      throw new DatabaseOperationException('buscar usuário por username', error.message);
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

  async create(data: Prisma.AuthUserCreateInput): Promise<AuthUser> {
    try {
      return await this.prisma.authUser.create({
        data,
      });
    } catch (error) {
      throw new DatabaseOperationException('criar usuário', error.message);
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

  async updatePassword(id: number, hashedPassword: string): Promise<AuthUser> {
    try {
      return await this.prisma.authUser.update({
        where: { id },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar senha', error.message);
    }
  }

  async getUserProfile(id: number): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT id, username, role, profile_image, display_name, description 
        FROM auth_users 
        WHERE id = ${id}
        LIMIT 1
      ` as any[];

      return result[0] || null;
    } catch (error) {
      throw new DatabaseOperationException('buscar perfil do usuário', error.message);
    }
  }

  async updateProfile(id: number, data: { display_name?: string; description?: string }): Promise<void> {
    try {
      const updateData: any = {};
      if (data.display_name !== undefined) updateData.display_name = data.display_name;
      if (data.description !== undefined) updateData.description = data.description;

      await this.prisma.authUser.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new DatabaseOperationException('atualizar perfil', error.message);
    }
  }
}
