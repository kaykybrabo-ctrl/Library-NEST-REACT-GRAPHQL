"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const nodemailer = __importStar(require("nodemailer"));
const pug = __importStar(require("pug"));
const path_1 = require("path");
let MailService = class MailService {
    mailer;
    constructor(mailer) {
        this.mailer = mailer;
    }
    async sendWelcomeEmail(to, context) {
        try {
            const info = await this.mailer.sendMail({
                to,
                subject: 'Welcome to PedBook',
                template: 'welcome',
                context,
            });
            const preview = nodemailer.getTestMessageUrl(info);
            console.log('[Mail] Welcome sent:', { messageId: info?.messageId, preview });
            return { messageId: info?.messageId, preview };
        }
        catch (err) {
            console.error('[Mail] Failed to send Welcome email:', err);
            throw err;
        }
    }
    async sendGeneric(to, subject, template, context) {
        try {
            const info = await this.mailer.sendMail({ to, subject, template, context });
            const preview = nodemailer.getTestMessageUrl(info);
            console.log('[Mail] Generic sent:', { to, subject, messageId: info?.messageId, preview });
            return { messageId: info?.messageId, preview };
        }
        catch (err) {
            console.error('[Mail] Failed to send Generic email:', { to, subject, err });
            throw err;
        }
    }
    async sendPasswordResetEmail(to, context) {
        const templatePath = (0, path_1.join)(process.cwd(), 'src', 'mail', 'templates', 'reset-password.pug');
        try {
            const html = pug.compileFile(templatePath)(context);
            const info = await this.mailer.sendMail({
                to,
                subject: 'Reset your PedBook password',
                html,
                text: `We received a request to reset your PedBook password. Open this link to proceed: ${context.resetUrl}`,
            });
            const preview = nodemailer.getTestMessageUrl(info);
            const sample = (html || '').replace(/\s+/g, ' ').slice(0, 120);
            console.log('[Mail] Password reset sent (manual HTML):', { to, messageId: info?.messageId, preview, sample });
            return { messageId: info?.messageId, preview };
        }
        catch (err) {
            console.error('[Mail] Failed to render/send Password Reset email:', { to, templatePath, err });
            const info2 = await this.mailer.sendMail({
                to,
                subject: 'Reset your PedBook password',
                text: `We received a request to reset your PedBook password. Open this link to proceed: ${context.resetUrl}`,
            });
            const preview2 = nodemailer.getTestMessageUrl(info2);
            console.log('[Mail] Password reset (plain) sent:', { to, messageId: info2?.messageId, preview: preview2 });
            return { messageId: info2?.messageId, preview: preview2 };
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
