import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { AtCreatedInfo, WithCreatedInfo, WithSourceUnit } from '../../../../shared/models/BaseInstanceFields'
import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IShopContext } from '../interface/IShopContext'
import { IStashContext } from '../interface/IStashContext'
interface CommonInfoForCreateRecord extends WithCreatedInfo, WithSourceUnit {
  readonly difficulty: number
}
export interface IConfigStoreAccessor {
  getConfigStore(): IAppContext['configStore']
}
export interface IContextSnapshotAccessor {
  getRunContext(): IRunContext
  getCharacterContext(): ICharacterContext
  getStashContext(): IStashContext
  getShopContext(): IShopContext
  getAllContexts(): IAppContext['contexts']
  getCurrentAtCreatedInfo(): AtCreatedInfo
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord
  getRunStatus(): IRunContext['status']
}
export interface IContextMutator {
  setRunContext(ctx: IRunContext): void
  setCharacterContext(ctx: ICharacterContext): void
  setStashContext(ctx: IStashContext): void
  setShopContext(ctx: IShopContext): void
}
export class AppContextHolder {
  private ctx: IAppContext
  constructor(initial: IAppContext) {
    this.ctx = initial
  }
  get(): IAppContext {
    return this.ctx
  }
  set(next: IAppContext): void {
    this.ctx = next
  }
}
export class ConfigStoreAccessorImpl implements IConfigStoreAccessor {
  constructor(private holder: AppContextHolder) {}
  getConfigStore(): IAppContext['configStore'] {
    return this.holder.get().configStore
  }
}
export class ContextSnapshotAccessorImpl implements IContextSnapshotAccessor {
  constructor(private holder: AppContextHolder) {}
  getRunContext(): IRunContext {
    return this.holder.get().contexts.runContext
  }
  getCharacterContext(): ICharacterContext {
    return this.holder.get().contexts.characterContext
  }
  getStashContext(): IStashContext {
    return this.holder.get().contexts.stashContext
  }
  getShopContext(): IShopContext {
    return this.holder.get().contexts.shopContext
  }
  getAllContexts(): IAppContext['contexts'] {
    return this.holder.get().contexts
  }
  getCurrentAtCreatedInfo(): AtCreatedInfo {
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    return { chapter: currentChapter, stage: currentStage, difficulty }
  }
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord {
    const characterContext = this.getCharacterContext()
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    return { difficulty, sourceUnitId: characterContext.id, atCreated }
  }
  getRunStatus(): IRunContext['status'] {
    return this.getRunContext().status
  }
  getTemporaryContext() {
    return this.getRunContext().temporaryContext
  }
}
export class ContextMutatorImpl implements IContextMutator {
  constructor(private holder: AppContextHolder) {}
  setRunContext(ctx: IRunContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, runContext: ctx } })
  }
  setCharacterContext(ctx: ICharacterContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, characterContext: ctx } })
  }
  setStashContext(ctx: IStashContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, stashContext: ctx } })
  }
  setShopContext(ctx: IShopContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, shopContext: ctx } })
  }
}
