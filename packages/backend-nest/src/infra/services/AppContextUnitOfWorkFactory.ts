import { IContextUnitOfWork, ContextUnitOfWork, AppContextService, IAppContext } from '../../from-game-core'

/**
 * 工廠函數：建立 UnitOfWork 執行個體
 * 每次呼叫都會產生新的實體（Transient 作用域）
 */
export function createUnitOfWork(appContext: IAppContext): IContextUnitOfWork {
  const contextService = new AppContextService(appContext)
  return new ContextUnitOfWork(contextService, contextService)
}
