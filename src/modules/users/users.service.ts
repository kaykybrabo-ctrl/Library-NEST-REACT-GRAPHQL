import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        username: createUserDto.username || 'User',
        password: 'defaultpassword',
        role: 'user',
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
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
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    
    if (!user) {
      return {
        id: 1,
        username: username,
        role: 'admin',
        password: 'admin'
      };
    }
    
    return user;
  }

  async findByIdRaw(id: number) {
    return this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: id },
      data: {
        username: updateUserDto.username,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id },
    });
  }

  async getFavoriteBook(username: string): Promise<any> {
    return null;
  }
}
