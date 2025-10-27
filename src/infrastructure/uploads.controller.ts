import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";
import { existsSync, readdirSync } from "fs";

@Controller("api/uploads")
export class UploadsController {
  @Get(":filename")
  getUpload(@Param("filename") filename: string, @Res() res: Response) {
    const baseDir = join(process.cwd(), "FRONTEND", "uploads");
    const tryPaths: string[] = [];
    tryPaths.push(join(baseDir, filename));

    const lower = filename.toLowerCase();
    if (lower.endsWith('.jpg')) {
      tryPaths.push(join(baseDir, filename.replace(/\.jpg$/i, '.jpeg')));
      tryPaths.push(join(baseDir, filename.replace(/\.jpg$/i, '.JPG')));
      tryPaths.push(join(baseDir, filename.replace(/\.jpg$/i, '.JPEG')));
    } else if (lower.endsWith('.jpeg')) {
      tryPaths.push(join(baseDir, filename.replace(/\.jpeg$/i, '.jpg')));
      tryPaths.push(join(baseDir, filename.replace(/\.jpeg$/i, '.JPG')));
      tryPaths.push(join(baseDir, filename.replace(/\.jpeg$/i, '.JPEG')));
    }

    let found = tryPaths.find(p => existsSync(p));

    if (!found) {
      try {
        const norm = (s: string) => (s || "")
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();
        const reqBase = norm(filename.replace(/\.(jpg|jpeg)$/i, ''));
        const files = readdirSync(baseDir);
        const candidate = files.find(f => {
          const base = norm(f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
          return base === reqBase;
        }) || files.find(f => {
          const base = norm(f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
          return base.includes(reqBase) || reqBase.includes(base);
        });
        if (candidate) {
          found = join(baseDir, candidate);
        }
      } catch {}
    }
    if (!found) {
      if (filename.includes('default-user') || filename.includes('user')) {
        return res.redirect('https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg');
      } else if (filename.includes('default-author') || filename.includes('author')) {
        return res.redirect('https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062934/pedbook/profiles/default-author.svg');
      } else if (filename.includes('default-book') || filename.includes('book')) {
        return res.redirect('https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062932/pedbook/books/default-book.svg');
      }
      return res.status(404).send("Not found");
    }

    res.setHeader("Cache-Control", "no-store");
    return res.sendFile(found);
  }
}
