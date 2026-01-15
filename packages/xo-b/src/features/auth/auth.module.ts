import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JWT_CONFIG } from './auth.config'
import { AuthController } from './auth.controller'
import { RedisGuestRepository } from './guest/guest.repository'
import { GuestService } from './guest/guest.service'
import { JwtAuthGuard } from './user/jwt-auth.guard'
import { RedisRefreshTokenRepository } from './user/repository/refresh-token.repository'
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
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RedisUserRepository,
    RedisGuestRepository,
    RedisRefreshTokenRepository,
  ],
  exports: [UserService, GuestService, JwtAuthGuard],
})
export class AuthModule {}
