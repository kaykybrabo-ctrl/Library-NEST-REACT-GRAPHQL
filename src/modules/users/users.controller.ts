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
  // Storage for user-specific data
  static userProfiles: Map<string, {image: string, description: string}> = new Map();
  
  constructor(private readonly usersService: UsersService) {}

  // Helper method to get user profile data
  private getUserProfile(username: string) {
    if (!UsersController.userProfiles.has(username)) {
      UsersController.userProfiles.set(username, {
        image: "default-user.png",
        description: "Usuário do sistema"
      });
    }
    return UsersController.userProfiles.get(username);
  }

  // Helper method to update user profile data
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
    // await this.usersService.updateFavoriteBook(req.user.username, +bookId);
    return { message: "Book added to favorites" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/favorite/:id")
  async addToFavoritesApi(@Param("id") bookId: string, @Request() req) {
    // await this.usersService.updateFavoriteBook(req.user.username, +bookId);
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
    // Get username from JWT token in Authorization header
    let username = "guest";
    
    try {
      const authHeader = req?.headers?.authorization;
      console.log('Upload - Auth header:', authHeader);
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        console.log('Upload - Decoded JWT:', decoded);
        username = decoded?.username || decoded?.email || decoded?.sub || "guest";
        console.log('Upload - Extracted username:', username);
      }
    } catch (error) {
      console.log('Upload - Error decoding JWT:', error);
    }
    
    // Fallback to manual username if no JWT
    username = username !== "guest" ? username : (queryUsername || body?.username || body?.email || "guest");
    console.log('Upload - Final username:', username);
    
    if (file) {
      // Update user-specific profile image
      this.updateUserProfile(username, { image: file.filename });
      console.log(`Image uploaded for user ${username}: ${file.filename}, size: ${file.size} bytes`);
    }

    // Get current user profile
    const userProfile = this.getUserProfile(username);

    // Return profile with new filename and cache buster
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
    console.log('Upload response for user:', username, response);
    return response;
  }

  @Post("api/save-description")
  async saveDescription(
    @Body() body: any, 
    @Request() req?: any,
    @Query('username') queryUsername?: string
  ) {
    // Get username from JWT token in Authorization header
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
    
    // Fallback to manual username if no JWT
    username = username !== "guest" ? username : (queryUsername || body?.username || "guest");
    
    // Update user-specific description
    if (body.description) {
      this.updateUserProfile(username, { description: body.description });
    }

    // Get current user profile
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
  @UseInterceptors(FileInterceptor("profile_image"))
  @Post("api/update-profile")
  async updateProfileApi(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updateData: any = {};

    if (file) {
      updateData.profile_image = file.filename;
    }

    if (
      updateUserDto.description !== undefined &&
      updateUserDto.description !== null &&
      updateUserDto.description.trim() !== ""
    ) {
      updateData.description = updateUserDto.description;
    }

    const result = await this.usersService.update(req.user.id, updateData);
    const profile = await this.usersService.findOne(req.user.id);
    return profile;
  }

  @Get("get-profile")
  async getProfile(@Request() req?: any) {
    // Get username from request or use default
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
    // Get username from JWT token in Authorization header
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
    
    // Fallback to query parameter if no JWT
    username = username !== "guest" ? username : (req?.query?.username || "guest");
    const userProfile = this.getUserProfile(username);

    const profile = {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      role: "user",
      description: userProfile.description,
      profile_image: userProfile.image,
      timestamp: Date.now(), // Add timestamp to break cache
      debug: {
        currentImage: userProfile.image,
        requestTime: new Date().toISOString(),
        username: username
      }
    };
    console.log('Profile requested for user:', username, 'at', new Date().toISOString(), '- Image:', userProfile.image);
    return profile;
  }

  @Get("api/debug/current-image")
  async getCurrentImage(@Request() req?: any) {
    const username = req?.user?.username || req?.query?.username || "guest";
    const userProfile = this.getUserProfile(username);
    
    return {
      username: username,
      currentProfileImage: userProfile.image,
      description: userProfile.description,
      timestamp: Date.now(),
      time: new Date().toISOString(),
      allUsers: Array.from(UsersController.userProfiles.keys())
    };
  }

  @UseInterceptors(FileInterceptor("profile_image"))
  @Post("api/debug/update-profile")
  async debugUpdateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateUserDto.profile_image = file.filename;

      const filePath = join(
        __dirname,
        "..",
        "..",
        "FRONTEND",
        "uploads",
        file.filename,
      );
    }

    const result = await this.usersService
      .update(req.user?.id || 0, updateUserDto)
      .catch((e) => {
        return null;
      });
    const profile = await this.usersService.findOne(req.user?.id || 0);
    return { result, profile };
  }
}
