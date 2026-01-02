import { ICharacterContext } from '../interface/ICharacterContext'
import { IContextMutator, IContextSnapshotAccessor } from './AppContextService'
import { IRunContext } from '../interface/IRunContext'
import { IShopContext } from '../interface/IShopContext'
import { IStashContext } from '../interface/IStashContext'
/**
 * 上下文單位工作介面
 *
 * 職責：定義 UnitOfWork 模式的抽象，確保多個 Context 的變更作為一個原子性事務進行提交
 */
export interface IContextUnitOfWork {
  // === Update ===
  updateCharacterContext(ctx: ICharacterContext): IContextUnitOfWork
  updateStashContext(ctx: IStashContext): IContextUnitOfWork
  updateRunContext(ctx: IRunContext): IContextUnitOfWork
  updateShopContext(ctx: IShopContext): IContextUnitOfWork
  // === Patch ===
  patchCharacterContext(patch: Partial<ICharacterContext>): IContextUnitOfWork
  patchStashContext(patch: Partial<IStashContext>): IContextUnitOfWork
  patchRunContext(patch: Partial<IRunContext>): IContextUnitOfWork
  patchShopContext(patch: Partial<IShopContext>): IContextUnitOfWork
  // === Other operations ===
  commit(): void
  rollback(): void
}

export class ContextUnitOfWork implements IContextUnitOfWork {
  private characterContextUpdate: ICharacterContext | null = null
  private stashContextUpdate: IStashContext | null = null
  private runContextUpdate: IRunContext | null = null
  private shopContextUpdate: IShopContext | null = null
  private hasChanges = false
  constructor(
    private contextMutator: IContextMutator,
    private contextAccessor: IContextSnapshotAccessor
  ) {}
  updateCharacterContext(ctx: ICharacterContext): this {
    this.characterContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }

  updateStashContext(ctx: IStashContext): this {
    this.stashContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }

  updateRunContext(ctx: IRunContext): this {
    this.runContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }
  updateShopContext(ctx: IShopContext): this {
    this.shopContextUpdate = ctx
    this.hasChanges = true
    return this // 支援鏈式調用
  }
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
    if (this.shopContextUpdate !== null) {
      this.contextMutator.setShopContext(this.shopContextUpdate)
    }
    this.reset()
  }
  rollback(): void {
    this.reset()
  }

  patchCharacterContext(patch: Partial<ICharacterContext>): this {
    const current = this.characterContextUpdate ?? this.contextAccessor.getCharacterContext()
    this.characterContextUpdate = { ...current, ...patch }
    this.hasChanges = true
    return this
  }

  patchStashContext(patch: Partial<IStashContext>): this {
    const current = this.stashContextUpdate ?? this.contextAccessor.getStashContext()
    this.stashContextUpdate = { ...current, ...patch }
    this.hasChanges = true
    return this
  }

  patchRunContext(patch: Partial<IRunContext>): this {
    const current = this.runContextUpdate ?? this.contextAccessor.getRunContext()
    this.runContextUpdate = { ...current, ...patch }
    this.hasChanges = true
    return this
  }

  patchShopContext(patch: Partial<IShopContext>): this {
    const current = this.shopContextUpdate ?? this.contextAccessor.getShopContext()
    this.shopContextUpdate = { ...current, ...patch }
    this.hasChanges = true
    return this
  }
  private reset(): void {
    this.characterContextUpdate = null
    this.stashContextUpdate = null
    this.runContextUpdate = null
    this.shopContextUpdate = null
    this.hasChanges = false
  }
}
