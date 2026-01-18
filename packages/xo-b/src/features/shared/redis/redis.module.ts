import { Global, Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import type { RedisOptions } from 'ioredis'
import Redis from 'ioredis'
import { InjectionTokens } from '../providers/injection-tokens'

/**
 * Redis 連接模組（全局模組）
 *
 * 職責：
 *   - 管理 Redis 連接的建立、配置、重試策略
 *   - 提供統一的 Redis 客戶端實例供全應用使用
 *   - 處理連接生命週期（連接、重連、錯誤處理）
 *
 * 重要概念：
 *   - Redis 是存儲介質（in-memory data store），純粹的數據存儲
 *   - 本身只提供 set/get/del 等基礎操作
 *   - 不包含任何「快速訪問」的業務邏輯
 *
 * 與 CacheConfigModule 的區別：
 *   ┌─────────────────────────────────────┐
 *   │  使用場景對比                         │
 *   ├─────────────────────────────────────┤
 *   │ CacheModule (使用模式)               │
 *   │ ├─ 業務：Session、Token、臨時數據   │
 *   │ ├─ TTL: 自動過期                    │
 *   │ ├─ 操作：get/set/delete            │
 *   │ └─ 例子：Cache.get('user:123')     │
 *   ├─────────────────────────────────────┤
 *   │ RedisModule (存儲介質)               │
 *   │ ├─ 業務：低層直接操作                │
 *   │ ├─ TTL: 手動管理                    │
 *   │ ├─ 操作：set/get/zadd/lpush...     │
 *   │ └─ 例子：redis.set('key', 'val')   │
 *   └─────────────────────────────────────┘
 *
 * 何時直接使用 RedisModule：
 *   - 需要複雜的 Redis 操作（Sorted Set、Stream 等）
 *   - 需要細粒度的 TTL 控制
 *   - 需要跨 Service 的數據共享結構
 *
 * @example
 * // 注入 Redis 客戶端
 * constructor(@Inject(InjectionTokens.RedisClient) private redis: Redis) {}
 *
 * // 直接操作
 * await this.redis.set('key', 'value', 'EX', 3600)
 * await this.redis.zadd('sorted-set', 1, 'member')
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: InjectionTokens.RedisClient,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule')
        const storageType = configService.get<string>('STORAGE_TYPE', 'memory')
        if (storageType !== 'redis') {
          logger.log('Storage type is not redis, skipping connection.')
          return null
        }
        const host = configService.get<string>('REDIS_HOST', 'localhost')
        const port = configService.get<number>('REDIS_PORT', 6379)
        const password = configService.get<string>('REDIS_PASSWORD')
        const db = configService.get<number>('REDIS_DB', 0)
        const redisOptions: RedisOptions = {
          host,
          port,
          db,
          retryStrategy: (times: number) => {
            // 指數退避重試策略
            const delay = Math.min(times * 50, 2000)
            return delay
          },
          maxRetriesPerRequest: null,
          // 重試次數上限（可選）
          // maxRedisRetries: 10,
          // 連線逾時時間（毫秒, 可選）
          // connectTimeout: 10000,
          // 命令逾時時間（毫秒, 可選）
          // commandTimeout: 5000,
          // 是否自動重新連線（可選）
          // autoReconnect: true,
          // 是否啟用 offline 佇列（可選, 預設 true）
          // enableOfflineQueue: true,
        }
        if (password) {
          redisOptions.password = password
        }
        const redis = new Redis(redisOptions)
        const logPrefix = `[Redis][${host}:${port}][db=${db}]`
        redis.on('connect', () => {
          logger.log(`${logPrefix} ✓ 已連接`)
        })
        redis.on('ready', () => {
          logger.log(`${logPrefix} ✓ 已準備好`)
        })
        redis.on('error', (err: Error) => {
          logger.error(`${logPrefix} ✗ 錯誤: ${err.message}`, err.stack)
        })
        redis.on('reconnecting', (times: number) => {
          logger.warn(`${logPrefix} ⟳ 正在重新連線...（第 ${times ?? '?'} 次）`)
        })
        redis.on('close', () => {
          logger.warn(`${logPrefix} ⊘ 連線已關閉`)
        })
        return redis
      },
      inject: [ConfigService],
    },
  ],
  exports: [InjectionTokens.RedisClient],
})
export class RedisModule {}
