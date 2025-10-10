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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { existsSync } from "fs";
import { join } from "path";

@Controller()
export class UsersController {
  static userProfiles: Map<string, {image: string, description: string}> = new Map();
  
  constructor(private readonly usersService: UsersService) {}


  private getUserProfile(username: string) {
    if (!UsersController.userProfiles.has(username)) {
      UsersController.userProfiles.set(username, {
        image: "default-user.png",
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

    const result = await this.usersService.update(req.user.id, updateUserDto);

    const profile = await this.usersService.findOne(req.user.id);
    return profile;
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
      await this.usersService.updateProfileImage(dbUser.id, file.filename);
    }

    const updatedUser = await this.usersService.findByUsername(username);

    const response = {
      id: updatedUser?.id || 1,
      username: username,
      email: username,
      role: updatedUser?.role || "user",
      description: updatedUser?.description || '',
      profile_image: updatedUser?.profile_image || updatedUser?.photo || 'default-user.png',
      timestamp: Date.now(),
      success: true
    };

    return response;
  }

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
      profile_image: updatedUser?.profile_image || updatedUser?.photo || 'default-user.png'
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
    
    username = username !== "guest" ? username : (req?.query?.username || "guest");
    
    const dbUser = await this.usersService.findByUsername(username);
    
    if (dbUser) {
      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.username,
        role: dbUser.role,
        description: dbUser.description || '',
        profile_image: dbUser.profile_image || dbUser.photo || 'default-user.png',
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
