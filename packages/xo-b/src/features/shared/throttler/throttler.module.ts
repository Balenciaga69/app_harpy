import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('THROTTLE_TTL', 60) * 1000 // 轉換為毫秒
        const limit = configService.get<number>('THROTTLE_LIMIT', 30)
        return [
          {
            name: 'default',
            ttl,
            limit,
          },
          {
            name: 'login',
            ttl: 5 * 60 * 1000, // 5 分鐘
            limit: 30,
          },
          {
            name: 'register',
            ttl: 10 * 60 * 1000, // 10 分鐘
            limit: 30,
          },
        ]
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppThrottlerModule {}
