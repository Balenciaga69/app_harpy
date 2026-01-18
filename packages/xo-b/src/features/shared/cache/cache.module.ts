import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        password: config.get('REDIS_PASSWORD'),
        db: config.get('REDIS_DB', 0),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
