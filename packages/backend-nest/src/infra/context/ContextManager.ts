import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { IAppContext } from '../../from-game-core'
type IConfigStore = IAppContext['configStore']
interface IRunExecutionContext {
  readonly runContext: IAppContext['contexts']['runContext']
  readonly characterContext: IAppContext['contexts']['characterContext']
  readonly stashContext: IAppContext['contexts']['stashContext']
  readonly shopContext: IAppContext['contexts']['shopContext']
}
@Injectable()
export class ContextManager {
  private static readonly store = new AsyncLocalStorage<IAppContext>()
  private globalConfigStore: IConfigStore
  private runContexts = new Map<string, IRunExecutionContext>()
  constructor(configStore: IConfigStore) {
    this.globalConfigStore = configStore
  }
  setContext(appContext: IAppContext): void {
    if (ContextManager.store.getStore()) {
      throw new Error('Context already set for this async scope — use runWithContext to create an isolated scope')
    }
    ContextManager.store.enterWith(appContext)
  }
  getContext(): IAppContext | null {
    const context = ContextManager.store.getStore()
    if (!context) {
      return null
    }
    return context
  }
  hasContext(): boolean {
    return ContextManager.store.getStore() !== undefined
  }
  runWithContext<T>(appContext: IAppContext, fn: () => T): T {
    return ContextManager.store.run(appContext, fn)
  }
  saveContext(appContext: IAppContext) {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }
    const contexts = appContext.contexts
    const runContext = {
      runContext: this.shallowCopy(contexts.runContext),
      characterContext: this.shallowCopy(contexts.characterContext),
      stashContext: this.shallowCopy(contexts.stashContext),
      shopContext: this.shallowCopy(contexts.shopContext),
    }
    this.runContexts.set(runId, runContext)
  }
  getContextByRunId(runId: string): IAppContext | null {
    if (!runId) {
      return null
    }
    const runContext = this.runContexts.get(runId)
    if (!runContext) {
      return null
    }
    return {
      configStore: this.globalConfigStore,
      contexts: {
        runContext: this.shallowCopy(runContext.runContext),
        characterContext: this.shallowCopy(runContext.characterContext),
        stashContext: this.shallowCopy(runContext.stashContext),
        shopContext: this.shallowCopy(runContext.shopContext),
      },
    }
  }
  contextExists(runId: string): boolean {
    return this.runContexts.has(runId)
  }
  deleteContext(runId: string): void {
    this.runContexts.delete(runId)
  }
  getConfigStore(): IConfigStore {
    return this.globalConfigStore
  }
  private shallowCopy(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    return { ...obj }
  }
}
