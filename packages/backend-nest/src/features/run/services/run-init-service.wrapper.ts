import { Injectable } from '@nestjs/common'
import { ContextUnitOfWorkAdapter } from '../../../infra/services/ContextUnitOfWorkAdapter'
import { ConfigService } from './config.service'
import {
  RunInitializationService,
  IAppContext,
  IRunContext,
  ICharacterContext,
  IStashContext,
  IShopContext,
} from '../../../from-game-core'
@Injectable()
export class RunInitServiceWrapper {
  constructor(
    private readonly configService: ConfigService,
    private readonly unitOfWorkAdapter: ContextUnitOfWorkAdapter
  ) {}
  async initialize(professionId: string, seed?: number, startingRelicIds?: string[]) {
    const configStore = await this.configService.getConfigStore()
    const initialContext: IAppContext = {
      configStore,
      contexts: {
        runContext: {} as IRunContext,
        characterContext: {} as ICharacterContext,
        stashContext: {} as IStashContext,
        shopContext: {} as IShopContext,
      },
    }
    const unitOfWork = this.unitOfWorkAdapter.createUnitOfWork(initialContext)
    const runInitService = new RunInitializationService(configStore, unitOfWork)
    return runInitService.initialize({
      professionId,
      seed,
      startingRelicIds,
      persist: true,
    })
  }
}
