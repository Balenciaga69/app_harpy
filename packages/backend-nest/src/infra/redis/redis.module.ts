import { Module, Global, Logger } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import type { RedisOptions } from 'ioredis'
export const REDIS_CLIENT = 'REDIS_CLIENT'
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule')
        // 從環境變數讀取設定
        const host = configService.get<string>('REDIS_HOST', 'localhost')
        const port = configService.get<number>('REDIS_PORT', 6379)
        const password = configService.get<string>('REDIS_PASSWORD')
        const db = configService.get<number>('REDIS_DB', 0)
        // 連線配置
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
          // 連線逾時時間（毫秒，可選）
          // connectTimeout: 10000,
          // 命令逾時時間（毫秒，可選）
          // commandTimeout: 5000,
          // 是否自動重新連線（可選）
          // autoReconnect: true,
          // 是否啟用 offline 佇列（可選，預設 true）
          // enableOfflineQueue: true,
        }
        // 若設定密碼則加入
        if (password) {
          redisOptions.password = password
        }
        const redis = new Redis(redisOptions)
        // 事件監聽（除錯與監控）
        redis.on('connect', () => {
          logger.log(`✓ Redis 已連接 (${host}:${port}, db=${db})`)
        })
        redis.on('ready', () => {
          logger.log('✓ Redis 已準備好')
        })
        redis.on('error', (err: Error) => {
          logger.error(`✗ Redis 錯誤: ${err.message}`, err.stack)
        })
        redis.on('reconnecting', () => {
          logger.warn('⟳ Redis 正在重新連線...')
        })
        redis.on('close', () => {
          logger.warn('⊘ Redis 連線已關閉')
        })
        return redis
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
