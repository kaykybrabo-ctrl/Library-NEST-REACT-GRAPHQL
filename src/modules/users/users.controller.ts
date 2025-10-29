import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { existsSync } from "fs";
import { join } from "path";

@Controller()
export class UsersController {
  static userProfiles: Map<string, {image: string, description: string}> = new Map();
  
  constructor(private readonly usersService: UsersService) {}


  private getUserProfile(username: string) {
    if (!UsersController.userProfiles.has(username)) {
      UsersController.userProfiles.set(username, {
        image: "https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg",
        description: "Usuário do sistema"
      });
    }
    return UsersController.userProfiles.get(username);
  }

  private updateUserProfile(username: string, updates: {image?: string, description?: string}) {
    const profile = this.getUserProfile(username);
    if (updates.image) profile.image = updates.image;
    if (updates.description) profile.description = updates.description;
    UsersController.userProfiles.set(username, profile);
  }

  @UseGuards(JwtAuthGuard)
  @Get("users/favorite")
  async getFavoriteBook(@Request() req) {
    const username = req.query.username || req.user.username;
    return this.usersService.getFavoriteBook(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get("api/users/favorite")
  async getFavoriteBookApi(@Request() req) {
    const username = req.query.username || req.user.username;
    return this.usersService.getFavoriteBook(username);
  }

  @UseGuards(JwtAuthGuard)
  @Post("favorite/:id")
  async addToFavorites(@Param("id") bookId: string, @Request() req) {
    try {
      await this.usersService.setFavoriteBook(req.user.id, +bookId);
      return { message: "Livro adicionado aos favoritos com sucesso", success: true };
    } catch (error) {
      return { message: "Erro ao adicionar livro aos favoritos", success: false };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/favorite/:id")
  async addToFavoritesApi(@Param("id") bookId: string, @Request() req) {
    try {
      await this.usersService.setFavoriteBook(req.user.id, +bookId);
      return { message: "Livro adicionado aos favoritos com sucesso", success: true };
    } catch (error) {
      return { message: "Erro ao adicionar livro aos favoritos", success: false };
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("profile_image"))
  @Post("update-profile")
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateUserDto.profile_image = file.filename;
    }

    try {
      const result = await this.usersService.update(req.user.id, updateUserDto);
      const profile = await this.usersService.findOne(req.user.id);
      return profile;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao atualizar perfil',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseInterceptors(FileInterceptor("image", {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        cb(null, require('path').join(process.cwd(), "FRONTEND", "uploads"));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = require('path').extname(file.originalname) || '.jpg';
        cb(null, uniqueSuffix + extension);
      }
    })
  }))
  @Post("api/upload-image")
  async uploadImage(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any,
    @Request() req?: any,
    @Query('username') queryUsername?: string
  ) {
    let username = "guest";
    
    try {
      const authHeader = req?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        username = decoded?.username || decoded?.email || decoded?.sub || "guest";
      }
    } catch (error) {
    }
    
    username = username !== "guest" ? username : (queryUsername || body?.username || body?.email || "guest");
    
    const dbUser = await this.usersService.findByUsername(username);
    
    if (dbUser && file) {
      await this.usersService.updateProfileImage(dbUser.id, file);
    }

    const updatedUser = await this.usersService.findByUsername(username);

    const response = {
      id: updatedUser?.id || 1,
      username: username,
      email: username,
      role: updatedUser?.role || "user",
      description: updatedUser?.description || '',
      profile_image: updatedUser?.profile_image || 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
      display_name: updatedUser?.display_name || '',
      timestamp: Date.now(),
      success: true
    };

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/save-description")
  async saveDescription(
    @Body() body: any, 
    @Request() req?: any,
    @Query('username') queryUsername?: string
  ) {
    let username = "guest";
    
    try {
      const authHeader = req?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        username = decoded?.username || decoded?.email || decoded?.sub || "guest";
      }
    } catch (error) {
    }
    
    username = username !== "guest" ? username : (queryUsername || body?.username || "guest");
    
    const currentUser = req.user;
    const targetUsername = body?.username || queryUsername || username;
    
    if (currentUser.username !== targetUsername && currentUser.role !== 'admin') {
      throw new HttpException(
        'Você não tem permissão para editar este perfil',
        HttpStatus.FORBIDDEN
      );
    }
    
    const dbUser = await this.usersService.findByUsername(username);
    
    if (dbUser && body.description !== undefined) {
      await this.usersService.updateDescription(dbUser.id, body.description);
    }

    const updatedUser = await this.usersService.findByUsername(username);

    return {
      id: updatedUser?.id || 1,
      username: username,
      email: username,
      role: updatedUser?.role || "user",
      description: updatedUser?.description || '',
      profile_image: updatedUser?.profile_image || 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
      display_name: updatedUser?.display_name || updatedUser?.photo || ''
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/save-display-name")
  async saveDisplayName(
    @Body() body: any,
    @Request() req?: any
  ) {
    let username = "guest";
    
    try {
      const authHeader = req?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        username = decoded?.username || decoded?.email || decoded?.sub || "guest";
      }
    } catch (error) {
    }
    
    const targetUsername = body.username || username;
    
    const currentUser = req.user;
    
    if (currentUser.username !== targetUsername && currentUser.role !== 'admin') {
      throw new HttpException(
        'Você não tem permissão para editar este perfil',
        HttpStatus.FORBIDDEN
      );
    }
    
    const dbUser = await this.usersService.findByUsername(targetUsername);
    
    if (dbUser && body.display_name !== undefined) {
      try {
        await this.usersService.updateDisplayName(dbUser.id, body.display_name);
      } catch (error) {
        throw new HttpException(
          error.message || 'Erro ao atualizar nome',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updatedUser = await this.usersService.findByUsername(targetUsername);

    return {
      id: updatedUser?.id || 1,
      username: targetUsername,
      email: targetUsername,
      role: updatedUser?.role || "user",
      description: updatedUser?.description || '',
      profile_image: updatedUser?.profile_image || 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
      display_name: updatedUser?.display_name || updatedUser?.photo || ''
    };
  }

  @Get("get-profile")
  async getProfile(@Request() req?: any) {
    const username = req?.user?.username || req?.query?.username || "guest";
    const userProfile = this.getUserProfile(username);

    return {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      role: "user",
      description: userProfile.description,
      profile_image: userProfile.image
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("api/users")
  async getAllUsers(@Request() req) {
    try {
      const users = await this.usersService.findAll();
      return users.map(user => ({
        user_id: user.id,
        username: user.username,
        role: user.role,
        profile_image: user.profile_image || 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
        display_name: user.display_name || user.username,
        description: user.description || ''
      }));
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar usuários',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("api/get-profile")
  async getProfileApi(@Request() req?: any) {
    let username = "guest";
    
    try {
      const authHeader = req?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        username = decoded?.username || decoded?.email || decoded?.sub || "guest";
      }
    } catch (error) {
    }
    
    const queryUsername = req?.query?.username;
    if (queryUsername) {
      username = queryUsername;
    }
    
    const dbUser = await this.usersService.findByUsername(username);
    
    if (dbUser) {
      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.username,
        role: dbUser.role,
        description: dbUser.description || '',
        profile_image: dbUser.profile_image || 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
        display_name: dbUser.display_name || '',
        timestamp: Date.now()
      };
    }

    const userProfile = this.getUserProfile(username);
    const profile = {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      role: "user",
      description: userProfile.description,
      profile_image: userProfile.image,
      timestamp: Date.now()
    };

    return profile;
  }
}
