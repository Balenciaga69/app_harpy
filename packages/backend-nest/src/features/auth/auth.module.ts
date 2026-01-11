import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './app/auth.service'
import { JwtTokenProvider } from './infra/jwt.token.provider'
import { RedisUserRepository } from './infra/RedisUserRepository'
import { JwtStrategy } from './infra/jwt.strategy'
import { IsAuthenticatedGuard, AllowAnonymousGuard } from './infra/auth.guard'
import { AuthController } from './auth.controller'
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
  exports: [AuthService, IsAuthenticatedGuard, AllowAnonymousGuard],
})
export class AuthModule {}
