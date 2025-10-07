"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
let UploadsController = class UploadsController {
    getUpload(filename, res) {
        const baseDir = (0, path_1.join)(process.cwd(), "FRONTEND", "uploads");
        const tryPaths = [];
        tryPaths.push((0, path_1.join)(baseDir, filename));
        const lower = filename.toLowerCase();
        if (lower.endsWith('.jpg')) {
            tryPaths.push((0, path_1.join)(baseDir, filename.replace(/\.jpg$/i, '.jpeg')));
            tryPaths.push((0, path_1.join)(baseDir, filename.replace(/\.jpg$/i, '.JPG')));
            tryPaths.push((0, path_1.join)(baseDir, filename.replace(/\.jpg$/i, '.JPEG')));
        }
        else if (lower.endsWith('.jpeg')) {
            tryPaths.push((0, path_1.join)(baseDir, filename.replace(/\.jpeg$/i, '.jpg')));
            tryPaths.push((0, path_1.join)(baseDir, filename.replace(/\.jpeg$/i, '.JPG')));
            tryPaths.push((0, path_1.join)(baseDir, filename.replace(/\.jpeg$/i, '.JPEG')));
        }
        let found = tryPaths.find(p => (0, fs_1.existsSync)(p));
        if (!found) {
            try {
                const norm = (s) => (s || "")
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .replace(/\s+/g, ' ')
                    .trim();
                const reqBase = norm(filename.replace(/\.(jpg|jpeg)$/i, ''));
                const files = (0, fs_1.readdirSync)(baseDir);
                const candidate = files.find(f => {
                    const base = norm(f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
                    return base === reqBase;
                }) || files.find(f => {
                    const base = norm(f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
                    return base.includes(reqBase) || reqBase.includes(base);
                });
                if (candidate) {
                    found = (0, path_1.join)(baseDir, candidate);
                }
            }
            catch { }
        }
        if (!found)
            return res.status(404).send("Not found");
        res.setHeader("Cache-Control", "no-store");
        return res.sendFile(found);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Get)(":filename"),
    __param(0, (0, common_1.Param)("filename")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "getUpload", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)("api/uploads")
], UploadsController);
