import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = await this.prisma.user.create({
      data: {
        full_name: createUserDto.username.split('@')[0],
        birth_date: new Date('2000-01-01'),
        address: 'Endereço não informado',
        email: createUserDto.username,
      },
    });

    return this.prisma.authUser.create({
      data: {
        username: createUserDto.username,
        password: createUserDto.password,
        role: createUserDto.role,
        user_id: newUser.user_id,
      },
    });
  }

  async findAll() {
    return this.prisma.authUser.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.authUser.findUnique({
      where: { id: id },
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      profile_image: user.profile_image,
    };
  }

  async findByUsername(username: string) {
    const user = await this.prisma.authUser.findUnique({
      where: { username: username },
    });
    
    return user;
  }

  async findByIdRaw(id: number) {
    return this.prisma.authUser.findUnique({
      where: { id: id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.authUser.update({
      where: { id: id },
      data: {
        username: updateUserDto.username,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.authUser.delete({
      where: { id: id },
    });
  }

  async getFavoriteBook(username: string): Promise<any> {
    const user = await this.prisma.authUser.findUnique({
      where: { username: username },
      include: {
        user: true
      }
    });
    
    if (!user || !user.favorite_book_id) {
      return null;
    }
    
    return this.prisma.book.findUnique({
      where: { book_id: user.favorite_book_id },
      include: {
        author: true
      }
    });
  }

  async setFavoriteBook(userId: number, bookId: number): Promise<any> {
    return this.prisma.authUser.update({
      where: { id: userId },
      data: {
        favorite_book_id: bookId
      },
      include: {
        user: true
      }
    });
  }

  async updateDescription(userId: number, description: string): Promise<any> {
    return this.prisma.authUser.update({
      where: { id: userId },
      data: {
        description: description
      }
    });
  }

  async updateProfileImage(userId: number, imagePath: string): Promise<any> {
    return this.prisma.authUser.update({
      where: { id: userId },
      data: {
        profile_image: imagePath,
        photo: imagePath
      }
    });
  }
}
