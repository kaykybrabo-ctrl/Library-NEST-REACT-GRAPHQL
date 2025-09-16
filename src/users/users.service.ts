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

    console.log('findOne raw user from DB:', user);

    if (!user) return null;

    // Return just the raw filename (or null) and let the frontend build the URL.
    // Avoid hardcoding hosts/ports which can break in different environments.
    const result = {
      ...user,
      profile_image:
        user.profile_image && user.profile_image.trim() !== ''
          ? user.profile_image
          : null,
    };

    console.log('findOne final result:', result);
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
    console.log('UsersService.update called with:', { id, updateUserDto });

    // Get current user data first
    const currentUser = await this.prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    // Only update the fields that are provided and different from current values
    const updateData: any = {};
    
    if (updateUserDto.profile_image !== undefined) {
      updateData.profile_image = updateUserDto.profile_image || null;
      console.log('Will update profile_image to:', updateData.profile_image);
    }
    
    if (updateUserDto.description !== undefined) {
      updateData.description = updateUserDto.description || null;
      console.log('Will update description to:', updateData.description);
    }

    console.log('Final update data:', updateData);

    if (Object.keys(updateData).length === 0) {
      console.log('No valid fields to update, returning current user');
      return currentUser;
    }

    const result = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    console.log('UsersService.update result:', result);
    return this.findOne(id); // Use findOne to ensure consistent response format
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
