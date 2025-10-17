import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByUsername(createUserDto.username);

    if (existingUser) {
      throw new Error('Este nome de usuário já está em uso');
    }

    const newUser = await this.prisma.user.create({
      data: {
        full_name: createUserDto.username.split('@')[0],
        birth_date: new Date('2000-01-01'),
        address: 'Endereço não informado',
        email: createUserDto.username,
      },
    });

    return this.usersRepository.create({
      username: createUserDto.username,
      password: createUserDto.password,
      role: createUserDto.role,
      user: {
        connect: { user_id: newUser.user_id }
      },
    });
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      profile_image: user.profile_image,
    };
  }

  async findByUsername(username: string) {
    return this.usersRepository.findByUsername(username);
  }

  async findByIdRaw(id: number) {
    return this.usersRepository.findById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.username) {
      const existingUser = await this.usersRepository.findByUsername(updateUserDto.username);

      if (existingUser && existingUser.id !== id) {
        throw new Error('Este nome de usuário já está em uso');
      }
    }

    return this.usersRepository.update(id, {
      username: updateUserDto.username,
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
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
    return this.usersRepository.update(userId, {
      favorite_book_id: bookId
    });
  }

  async updateDescription(userId: number, description: string): Promise<any> {
    return this.usersRepository.update(userId, {
      description: description
    });
  }

  async updateDisplayName(userId: number, displayName: string): Promise<any> {
    const allUsers = await this.usersRepository.findAll();
    const existingUser = allUsers.find(user => user.display_name === displayName && user.id !== userId);

    if (existingUser) {
      throw new Error('Este nome de exibição já está em uso por outro usuário');
    }

    return this.usersRepository.update(userId, {
      display_name: displayName
    });
  }

  async updateProfileImage(userId: number, imagePath: string): Promise<any> {
    return this.usersRepository.update(userId, {
      profile_image: imagePath
    });
  }

  async updatePassword(username: string, newPassword: string): Promise<any> {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return this.usersRepository.update(user.id, {
      password: hashedPassword
    });
  }
}
