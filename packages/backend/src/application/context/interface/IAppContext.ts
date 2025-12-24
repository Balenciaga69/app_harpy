import { IAffixStore, IEnemyStore, IItemStore, IUltimateStore } from '../../store/IConfigStores'
import { ICharacterContext } from './ICharacterContext'
import { IRunContext } from './IRunContext'
import { IStashContext } from './IStashContext'

export interface IAppContext {
  readonly contexts: IContexts
  readonly configStore: IConfigStore
}
interface IContexts {
  readonly runContext: IRunContext
  readonly stashContext: IStashContext
  readonly characterContext: ICharacterContext
}
interface IConfigStore {
  readonly enemyStore: IEnemyStore
  readonly itemStore: IItemStore
  readonly affixStore: IAffixStore
  readonly ultimateStore: IUltimateStore
}
