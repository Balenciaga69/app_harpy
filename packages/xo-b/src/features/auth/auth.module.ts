import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { JWT_CONFIG } from './auth.config'
import { AuthController } from './auth.controller'
import { RedisGuestRepository } from './guest/guest.repository'
import { GuestService } from './guest/guest.service'
import { SessionManager } from './session-manager'
import { RedisAccessTokenRepository } from './token/access-token.repository'
import { RedisRefreshTokenRepository } from './token/refresh-token.repository'
import { JwtAuthGuard } from './user/jwt-auth.guard'
import { JwtRefreshGuard } from './user/jwt-refresh.guard'
import { RedisUserRepository } from './user/repository/user.repository'
import { JwtRefreshStrategy } from './user/strategy/jwt-refresh.strategy'
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
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    {
      provide: InjectionTokens.UserRepository,
      useClass: RedisUserRepository,
    },
    {
      provide: InjectionTokens.GuestRepository,
      useClass: RedisGuestRepository,
    },
    {
      provide: InjectionTokens.RefreshTokenRepository,
      useClass: RedisRefreshTokenRepository,
    },
    {
      provide: InjectionTokens.AccessTokenRepository,
      useClass: RedisAccessTokenRepository,
    },
  ],
  exports: [UserService, GuestService, JwtAuthGuard],
})
export class AuthModule {}
