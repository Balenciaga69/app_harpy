import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
/**
 * 全局 Cache 模組
 *
 * 職責：
 *   - 提供統一的 Cache 抽象層（基於 @nestjs/cache-manager）
 *   - 支持多種存儲後端（Memory、Redis、Memcached 等）
 *   - 應用級別的 Cache 策略配置
 *
 * 與 RedisModule 的關係：
 *   - CacheModule 是「使用模式」（如何快速存取）
 *   - RedisModule 是「存儲介質」（在哪裡存數據）
 *   - 當 CacheModule 需要持久化存儲時，會使用 Redis 作為後端
 *
 * 設計原則：
 *   - 分層設計：應用層只需感知 Cache 接口，無需關心底層存儲
 *   - 配置集中：所有 Cache 相關配置在此處統一管理
 *   - 全局共享：isGlobal: true，整個應用都可以注入使用
 *
 * @example
 * // 在 service 中使用
 * constructor(private cacheManager: Cache) {}
 *
 * async getCachedData(key: string) {
 *   let data = await this.cacheManager.get(key)
 *   if (!data) {
 *     data = await this.expensiveOperation()
 *     await this.cacheManager.set(key, data, 3600000) // 1 小時
 *   }
 *   return data
 * }
 */
@Module({
  imports: [
    CacheModule.register({
      /**
       * isGlobal: true 表示整個應用都可以注入 Cache
       * 這樣任何模組都可以使用，而無需在每個模組中重新導入
       */
      isGlobal: true,
      /**
       * 可選配置（當前使用默認值）
       * 若要使用 Redis 作為後端，配置如下：
       *
       * import redisStore from 'cache-manager-redis-store';
       * import type { RedisClientOptions } from 'redis';
       *
       * store: await redisStore({
       *   socket: {
       *     host: 'localhost',
       *     port: 6379,
       *   },
       * } as unknown as RedisClientOptions),
       */
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
