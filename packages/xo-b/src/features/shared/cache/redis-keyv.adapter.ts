import Redis from 'ioredis'
/**
 * Keyv Redis Adapter
 *
 * 將 ioredis instance 適配給 Keyv 使用
 * 這樣可以復用同一個 Redis 連線，避免創建多條 TCP 連接
 *
 * 特點：
 * - 自動加 prefix (預設 "keyv:")
 * - 自動 JSON 序列化
 * - TTL 支持（毫秒轉秒）
 */
export class RedisKeyvAdapter {
  constructor(
    private readonly redis: Redis,
    private readonly prefix: string = 'keyv'
  ) {}
  private makeKey(key: string): string {
    return `${this.prefix}:${key}`
  }
  async get(key: string): Promise<Record<string, unknown> | undefined> {
    try {
      const data = await this.redis.get(this.makeKey(key))
      if (!data) return undefined
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(data)
    } catch {
      // 如果解析失敗或其他錯誤，返回 undefined
      return undefined
    }
  }
  async set(key: string, value: Record<string, unknown>, ttl?: number): Promise<void> {
    const prefixedKey = this.makeKey(key)
    const serialized = JSON.stringify(value)
    if (ttl !== undefined) {
      // CacheManager 的 ttl 是毫秒，ioredis setex 需要秒
      const ttlSeconds = Math.floor(ttl / 1000)
      await this.redis.setex(prefixedKey, ttlSeconds, serialized)
    } else {
      await this.redis.set(prefixedKey, serialized)
    }
  }
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(this.makeKey(key))
      return result === 1
    } catch {
      return false
    }
  }
  async clear(): Promise<void> {
    try {
      const pattern = `${this.prefix}:*`
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch {
      // 清空失敗時靜默處理
    }
  }
  async has(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.makeKey(key))
      return result === 1
    } catch {
      return false
    }
  }
}
