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
import { PasswordHasher } from './password-hasher'
import { InMemoryUserRepository } from './repository/in-memory-user-repository'
import { RedisUserRepository } from './repository/redis-user-repository'
import { TokenBlacklistService } from './token-blacklist.service'
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required')
        }
        return {
          secret,
        }
      },
    }),
  ],
  providers: [
    AuthService,
    JwtTokenProvider,
    PasswordHasher,
    TokenBlacklistService,
    {
      provide: InjectionTokens.UserRepository,
      useFactory: (configService: ConfigService, redis?: Redis) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'memory')
        if (storageType === 'memory') {
          return new InMemoryUserRepository()
        }
        if (!redis) {
          throw new Error('Redis client is not available. Please check your STORAGE_TYPE configuration.')
        }
        return new RedisUserRepository(redis)
      },
      inject: [ConfigService, { token: InjectionTokens.RedisClient, optional: true }],
    },
    JwtStrategy,
    IsAuthenticatedGuard,
    AllowAnonymousGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    IsAuthenticatedGuard,
    AllowAnonymousGuard,
    InjectionTokens.UserRepository,
    TokenBlacklistService,
  ],
})
export class AuthModule {}
