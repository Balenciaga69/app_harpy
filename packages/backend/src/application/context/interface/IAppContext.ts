import { IAffixStore, IEnemyStore, IItemStore, IUltimateStore } from '../../store/IConfigStores'
import { ICharacterContext } from './ICharacterContext'
import { IRunContext } from './IRunContext'
import { IStashContext } from './IStashContext'
export interface IAppContext {
  readonly runContext: IRunContext
  readonly stashContext: IStashContext
  readonly characterContext: ICharacterContext
  readonly enemyStore: IEnemyStore
  readonly itemStore: IItemStore
  readonly affixStore: IAffixStore
  readonly ultimateStore: IUltimateStore
}
