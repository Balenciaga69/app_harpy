import KeyvRedis from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Keyv } from 'keyv'
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (conf: ConfigService) => {
        const storageType = conf.get<string>('STORAGE_TYPE', 'memory')
        // 只在 storageType 為 'redis' 時才連接 Redis
        if (storageType === 'redis') {
          const host = conf.get<string>('REDIS_HOST') || 'localhost'
          const port = parseInt(conf.get<string>('REDIS_PORT') || '6379', 10)
          const password = conf.get<string>('REDIS_PASSWORD')
          const db = conf.get<number>('REDIS_DB') || 0
          try {
            // eslint-disable-next-line no-console
            console.log(`[CacheModule] Connecting to Redis: ${host}:${port} db=${db}`)
            const connectionString = password
              ? `redis://:${password}@${host}:${port}/${db}`
              : `redis://${host}:${port}/${db}`
            const store = new Keyv(new KeyvRedis(connectionString))
            // eslint-disable-next-line no-console
            console.log('[CacheModule] ✓ Redis store initialized successfully')
            return {
              stores: [store],
              ttl: 600 * 1000, // 轉換為毫秒
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[CacheModule] ✗ Redis connection failed:', error)
            throw error
          }
        }
        // 使用 in-memory cache
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
