import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IStashContext } from '../interface/IStashContext'
import { IAppContextService } from './IAppContextService'

export class AppContextService implements IAppContextService {
  private appContext: IAppContext | null = null

  constructor(appContext: IAppContext) {
    this.appContext = appContext
  }

  getAppContext(): IAppContext {
    return this.appContext!
  }

  setRunContext(ctx: IRunContext): IAppContext {
    this.appContext = {
      ...this.appContext!,
      runContext: ctx,
    }
    return this.appContext!
  }
  setCharacterContext(ctx: ICharacterContext): IAppContext {
    this.appContext = {
      ...this.appContext!,
      characterContext: ctx,
    }
    return this.appContext!
  }
  setStashContext(ctx: IStashContext): IAppContext {
    this.appContext = {
      ...this.appContext!,
      stashContext: ctx,
    }
    return this.appContext!
  }
}
