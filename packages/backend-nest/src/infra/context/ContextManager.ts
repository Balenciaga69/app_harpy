import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { IAppContext } from '../../from-game-core'

// ⭐ 從 IAppContext 提取 IConfigStore 類型
type IConfigStore = IAppContext['configStore']

/**
 * Run 執行上下文：只包含可變部分（不含 ConfigStore）
 * 職責：存儲每個 run 獨有的動態狀態
 */
interface IRunExecutionContext {
  readonly runContext: IAppContext['contexts']['runContext']
  readonly characterContext: IAppContext['contexts']['characterContext']
  readonly stashContext: IAppContext['contexts']['stashContext']
  readonly shopContext: IAppContext['contexts']['shopContext']
}

/**
 * Singleton 服務：管理所有 run 的執行上下文
 *
 * 設計原則：
 * - ConfigStore 全局單例，所有 run 共享（不拷貝）
 * - RunContext 按 runId 隔離（深拷貝以保證獨立性）
 * - 避免冗余存儲，提高內存效率
 *
 * 職責：
 * 1. 提供全局 ConfigStore（readonly，所有 run 共享）
 * 2. 管理每個 run 的執行上下文（隔離存儲）
 * 3. 支持 AsyncLocalStorage 用於 request-scoped 上下文傳遞
 * 4. 組合視圖：在需要時返回完整的 IAppContext
 *
 * 層級：infra（基礎設施層）
 * 原因：上下文管理是技術細節，需要全局單例
 */
@Injectable()
export class ContextManager {
  // ⭐ AsyncLocalStorage：用於 request scope 的上下文傳遞
  private static readonly store = new AsyncLocalStorage<IAppContext>()

  // ⭐ 全局 ConfigStore，所有 run 共享（不拷貝）
  private globalConfigStore: IConfigStore

  // ⭐ 每個 run 的執行上下文（只包含可變部分）
  private runContexts = new Map<string, IRunExecutionContext>()

  constructor(configStore: IConfigStore) {
    this.globalConfigStore = configStore
  }

  /**
   * 設置當前 AsyncLocalStorage 中的 context
   * 用於 request scope 的上下文傳遞
   */
  setContext(appContext: IAppContext): void {
    if (ContextManager.store.getStore()) {
      throw new Error('Context already set for this async scope — use runWithContext to create an isolated scope')
    }
    ContextManager.store.enterWith(appContext)
  }

  /**
   * 獲取當前 AsyncLocalStorage 中的 context
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
   * 檢查是否存在當前 AsyncLocalStorage context
   */
  hasContext(): boolean {
    return ContextManager.store.getStore() !== undefined
  }

  /**
   * 在隔離的 AsyncLocalStorage scope 中運行函數
   */
  runWithContext<T>(appContext: IAppContext, fn: () => T): T {
    return ContextManager.store.run(appContext, fn)
  }

  /**
   * 持久化 run 的執行上下文
   * ⭐ 只存儲 contexts 部分，不存儲 ConfigStore（全局共享）
   */
  saveContext(appContext: IAppContext): void {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }

    // ⭐ 只拷貝可變的 contexts 部分
    const contexts = appContext.contexts
    this.runContexts.set(runId, {
      runContext: this.shallowCopy(contexts.runContext),
      characterContext: this.shallowCopy(contexts.characterContext),
      stashContext: this.shallowCopy(contexts.stashContext),
      shopContext: this.shallowCopy(contexts.shopContext),
    })
  }

  /**
   * 獲取完整的 AppContext（包含全局 ConfigStore）
   * 組合視圖：返回的是動態組合的對象，不是存儲的數據
   */
  getContextByRunId(runId: string): IAppContext | null {
    if (!runId) {
      return null
    }

    const runContext = this.runContexts.get(runId)
    if (!runContext) {
      return null
    }

    // ⭐ 組合全局 ConfigStore + Run-specific contexts
    return {
      configStore: this.globalConfigStore, // 直接引用，不拷貝
      contexts: {
        runContext: this.shallowCopy(runContext.runContext),
        characterContext: this.shallowCopy(runContext.characterContext),
        stashContext: this.shallowCopy(runContext.stashContext),
        shopContext: this.shallowCopy(runContext.shopContext),
      },
    }
  }

  /**
   * 檢查是否存在特定 runId 的上下文
   */
  contextExists(runId: string): boolean {
    return this.runContexts.has(runId)
  }

  /**
   * 刪除 run 上下文（釋放內存）
   * ⚠️ 重要：run 結束時必須調用此方法，避免內存洩漏
   */
  deleteContext(runId: string): void {
    this.runContexts.delete(runId)
  }

  /**
   * 直接訪問全局 ConfigStore
   * 用於需要配置的服務
   */
  getConfigStore(): IConfigStore {
    return this.globalConfigStore
  }

  /**
   * 淺拷貝：用於複製上下文對象（確保獨立性，但保留內部引用）
   * 相比深拷貝，性能更好且不會破壞引用
   */
  private shallowCopy(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    return { ...obj }
  }
}
