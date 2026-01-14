import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import Module from 'module'
import { RedisGuestRepository } from './guest/guest.repository'
import { RedisRefreshTokenRepository } from './user/repository/refresh-token.repository'
import { RedisUserRepository } from './user/repository/user.repository'
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    GuestService,
    RedisUserRepository,
    RedisGuestRepository,
    RedisRefreshTokenRepository,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    GuestGuard,
    TokenBlacklistService,
  ],
  exports: [UserService, GuestService, JwtAuthGuard, GuestGuard],
})
export class AuthModule {}
