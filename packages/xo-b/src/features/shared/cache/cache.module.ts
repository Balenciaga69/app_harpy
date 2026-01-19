import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { Keyv } from 'keyv'
import { InjectionTokens } from '../providers/injection-tokens'
import { RedisKeyvAdapter } from './redis-keyv.adapter'
import { RedisModule } from './redis.module'
@Module({
  imports: [
    RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService, InjectionTokens.RedisClient],
      useFactory: (conf: ConfigService, redis: Redis | null) => {
        const storageType = conf.get<string>('STORAGE_TYPE', 'memory')
        // ✅ 如果有 ioredis instance，用 Keyv adapter 複用它
        if (storageType === 'redis' && redis) {
          const adapter = new RedisKeyvAdapter(redis, 'keyv')
          const keyv = new Keyv({ store: adapter })
          // eslint-disable-next-line no-console
          console.log('[CacheModule] ✓ Using Redis with Keyv adapter (single connection)')
          return {
            stores: [keyv],
            ttl: 600 * 1000, // 毫秒
          }
        }
        // ✅ 降級到內存
        const memoryStore = new Keyv()
        // eslint-disable-next-line no-console
        console.log('[CacheModule] Using in-memory cache')
        return {
          stores: [memoryStore],
          ttl: 600 * 1000,
        }
      },
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
