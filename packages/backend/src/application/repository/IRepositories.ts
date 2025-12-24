import { ICharacterContext } from '../context/interface/ICharacterContext'
import { IRunContext } from '../context/interface/IRunContext'
import { IStashContext } from '../context/interface/IStashContext'
import { WithRunIdAndVersion } from '../context/interface/WithRunIdAndVersion'
interface ISingleContextUpdate<T> {
  context: T
  expectedVersion: number
}
type ContextKey = 'RUN' | 'STASH' | 'CHARACTER'
export interface IRepository<T extends WithRunIdAndVersion> {
  getById(id: string): Promise<T | null>
  update(context: T, expectedVersion: number): Promise<T | null>
  create(context: T): Promise<T>
  delete(id: string): Promise<void>
}
interface IContextUpdateResult {
  success: boolean
  runContext?: IRunContext
  stashContext?: IStashContext
  characterContext?: ICharacterContext
  failedKeys?: ContextKey[]
  globalVersion?: number // 成功時回傳新的全域版本
}
export interface IRunContextRepository extends IRepository<IRunContext> {}
export interface IStashContextRepository extends IRepository<IStashContext> {}
export interface ICharacterContextRepository extends IRepository<ICharacterContext> {}
export interface IContextBatchRepository {
  /// 原子性更新 1 或多個 context
  /// 若任一失敗則全部回滾, globalVersion 用於跨 context 一致性檢查
  /// 回傳 null 表示版本衝突, 調用端需 retry
  updateBatch(
    updates: {
      run?: ISingleContextUpdate<IRunContext>
      stash?: ISingleContextUpdate<IStashContext>
      character?: ISingleContextUpdate<ICharacterContext>
    },
    globalVersion?: number
  ): Promise<IContextUpdateResult | null>
}
