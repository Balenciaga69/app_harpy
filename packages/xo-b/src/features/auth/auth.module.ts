import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JWT_CONFIG } from './auth.config'
import { AuthController } from './auth.controller'
import { SessionManager } from './session-manager'
import { RedisGuestRepository } from './guest/guest.repository'
import { GuestService } from './guest/guest.service'
import { RedisAccessTokenRepository } from './token/access-token.repository'
import { RedisRefreshTokenRepository } from './token/refresh-token.repository'
import { JwtAuthGuard } from './user/jwt-auth.guard'
import { RedisUserRepository } from './user/repository/user.repository'
import { JwtStrategy } from './user/strategy/jwt.strategy'
import { LocalStrategy } from './user/strategy/local.strategy'
import { UserService } from './user/user.service'
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_CONFIG.SECRET,
      signOptions: { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS },
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    GuestService,
    SessionManager,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RedisUserRepository,
    RedisGuestRepository,
    RedisRefreshTokenRepository,
    RedisAccessTokenRepository,
  ],
  exports: [UserService, GuestService, JwtAuthGuard],
})
export class AuthModule {}
