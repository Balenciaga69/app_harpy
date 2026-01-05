import { Injectable } from '@nestjs/common'
import { IContextUnitOfWork, ContextUnitOfWork, AppContextService, IAppContext } from '../../from-game-core'
import { InMemoryContextRepository } from '../repositories/InMemoryContextRepository'
@Injectable()
export class ContextUnitOfWorkAdapter {
  constructor(private readonly contextRepo: InMemoryContextRepository) {}
  createUnitOfWork(initialContext: IAppContext): IContextUnitOfWork {
    const appContextService = new AppContextService(initialContext)
    const unitOfWork = new ContextUnitOfWork(appContextService, appContextService)
    const originalCommit = unitOfWork.commit.bind(unitOfWork)
    unitOfWork.commit = () => {
      originalCommit()
      const contexts = appContextService.getAllContexts()
      const runId = contexts.runContext.runId
      if (runId) {
        Promise.all([
          this.contextRepo.updateRunContext(runId, contexts.runContext),
          this.contextRepo.updateCharacterContext(runId, contexts.characterContext),
          this.contextRepo.updateStashContext(runId, contexts.stashContext),
          this.contextRepo.updateShopContext(runId, contexts.shopContext),
        ]).catch((err) => {
          console.error('同步上下文到儲存庫失敗:', err)
        })
      }
    }
    return unitOfWork
  }
}
