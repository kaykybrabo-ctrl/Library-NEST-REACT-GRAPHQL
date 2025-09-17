import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });


    if (!user) return null;

    const result = {
      ...user,
      profile_image:
        user.profile_image && user.profile_image.trim() !== ''
          ? user.profile_image
          : null,
    };

    return result;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  async findByIdRaw(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {

    const currentUser = await this.prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    const updateData: any = {};
    
    if (updateUserDto.profile_image !== undefined) {
      updateData.profile_image = updateUserDto.profile_image || null;
    }
    
    if (updateUserDto.description !== undefined) {
      updateData.description = updateUserDto.description || null;
    }


    if (Object.keys(updateData).length === 0) {
      return currentUser;
    }

    const result = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async updateProfileImage(id: number, filename: string) {
    return this.update(id, { profile_image: filename });
  }

  async updateDescription(id: number, description: string) {
    return this.update(id, { description: description });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateFavoriteBook(username: string, bookId: number): Promise<void> {
    await this.prisma.user.update({
      where: { username },
      data: { favorite_book_id: bookId },
    });
  }

  async getFavoriteBook(username: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        favorite_book_id: true,
      },
    });

    if (!user?.favorite_book_id) {
      return null;
    }

    const book = await this.prisma.book.findUnique({
      where: { book_id: user.favorite_book_id },
      include: {
        author: true,
      },
    });

    if (!book) return null;

    return {
      book_id: book.book_id,
      title: book.title,
      description: book.description,
      photo: book.photo,
      author_name: book.author.name_author,
    };
  }
}
