import { IAffixStore, IEnemyStore, IItemStore, IUltimateStore } from '../../static-config/store/IConfigStores'
import { ICharacterContext } from './ICharacterContext'
import { IRunContext } from './IRunContext'
import { IStashContext } from './IStashContext'
/** 所有上下文容器 */
interface IContexts {
  readonly runContext: IRunContext
  readonly stashContext: IStashContext
  readonly characterContext: ICharacterContext
}
/** 配置存儲容器 */
interface IConfigStore {
  readonly enemyStore: IEnemyStore
  readonly itemStore: IItemStore
  readonly affixStore: IAffixStore
  readonly ultimateStore: IUltimateStore
}
/**
 * 應用上下文：包含遊戲運行時所需的所有上下文與配置
 * 職責：中央化管理所有上下文與配置存儲，確保一致性存取
 */
export interface IAppContext {
  readonly contexts: IContexts
  readonly configStore: IConfigStore
}
