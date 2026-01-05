import { Injectable } from '@nestjs/common'
import { IAppContext } from '../../from-game-core'
@Injectable()
export class AppContextRepository {
  private store = new Map<string, IAppContext>()
  save(appContext: IAppContext): void {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }
    this.store.set(runId, this.deepCopy(appContext))
  }
  getByRunId(runId: string): IAppContext | null {
    if (!runId) {
      return null
    }
    const ctx = this.store.get(runId)
    return ctx ? this.deepCopy(ctx) : null
  }
  exists(runId: string): boolean {
    return this.store.has(runId)
  }
  delete(runId: string): void {
    this.store.delete(runId)
  }
  private deepCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }
}
