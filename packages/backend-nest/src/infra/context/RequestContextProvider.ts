import { Injectable, Scope } from '@nestjs/common'
import { IAppContext } from 'src/from-game-core'
import { IRequestContextProvider } from 'src/from-game-core'
@Injectable({ scope: Scope.REQUEST })
export class RequestContextProvider implements IRequestContextProvider {
  private context: IAppContext | null = null
  getContext(): IAppContext {
    if (!this.context) {
      throw new Error('Context not initialized in this request')
    }
    return this.context
  }
  setContext(context: IAppContext): void {
    this.context = context
  }
}
