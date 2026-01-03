import { ICharacterContext } from '../context/interface/ICharacterContext'
import { IRunContext } from '../context/interface/IRunContext'
import { IShopContext } from '../context/interface/IShopContext'
import { IStashContext } from '../context/interface/IStashContext'
import { WithRunIdAndVersion } from '../context/interface/WithRunIdAndVersion'
/** 單一上下文更新的請求 */
interface ISingleContextUpdate<T> {
  context: T
  expectedVersion: number
}
/** 可更新的上下文類型 */
type ContextKey = 'RUN' | 'STASH' | 'CHARACTER' | 'SHOP'
/**
 * 通用持久化存儲介面：支援上下文的 CRUD 操作
 * 版本控制策略：樂觀鎖(expectedVersion)確保並發安全
 */
export interface IRepository<T extends WithRunIdAndVersion> {
  /** 根據 ID 查詢上下文 */
  getById(id: string): Promise<T | null>
  /** 根據樂觀鎖更新上下文，版本不符返回 null */
  update(context: T, expectedVersion: number): Promise<T | null>
  /** 創建新上下文(初始版本為 0) */
  create(context: T): Promise<T>
  /** 刪除上下文 */
  delete(id: string): Promise<void>
}
/** 上下文批量更新結果 */
interface IContextUpdateResult {
  success: boolean
  runContext?: IRunContext
  stashContext?: IStashContext
  characterContext?: ICharacterContext
  shopContext?: IShopContext
  failedKeys?: ContextKey[]
  globalVersion?: number // 成功時回傳新的全域版本
}
/** Run 上下文存儲介面 */
export interface IRunContextRepository extends IRepository<IRunContext> {}
/** 倉庫上下文存儲介面 */
export interface IStashContextRepository extends IRepository<IStashContext> {}
/** 角色上下文存儲介面 */
export interface ICharacterContextRepository extends IRepository<ICharacterContext> {}
/**
 * 批量上下文更新介面：支援多個上下文的原子性更新
 * 特點：全部成功或全部失敗(回滾)，確保一致性
 */
export interface IContextBatchRepository {
  /**
   * 原子性更新 1 或多個上下文
   * 業務規則：若任一上下文版本衝突，則全部回滾，調用端需重試
   * 邊界：globalVersion 用於跨上下文的全局版本檢查
   * 副作用：成功時修改所有指定上下文的版本號與內容
   */
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
