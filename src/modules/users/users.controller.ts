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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { existsSync } from "fs";
import { join } from "path";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    await this.usersService.updateFavoriteBook(req.user.username, +bookId);
    return { message: "Book added to favorites" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/favorite/:id")
  async addToFavoritesApi(@Param("id") bookId: string, @Request() req) {
    await this.usersService.updateFavoriteBook(req.user.username, +bookId);
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

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @Post("api/upload-image")
  async uploadImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new Error("No file provided");
    }

    const currentUser = await this.usersService.findByIdRaw(req.user.id);

    await this.usersService.updateProfileImage(req.user.id, file.filename);

    return await this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("api/save-description")
  async saveDescription(@Request() req, @Body() body: any) {
    await this.usersService.updateDescription(req.user.id, body.description);

    return await this.usersService.findOne(req.user.id);
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

  @UseGuards(JwtAuthGuard)
  @Get("get-profile")
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("api/get-profile")
  async getProfileApi(@Request() req) {
    const profile = await this.usersService.findOne(req.user.id);
    return profile;
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
