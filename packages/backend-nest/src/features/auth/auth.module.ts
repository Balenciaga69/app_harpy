import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { AuthController } from './auth.controller'
import { AllowAnonymousGuard, IsAuthenticatedGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { JwtTokenProvider } from './jwt-token-provider'
import { JwtStrategy } from './jwt.strategy'
import { RedisUserRepository } from './repository/redis-user-repository'
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key',
    }),
  ],
  providers: [
    AuthService,
    JwtTokenProvider,
    {
      provide: InjectionTokens.UserRepository,
      useClass: RedisUserRepository,
    },
    JwtStrategy,
    IsAuthenticatedGuard,
    AllowAnonymousGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, IsAuthenticatedGuard, AllowAnonymousGuard, InjectionTokens.UserRepository],
})
export class AuthModule {}
