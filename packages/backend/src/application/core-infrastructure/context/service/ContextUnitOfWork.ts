import { ICharacterContext } from '../interface/ICharacterContext'
import { IContextMutator } from './AppContextService'
import { IRunContext } from '../interface/IRunContext'
import { IStashContext } from '../interface/IStashContext'
//TODO: 添加跟 Shop 相關功能

/**
 * 上下文單位工作介面
 *
 * 職責：定義 UnitOfWork 模式的抽象，確保多個 Context 的變更作為一個原子性事務進行提交
 */
export interface IContextUnitOfWork {
  /** 更新角色上下文（不立即應用，等待 commit） */
  updateCharacterContext(ctx: ICharacterContext): IContextUnitOfWork
  /** 更新倉庫上下文（不立即應用，等待 commit） */
  updateStashContext(ctx: IStashContext): IContextUnitOfWork
  /** 更新運行上下文（不立即應用，等待 commit） */
  updateRunContext(ctx: IRunContext): IContextUnitOfWork
  /** 一次性提交所有待變更的 Context */
  commit(): void
  /** 放棄所有待變更的內容 */
  rollback(): void
  /** 檢查是否有待變更的內容 */
  hasCharacterChanges(): boolean
  hasStashChanges(): boolean
  hasRunChanges(): boolean
}
/**
 * 上下文單位工作（Context Unit of Work）
 *
 * 職責：將多個 Context 的變更作為一個原子性的事務進行提交
 * 優點：
 * - 防止開發者忘記更新某個 Context（如只更新了 Character 但忘記更新 Stash）
 * - 提供清晰的「開始事務」和「提交事務」的語義
 * - 易於未來擴展為真實的資料庫事務
 *
 * 使用方式：
 * const unitOfWork = new ContextUnitOfWork(appContextService)
 * unitOfWork.updateCharacterContext(newCharacter.record)
 * unitOfWork.updateStashContext(newStash.record)
 * unitOfWork.commit() // 一次性提交所有變更
 */
export class ContextUnitOfWork implements IContextUnitOfWork {
  private characterContextUpdate: ICharacterContext | null = null
  private stashContextUpdate: IStashContext | null = null
  private runContextUpdate: IRunContext | null = null
  private hasChanges = false
  constructor(private contextMutator: IContextMutator) {}
  /**
   * 更新角色上下文（不立即應用，等待 commit）
   */
  updateCharacterContext(ctx: ICharacterContext): this {
    this.characterContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }
  /**
   * 更新倉庫上下文（不立即應用，等待 commit）
   */
  updateStashContext(ctx: IStashContext): this {
    this.stashContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }
  /**
   * 更新運行上下文（不立即應用，等待 commit）
   */
  updateRunContext(ctx: IRunContext): this {
    this.runContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }
  /**
   * 一次性提交所有待變更的 Context
   *
   * 邏輯：
   * - 只有被設定過的 Context 才會被更新
   * - 沒有任何變更時調用此方法是安全的（無操作）
   * - 確保所有變更要麼全部成功，要麼全部失敗（原子性）
   */
  commit(): void {
    if (!this.hasChanges) {
      return // 沒有變更，無需操作
    }
    // 按固定順序提交（確保一致性）
    if (this.runContextUpdate !== null) {
      this.contextMutator.setRunContext(this.runContextUpdate)
    }
    if (this.characterContextUpdate !== null) {
      this.contextMutator.setCharacterContext(this.characterContextUpdate)
    }
    if (this.stashContextUpdate !== null) {
      this.contextMutator.setStashContext(this.stashContextUpdate)
    }
    // 重置狀態
    this.reset()
  }
  /**
   * 放棄所有待變更的內容
   */
  rollback(): void {
    this.reset()
  }
  /**
   * 重置內部狀態
   */
  private reset(): void {
    this.characterContextUpdate = null
    this.stashContextUpdate = null
    this.runContextUpdate = null
    this.hasChanges = false
  }
  /**
   * 檢查是否有待變更的內容
   */
  hasCharacterChanges(): boolean {
    return this.characterContextUpdate !== null
  }
  hasStashChanges(): boolean {
    return this.stashContextUpdate !== null
  }
  hasRunChanges(): boolean {
    return this.runContextUpdate !== null
  }
}
