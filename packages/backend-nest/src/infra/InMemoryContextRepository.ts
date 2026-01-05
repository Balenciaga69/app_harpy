import { Injectable } from '@nestjs/common'
import { IContextBatchRepository, IRunContext, IStashContext, ICharacterContext, IShopContext } from '../from-game-core'

/**
 * In-Memory 實作的批量上下文儲存庫
 * 用途：快速開發驗證，不具持久化能力
 * 注意：Server 重啟後資料消失，不適用於生產環境
 */
@Injectable()
export class InMemoryContextRepository implements IContextBatchRepository {
  private store = new Map<string, any>()

  /**
   * 原子性更新多個 Context（簡化版：無版本檢查）
   * 副作用：直接覆寫記憶體中的資料
   */
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
    // 提取 runId（所有 Context 共用）
    const runId =
      updates.run?.context.runId ||
      updates.character?.context.runId ||
      updates.stash?.context.runId ||
      updates.shop?.context.runId

    if (!runId) {
      return null
    }

    // 簡化實作：直接存入（忽略版本檢查）
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

  /** 根據 key 直接取得資料（測試用） */
  getByKey(key: string): any {
    return this.store.get(key) || null
  }

  /** 清空所有資料（測試用） */
  clear() {
    this.store.clear()
  }
}
