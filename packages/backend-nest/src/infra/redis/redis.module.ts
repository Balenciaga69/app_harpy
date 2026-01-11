import { Global, Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import type { RedisOptions } from 'ioredis'
import Redis from 'ioredis'
import { InjectionTokens } from '../providers/injection-tokens'
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: InjectionTokens.RedisClient,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule')
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
