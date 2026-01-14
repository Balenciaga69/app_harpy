import { Injectable } from '@nestjs/common'
import {
  ICharacterContext,
  IContextBatchRepository,
  IContextUpdateResult,
  IRunContext,
  IShopContext,
  IStashContext,
} from '../../../from-game-core'
@Injectable()
export class InMemoryContextRepository implements IContextBatchRepository {
  private store = new Map<string, unknown>()
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
      return null
    }
    if (updates.run) {
      this.store.set(`run:${runId}`, updates.run.context)
    }
    if (updates.character) {
      this.store.set(`character:${runId}`, updates.character.context)
    }
    if (updates.stash) {
      this.store.set(`stash:${runId}`, updates.stash.context)
    }
    if (updates.shop) {
      this.store.set(`shop:${runId}`, updates.shop.context)
    }
    return Promise.resolve({
      success: true,
      runContext: updates.run?.context,
      stashContext: updates.stash?.context,
      characterContext: updates.character?.context,
      shopContext: updates.shop?.context,
      globalVersion: (globalVersion || 0) + 1,
    })
  }
  getByKey(key: string): unknown {
    return this.store.get(key) ?? null
  }
  async getByRunId(runId: string): Promise<IContextUpdateResult | null> {
    if (!runId) {
      return null
    }
    const runContext = this.store.get(`run:${runId}`) as IRunContext | undefined
    if (!runContext) {
      return null
    }
    return Promise.resolve({
      success: true,
      runContext,
      characterContext: (this.store.get(`character:${runId}`) as ICharacterContext | undefined) ?? undefined,
      stashContext: (this.store.get(`stash:${runId}`) as IStashContext | undefined) ?? undefined,
      shopContext: (this.store.get(`shop:${runId}`) as IShopContext | undefined) ?? undefined,
    })
  }
}
