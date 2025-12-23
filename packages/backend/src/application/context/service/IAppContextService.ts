import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IStashContext } from '../interface/IStashContext'
export interface IAppContextService {
  GetContexts(): IAppContext['contexts']
  GetConfig(): IAppContext['configStore']
  setRunContext(ctx: IRunContext): void
  getRunContext(): IRunContext
  setCharacterContext(ctx: ICharacterContext): void
  getCharacterContext(): ICharacterContext
  setStashContext(ctx: IStashContext): void
  getStashContext(): IStashContext
}
