import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { IAppContext } from '../../from-game-core'

/**
 * 統一的上下文管理服務
 *
 * 功能：
 * - 管理請求級別的上下文生命週期（AsyncLocalStorage）
 * - 提供持久化上下文的存取和保存
 * - 統一的接口用於業務邏輯層
 *
 * 職責邊界：
 * - ContextStorage (已廢棄)：運行時上下文存儲 ← 由 ContextManager 替代
 * - AppContextRepository (已廢棄)：持久化存儲 ← 由 ContextManager 內部使用
 */
@Injectable()
export class ContextManager {
  private static readonly store = new AsyncLocalStorage<IAppContext>()
  private persistentStore = new Map<string, IAppContext>()

  /**
   * 設置當前請求的上下文
   * 內部使用 AsyncLocalStorage 確保在非同步操作中保持隔離
   */
  setContext(appContext: IAppContext): void {
    ContextManager.store.enterWith(appContext)
  }

  /**
   * 取得當前請求的上下文
   * 返回 null 如果沒有設置上下文
   */
  getContext(): IAppContext | null {
    const context = ContextManager.store.getStore()
    if (!context) {
      console.warn('No AppContext found in ContextManager')
      return null
    }
    return context
  }

  /**
   * 檢查是否存在上下文
   */
  hasContext(): boolean {
    return ContextManager.store.getStore() !== undefined
  }

  /**
   * 在特定上下文中運行函數
   */
  runWithContext<T>(appContext: IAppContext, fn: () => T): T {
    return ContextManager.store.run(appContext, fn)
  }

  /**
   * 持久化上下文到存儲
   */
  saveContext(appContext: IAppContext): void {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }
    this.persistentStore.set(runId, this.deepCopy(appContext))
  }

  /**
   * 從存儲取得上下文
   */
  getContextByRunId(runId: string): IAppContext | null {
    if (!runId) {
      return null
    }
    const ctx = this.persistentStore.get(runId)
    return ctx ? this.deepCopy(ctx) : null
  }

  /**
   * 檢查特定 runId 的上下文是否存在
   */
  contextExists(runId: string): boolean {
    return this.persistentStore.has(runId)
  }

  /**
   * 刪除特定 runId 的上下文
   */
  deleteContext(runId: string): void {
    this.persistentStore.delete(runId)
  }

  /**
   * 深複製物件（用於隔離存儲的上下文和當前上下文）
   */
  private deepCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }
}
