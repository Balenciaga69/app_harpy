import { Injectable } from '@nestjs/common'
import {
  IContextBatchRepository,
  IRunContext,
  IStashContext,
  ICharacterContext,
  IShopContext,
} from '../../from-game-core'
@Injectable()
export class InMemoryContextRepository implements IContextBatchRepository {
  private store = new Map<string, any>()
  async updateBatch(
    updates: {
      run?: { context: IRunContext; expectedVersion: number }
      stash?: { context: IStashContext; expectedVersion: number }
      character?: { context: ICharacterContext; expectedVersion: number }
      shop?: { context: IShopContext; expectedVersion: number }
    },
    globalVersion?: number
  ): Promise<{
    success: boolean
    runContext?: IRunContext
    stashContext?: IStashContext
    characterContext?: ICharacterContext
    shopContext?: IShopContext
    globalVersion: number
  } | null> {
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
  async updateRunContext(runId: string, context: IRunContext) {
    this.store.set(`run:${runId}`, context)
    return Promise.resolve({ success: true })
  }
  async updateCharacterContext(runId: string, context: ICharacterContext) {
    this.store.set(`character:${runId}`, context)
    return Promise.resolve({ success: true })
  }
  async updateStashContext(runId: string, context: IStashContext) {
    this.store.set(`stash:${runId}`, context)
    return Promise.resolve({ success: true })
  }
  async updateShopContext(runId: string, context: IShopContext) {
    this.store.set(`shop:${runId}`, context)
    return Promise.resolve({ success: true })
  }
  async getRunContext(runId: string) {
    return Promise.resolve(this.store.get(`run:${runId}`) || null)
  }
  async getCharacterContext(runId: string) {
    return Promise.resolve(this.store.get(`character:${runId}`) || null)
  }
  async getStashContext(runId: string) {
    return Promise.resolve(this.store.get(`stash:${runId}`) || null)
  }
  async getShopContext(runId: string) {
    return Promise.resolve(this.store.get(`shop:${runId}`) || null)
  }
  getByKey(key: string): any {
    return this.store.get(key) || null
  }
  clear() {
    this.store.clear()
  }
}
