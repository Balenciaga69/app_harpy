import { IAppContext } from '../interface/IAppContext'

export interface IRequestContextProvider {
  getContext(): IAppContext
  setContext(context: IAppContext): void
}
