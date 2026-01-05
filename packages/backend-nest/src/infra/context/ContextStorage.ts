import { AsyncLocalStorage } from 'async_hooks'
import { IAppContext } from '../../from-game-core'

/**
 * 上下文儲存
 * 使用 AsyncLocalStorage 管理請求級別的 IAppContext
 * 讓所有異步調用都能存取當前的應用上下文
 */
export class ContextStorage {
  private static readonly store = new AsyncLocalStorage<IAppContext>()

  static setContext(appContext: IAppContext): void {
    ContextStorage.store.enterWith(appContext)
  }

  static getContext(): IAppContext {
    const context = ContextStorage.store.getStore()
    if (!context) {
      throw new Error('IAppContext not available in current async context')
    }
    return context
  }

  static hasContext(): boolean {
    return ContextStorage.store.getStore() !== undefined
  }

  static runWithContext<T>(appContext: IAppContext, fn: () => T): T {
    return ContextStorage.store.run(appContext, fn)
  }
}
