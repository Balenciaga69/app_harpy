import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtStatefulAuthGuard extends AuthGuard('jwt-stateful') {}
