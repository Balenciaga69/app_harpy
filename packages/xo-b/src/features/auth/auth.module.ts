import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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
import { JwtRefreshGuard } from './user/jwt-refresh.guard'
import { JwtStatefulAuthGuard } from './user/jwt-stateful-auth.guard'
import { JwtStatelessAuthGuard } from './user/jwt-stateless-auth.guard'
import { RedisUserRepository } from './user/repository/user.repository'
import { JwtRefreshStrategy } from './user/strategy/jwt-refresh.strategy'
import { JwtStatefulStrategy } from './user/strategy/jwt-stateful.strategy'
import { JwtStatelessStrategy } from './user/strategy/jwt-stateless.strategy'
import { LocalStrategy } from './user/strategy/local.strategy'
import { UserService } from './user/user.service'
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<number>('JWT_ACCESS_TOKEN_EXPIRY_SECONDS') || JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS,
          algorithm: JWT_CONFIG.ALGORITHM,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    GuestService,
    SessionManager,
    LocalStrategy,
    JwtStatefulStrategy,
    JwtStatelessStrategy,
    JwtRefreshStrategy,
    JwtStatefulAuthGuard,
    JwtStatelessAuthGuard,
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
  exports: [UserService, GuestService, JwtStatefulAuthGuard, JwtStatelessAuthGuard],
})
export class AuthModule {}
