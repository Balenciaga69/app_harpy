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
  getAppContext(): IAppContext
  getCurrentAtCreatedInfo(): AtCreatedInfo
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord
  getRunStatus(): IRunContext['status']
}
export interface IContextMutator {
  setRunContext(context: IRunContext): void
  setCharacterContext(context: ICharacterContext): void
  setStashContext(context: IStashContext): void
  setShopContext(context: IShopContext): void
}
export class ConfigStoreAccessorImpl implements IConfigStoreAccessor {
  constructor(private context: IAppContext) {}
  getConfigStore(): IAppContext['configStore'] {
    return this.context.configStore
  }
}
export class ContextSnapshotAccessorImpl implements IContextSnapshotAccessor {
  constructor(private context: IAppContext) {}
  getRunContext(): IRunContext {
    return this.context.contexts.runContext
  }
  getCharacterContext(): ICharacterContext {
    return this.context.contexts.characterContext
  }
  getStashContext(): IStashContext {
    return this.context.contexts.stashContext
  }
  getShopContext(): IShopContext {
    return this.context.contexts.shopContext
  }
  getAllContexts(): IAppContext['contexts'] {
    return this.context.contexts
  }
  getAppContext(): IAppContext {
    return this.context
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
  constructor(
    private onContextChange: (next: IAppContext) => void | Promise<void>,
    private currentContext: IAppContext
  ) {}
  setRunContext(context: IRunContext): void {
    this.updateContext({ ...this.currentContext, contexts: { ...this.currentContext.contexts, runContext: context } })
  }
  setCharacterContext(context: ICharacterContext): void {
    this.updateContext({ ...this.currentContext, contexts: { ...this.currentContext.contexts, characterContext: context } })
  }
  setStashContext(context: IStashContext): void {
    this.updateContext({ ...this.currentContext, contexts: { ...this.currentContext.contexts, stashContext: context } })
  }
  setShopContext(context: IShopContext): void {
    this.updateContext({ ...this.currentContext, contexts: { ...this.currentContext.contexts, shopContext: context } })
  }
  private updateContext(next: IAppContext): void {
    this.currentContext = next
    void this.onContextChange(next)
  }
}
