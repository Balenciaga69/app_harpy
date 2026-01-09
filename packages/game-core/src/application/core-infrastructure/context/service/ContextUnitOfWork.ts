import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IShopContext } from '../interface/IShopContext'
import { IStashContext } from '../interface/IStashContext'
import { IContextMutator, IContextSnapshotAccessor } from './AppContextService'
export interface IContextUnitOfWork {
  updateCharacterContext(ctx: ICharacterContext): IContextUnitOfWork
  updateStashContext(ctx: IStashContext): IContextUnitOfWork
  updateRunContext(ctx: IRunContext): IContextUnitOfWork
  updateShopContext(ctx: IShopContext): IContextUnitOfWork

  patchCharacterContext(patch: Partial<ICharacterContext>): IContextUnitOfWork
  patchStashContext(patch: Partial<IStashContext>): IContextUnitOfWork
  patchRunContext(patch: Partial<IRunContext>): IContextUnitOfWork
  patchShopContext(patch: Partial<IShopContext>): IContextUnitOfWork

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
    return this
  }
  updateStashContext(ctx: IStashContext): this {
    this.stashContextUpdate = ctx
    this.hasChanges = true
    return this
  }
  updateRunContext(ctx: IRunContext): this {
    this.runContextUpdate = ctx
    this.hasChanges = true
    return this
  }
  updateShopContext(ctx: IShopContext): this {
    this.shopContextUpdate = ctx
    this.hasChanges = true
    return this
  }
  commit(): void {
    if (!this.hasChanges) {
      return
    }

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
