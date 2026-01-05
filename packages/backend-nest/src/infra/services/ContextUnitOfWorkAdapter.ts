import { Injectable } from '@nestjs/common'
import { IContextUnitOfWork, ContextUnitOfWork, AppContextService, IAppContext } from '../../from-game-core'
import { InMemoryContextRepository } from '../repositories/InMemoryContextRepository'

/**
 * ContextUnitOfWork 適配器
 * 用途：橋接 game-core 的 ContextUnitOfWork 與 backend 的 InMemoryContextRepository
 * 職責：
 *   1. 建立標準的 ContextUnitOfWork（AppContextService 實現）
 *   2. 包裝 commit 邏輯以支持自動持久化到儲存庫
 * 優點：類型安全、自動持久化、無須 as any 強制轉換
 */
@Injectable()
export class ContextUnitOfWorkAdapter {
  constructor(private readonly contextRepo: InMemoryContextRepository) {}

  /**
   * 建立一個 IContextUnitOfWork 實例
   * @param initialContext 初始應用上下文
   * @returns IContextUnitOfWork 實例，commit 時會自動同步到儲存庫
   */
  createUnitOfWork(initialContext: IAppContext): IContextUnitOfWork {
    // 步驟 1：建立 AppContextService（同時實現 IContextMutator 和 IContextSnapshotAccessor）
    const appContextService = new AppContextService(initialContext)

    // 步驟 2：建立標準的 ContextUnitOfWork
    const unitOfWork = new ContextUnitOfWork(
      appContextService, // 提供 IContextMutator
      appContextService // 提供 IContextSnapshotAccessor
    )

    // 步驟 3：包裝原有的 commit 方法，在提交後同步到儲存庫
    const originalCommit = unitOfWork.commit.bind(unitOfWork)
    unitOfWork.commit = () => {
      // 執行原有的提交邏輯
      originalCommit()

      // 提交成功後，將最新的上下文同步到 InMemoryContextRepository
      const contexts = appContextService.getAllContexts()
      const runId = contexts.runContext.runId

      if (runId) {
        // 批量更新到儲存庫
        Promise.all([
          this.contextRepo.updateRunContext(runId, contexts.runContext),
          this.contextRepo.updateCharacterContext(runId, contexts.characterContext),
          this.contextRepo.updateStashContext(runId, contexts.stashContext),
          this.contextRepo.updateShopContext(runId, contexts.shopContext),
        ]).catch((err) => {
          console.error('同步上下文到儲存庫失敗:', err)
        })
      }
    }

    return unitOfWork
  }
}
