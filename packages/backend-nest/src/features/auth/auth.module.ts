import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import Redis from 'ioredis'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { AuthController } from './auth.controller'
import { AllowAnonymousGuard, IsAuthenticatedGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { JwtTokenProvider } from './jwt-token-provider'
import { JwtStrategy } from './jwt.strategy'
import { InMemoryUserRepository } from './repository/in-memory-user-repository'
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
      useFactory: (configService: ConfigService, redis: Redis) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'memory')
        if (storageType === 'memory') {
          return new InMemoryUserRepository()
        }
        return new RedisUserRepository(redis)
      },
      inject: [ConfigService, InjectionTokens.RedisClient],
    },
    JwtStrategy,
    IsAuthenticatedGuard,
    AllowAnonymousGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, IsAuthenticatedGuard, AllowAnonymousGuard, InjectionTokens.UserRepository],
})
export class AuthModule {}
