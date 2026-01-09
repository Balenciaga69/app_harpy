import {
  IAffixStore,
  IEnemyStore,
  IItemStore,
  IProfessionStore,
  IShopStore,
  IUltimateStore,
} from '../../static-config/IConfigStores'
import { ICharacterContext } from './ICharacterContext'
import { IRunContext } from './IRunContext'
import { IShopContext } from './IShopContext'
import { IStashContext } from './IStashContext'
interface IContexts {
  readonly runContext: IRunContext
  readonly stashContext: IStashContext
  readonly characterContext: ICharacterContext
  readonly shopContext: IShopContext
}
interface IConfigStore {
  readonly enemyStore: IEnemyStore
  readonly itemStore: IItemStore
  readonly affixStore: IAffixStore
  readonly ultimateStore: IUltimateStore
  readonly professionStore: IProfessionStore
  readonly shopStore: IShopStore
}
export interface IAppContext {
  readonly contexts: IContexts
  readonly configStore: IConfigStore
}
