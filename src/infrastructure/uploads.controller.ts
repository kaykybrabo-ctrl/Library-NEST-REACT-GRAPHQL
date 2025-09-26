import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";
import { existsSync } from "fs";

@Controller("api/uploads")
export class UploadsController {
  @Get(":filename")
  getUpload(@Param("filename") filename: string, @Res() res: Response) {
    const filePath = join(__dirname, "..", "FRONTEND", "uploads", filename);
    if (!existsSync(filePath)) {
      return res.status(404).send("Not found");
    }
    res.setHeader("Cache-Control", "no-store");
    return res.sendFile(filePath);
  }
}
