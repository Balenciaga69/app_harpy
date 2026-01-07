import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { IAppContext } from '../../from-game-core'
@Injectable()
export class ContextManager {
  private static readonly store = new AsyncLocalStorage<IAppContext>()
  private persistentStore = new Map<string, IAppContext>()
  setContext(appContext: IAppContext): void {
    if (ContextManager.store.getStore()) {
      throw new Error('Context already set for this async scope — use runWithContext to create an isolated scope')
    }
    ContextManager.store.enterWith(appContext)
  }
  getContext(): IAppContext | null {
    //TODO: 這東西為何是從 store 取資料?
    const context = ContextManager.store.getStore()
    if (!context) {
      console.warn('No AppContext found in ContextManager')
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
  saveContext(appContext: IAppContext): void {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }
    this.persistentStore.set(runId, this.deepCopy(appContext))
  }
  getContextByRunId(runId: string): IAppContext | null {
    if (!runId) {
      return null
    }
    const ctx = this.persistentStore.get(runId)
    return ctx ? this.deepCopy(ctx) : null
  }
  contextExists(runId: string): boolean {
    return this.persistentStore.has(runId)
  }
  deleteContext(runId: string): void {
    this.persistentStore.delete(runId)
  }
  private deepCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }
}
