import { Injectable } from '@nestjs/common'
import { IContextUnitOfWork, ContextUnitOfWork, AppContextService, IAppContext } from '../../from-game-core'
@Injectable()
export class AppContextUnitOfWorkFactory {
  createUnitOfWork(appContext: IAppContext): IContextUnitOfWork {
    const contextService = new AppContextService(appContext)
    return new ContextUnitOfWork(contextService, contextService)
  }
}
