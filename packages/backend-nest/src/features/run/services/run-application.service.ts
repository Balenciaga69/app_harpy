import { Injectable } from '@nestjs/common'
import {
  IAppContext,
  ICharacterContext,
  IRunContext,
  IShopContext,
  IStashContext,
  RunInitializationService,
} from '../../../from-game-core'
import { AppContextRepository } from '../../../infra/repositories/AppContextRepository'
import { AppContextUnitOfWorkFactory } from '../../../infra/services/AppContextUnitOfWorkFactory'
import { ConfigService } from './config.service'
@Injectable()
export class RunApplicationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly unitOfWorkFactory: AppContextUnitOfWorkFactory,
    private readonly contextRepository: AppContextRepository
  ) {}
  async initializeRun(professionId: string, seed?: number, startingRelicIds?: string[]): Promise<IAppContext> {
    const configStore = await this.configService.getConfigStore()
    const initialContext = this.buildInitialAppContext(configStore)
    const unitOfWork = this.unitOfWorkFactory.createUnitOfWork(initialContext)
    const runInitService = new RunInitializationService(configStore, unitOfWork)
    const result = await runInitService.initialize({
      professionId,
      seed,
      startingRelicIds,
      persist: false,
    })
    if (result.isFailure) {
      throw new Error(`Run initialization failed: ${result.error}`)
    }
    this.contextRepository.save(result.value!)
    return result.value!
  }
  private buildInitialAppContext(configStore: any): IAppContext {
    return {
      configStore,
      contexts: {
        runContext: this.buildInitialRunContext(),
        characterContext: this.buildInitialCharacterContext(),
        stashContext: this.buildInitialStashContext(),
        shopContext: this.buildInitialShopContext(),
      },
    }
  }
  private buildInitialRunContext(): IRunContext {
    return {
      runId: '',
      version: 0,
      encounteredEnemyIds: [],
      chapters: {},
      rollModifiers: [],
      remainingFailRetries: 0,
      currentChapter: 0,
      currentStage: 0,
      seed: 0,
      status: 'UNINITIALIZED',
      money: 0,
      temporaryContext: {
        postCombat: undefined,
      },
    } as unknown as IRunContext
  }
  private buildInitialCharacterContext(): ICharacterContext {
    return {
      id: '',
      runId: '',
      version: 0,
    } as unknown as ICharacterContext
  }
  private buildInitialStashContext(): IStashContext {
    return {
      runId: '',
      version: 0,
      items: [],
      capacity: 0,
    } as unknown as IStashContext
  }
  private buildInitialShopContext(): IShopContext {
    return {
      runId: '',
      version: 0,
      shopConfigId: '',
      items: [],
      refreshCount: 0,
    } as unknown as IShopContext
  }
}
