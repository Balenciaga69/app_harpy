import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IStashContext } from '../interface/IStashContext'
import { IAppContextService } from './IAppContextService'
export class AppContextService implements IAppContextService {
  private appContext: IAppContext
  constructor(appContext: IAppContext) {
    this.appContext = appContext
  }
  GetContexts(): IAppContext['contexts'] {
    return this.appContext.contexts
  }
  GetConfig(): IAppContext['configStore'] {
    return this.appContext.configStore
  }
  setRunContext(ctx: IRunContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        runContext: ctx,
      },
    }
  }
  getRunContext(): IRunContext {
    return this.appContext.contexts.runContext
  }
  setCharacterContext(ctx: ICharacterContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        characterContext: ctx,
      },
    }
  }
  getCharacterContext(): ICharacterContext {
    return this.appContext.contexts.characterContext
  }
  setStashContext(ctx: IStashContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        stashContext: ctx,
      },
    }
  }
  getStashContext(): IStashContext {
    return this.appContext.contexts.stashContext
  }
}
