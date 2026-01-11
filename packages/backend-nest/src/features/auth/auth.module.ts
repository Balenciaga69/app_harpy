import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './app/auth.service'
import { AuthController } from './auth.controller'
import { AllowAnonymousGuard, IsAuthenticatedGuard } from './infra/auth.guard'
import { JwtTokenProvider } from './infra/jwt-token-provider'
import { JwtStrategy } from './infra/jwt.strategy'
import { RedisUserRepository } from './infra/redis-user-repository'
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
      provide: 'IUserRepository',
      useClass: RedisUserRepository,
    },
    JwtStrategy,
    IsAuthenticatedGuard,
    AllowAnonymousGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, IsAuthenticatedGuard, AllowAnonymousGuard, 'IUserRepository'],
})
export class AuthModule {}
