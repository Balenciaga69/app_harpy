import { Injectable, Inject, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import {
  ICharacterContext,
  IContextBatchRepository,
  IRunContext,
  IShopContext,
  IStashContext,
  IContextUpdateResult,
} from '../../from-game-core'
import { REDIS_CLIENT } from '../redis/redis.module'
@Injectable()
export class RedisContextRepository implements IContextBatchRepository {
  private readonly logger = new Logger(RedisContextRepository.name)
  private readonly GLOBAL_VERSION_KEY = 'version:global'
  constructor(@Inject(REDIS_CLIENT) private readonly redis: InstanceType<typeof Redis>) {}
  async updateBatch(
    updates: {
      run?: { context: IRunContext; expectedVersion: number }
      stash?: { context: IStashContext; expectedVersion: number }
      character?: { context: ICharacterContext; expectedVersion: number }
      shop?: { context: IShopContext; expectedVersion: number }
    },
    globalVersion?: number
  ): Promise<IContextUpdateResult | null> {
    const runId =
      updates.run?.context.runId ||
      updates.character?.context.runId ||
      updates.stash?.context.runId ||
      updates.shop?.context.runId
    if (!runId) {
      this.logger.warn('updateBatch: 無法提取 runId，操作被拒絕')
      return null
    }
    try {
      const pipeline = this.redis.pipeline()
      if (updates.run) {
        pipeline.set(this.getRunContextKey(runId), JSON.stringify(updates.run.context), 'EX', this.getTTL())
      }
      if (updates.character) {
        pipeline.set(this.getCharacterContextKey(runId), JSON.stringify(updates.character.context), 'EX', this.getTTL())
      }
      if (updates.stash) {
        pipeline.set(this.getStashContextKey(runId), JSON.stringify(updates.stash.context), 'EX', this.getTTL())
      }
      if (updates.shop) {
        pipeline.set(this.getShopContextKey(runId), JSON.stringify(updates.shop.context), 'EX', this.getTTL())
      }
      const nextVersion = (globalVersion || 0) + 1
      pipeline.set(this.GLOBAL_VERSION_KEY, nextVersion.toString())
      await pipeline.exec()
      return {
        success: true,
        runContext: updates.run?.context,
        stashContext: updates.stash?.context,
        characterContext: updates.character?.context,
        shopContext: updates.shop?.context,
        globalVersion: nextVersion,
      }
    } catch (error) {
      this.logger.error(`updateBatch 失敗 (runId: ${runId}): ${error instanceof Error ? error.message : String(error)}`)
      return null
    }
  }
  getByKey(key: string): unknown {
    this.logger.warn(`getByKey 為同步方法，不支持 Redis 操作，建議改用非同步方法 (key: ${key})`)
    return null
  }
  async getByRunId(runId: string): Promise<IContextUpdateResult | null> {
    if (!runId) {
      this.logger.warn('getByRunId: runId 為空，操作被拒絕')
      return null
    }
    try {
      const [runData, characterData, stashData, shopData, globalVersionStr] = await Promise.all([
        this.redis.get(this.getRunContextKey(runId)),
        this.redis.get(this.getCharacterContextKey(runId)),
        this.redis.get(this.getStashContextKey(runId)),
        this.redis.get(this.getShopContextKey(runId)),
        this.redis.get(this.GLOBAL_VERSION_KEY),
      ])
      if (!runData) {
        return null
      }
      return {
        success: true,
        runContext: JSON.parse(runData) as IRunContext,
        characterContext: characterData ? (JSON.parse(characterData) as ICharacterContext) : undefined,
        stashContext: stashData ? (JSON.parse(stashData) as IStashContext) : undefined,
        shopContext: shopData ? (JSON.parse(shopData) as IShopContext) : undefined,
        globalVersion: globalVersionStr ? parseInt(globalVersionStr, 10) : 0,
      }
    } catch (error) {
      this.logger.error(`getByRunId 失敗 (runId: ${runId}): ${error instanceof Error ? error.message : String(error)}`)
      return null
    }
  }
  private getRunContextKey(runId: string): string {
    return `run:${runId}`
  }
  private getCharacterContextKey(runId: string): string {
    return `character:${runId}`
  }
  private getStashContextKey(runId: string): string {
    return `stash:${runId}`
  }
  private getShopContextKey(runId: string): string {
    return `shop:${runId}`
  }
  private getTTL(): number {
    return 86400
  }
}
