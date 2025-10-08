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
    return { message: "Book added to favorites" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/favorite/:id")
  async addToFavoritesApi(@Param("id") bookId: string, @Request() req) {
    return { message: "Book added to favorites" };
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
      console.log('Error decoding JWT:', error);
    }
    
    username = username !== "guest" ? username : (queryUsername || body?.username || body?.email || "guest");
    
    if (file) {
      this.updateUserProfile(username, { image: file.filename });
      console.log(`Image uploaded for user ${username}: ${file.filename}, size: ${file.size} bytes`);
    }

    const userProfile = this.getUserProfile(username);

    const response = {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      role: "user",
      description: userProfile.description,
      profile_image: file ? file.filename : userProfile.image,
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
      console.log('Error decoding JWT:', error);
    }
    
    username = username !== "guest" ? username : (queryUsername || body?.username || "guest");
    
    if (body.description) {
      this.updateUserProfile(username, { description: body.description });
    }

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
      console.log('Error decoding JWT:', error);
    }
    
    username = username !== "guest" ? username : (req?.query?.username || "guest");
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
