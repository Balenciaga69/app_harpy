import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IStashContext } from '../interface/IStashContext'

export interface IAppContextService {
  getAppContext(): IAppContext
  setRunContext(ctx: IRunContext): void
  setCharacterContext(ctx: ICharacterContext): void
  setStashContext(ctx: IStashContext): void
}
