import { ICharacterContext } from '../context/interface/ICharacterContext'
import { IRunContext } from '../context/interface/IRunContext'
import { IShopContext } from '../context/interface/IShopContext'
import { IStashContext } from '../context/interface/IStashContext'
import { WithRunIdAndVersion } from '../context/interface/WithRunIdAndVersion'
interface ISingleContextUpdate<T> {
  context: T
  expectedVersion: number
}
type ContextKey = 'RUN' | 'STASH' | 'CHARACTER' | 'SHOP'
export interface IRepository<T extends WithRunIdAndVersion> {
  getById(id: string): Promise<T | null>
  update(context: T, expectedVersion: number): Promise<T | null>
  create(context: T): Promise<T>
  delete(id: string): Promise<void>
}
export interface IContextUpdateResult {
  success: boolean
  runContext?: IRunContext
  stashContext?: IStashContext
  characterContext?: ICharacterContext
  shopContext?: IShopContext
  failedKeys?: ContextKey[]
  globalVersion?: number
}
export interface IRunContextRepository extends IRepository<IRunContext> {}
export interface IStashContextRepository extends IRepository<IStashContext> {}
export interface ICharacterContextRepository extends IRepository<ICharacterContext> {}
export interface IContextBatchRepository {
  updateBatch(
    updates: {
      run?: ISingleContextUpdate<IRunContext>
      stash?: ISingleContextUpdate<IStashContext>
      character?: ISingleContextUpdate<ICharacterContext>
      shop?: ISingleContextUpdate<IShopContext>
    },
    globalVersion?: number
  ): Promise<IContextUpdateResult | null>
}
