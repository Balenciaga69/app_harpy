import Redis from 'ioredis'
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
      return undefined
    }
  }
  async set(key: string, value: Record<string, unknown>, ttl?: number): Promise<void> {
    const prefixedKey = this.makeKey(key)
    const serialized = JSON.stringify(value)
    if (ttl !== undefined) {
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
