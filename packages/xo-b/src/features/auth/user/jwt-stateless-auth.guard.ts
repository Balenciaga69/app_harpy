import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtStatelessAuthGuard extends AuthGuard('jwt-stateless') {}
