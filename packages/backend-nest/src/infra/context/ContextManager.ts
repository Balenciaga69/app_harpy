import { Injectable, Inject, Logger } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { IAppContext, IContextBatchRepository } from '../../from-game-core'
type IConfigStore = IAppContext['configStore']
@Injectable()
export class ContextManager {
  private static readonly store = new AsyncLocalStorage<IAppContext>()
  private globalConfigStore: IConfigStore
  private readonly logger = new Logger(ContextManager.name)
  constructor(
    configStore: IConfigStore,
    @Inject('IContextBatchRepository') private readonly repository: IContextBatchRepository
  ) {
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
  async saveContext(appContext: IAppContext): Promise<void> {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }
    const contexts = appContext.contexts
    try {
      await this.repository.updateBatch({
        run: { context: contexts.runContext, expectedVersion: 0 },
        character: { context: contexts.characterContext, expectedVersion: 0 },
        stash: { context: contexts.stashContext, expectedVersion: 0 },
        shop: { context: contexts.shopContext, expectedVersion: 0 },
      })
    } catch (error) {
      this.logger.error(`saveContext 失敗 (runId: ${runId}): ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }
  async getContextByRunId(runId: string): Promise<IAppContext | null> {
    if (!runId) {
      return null
    }
    try {
      const result = await this.repository.getByRunId(runId)
      if (!result?.success || !result.runContext) {
        return null
      }
      return {
        configStore: this.globalConfigStore,
        contexts: {
          runContext: result.runContext,
          characterContext: result.characterContext ?? ({} as IAppContext['contexts']['characterContext']),
          stashContext: result.stashContext ?? ({} as IAppContext['contexts']['stashContext']),
          shopContext: result.shopContext ?? ({} as IAppContext['contexts']['shopContext']),
        },
      }
    } catch (error) {
      this.logger.error(
        `getContextByRunId 失敗 (runId: ${runId}): ${error instanceof Error ? error.message : String(error)}`
      )
      return null
    }
  }
  getConfigStore(): IConfigStore {
    return this.globalConfigStore
  }
}
