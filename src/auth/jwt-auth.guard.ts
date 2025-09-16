import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guarda JWT correto baseado no Passport e na JwtStrategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
