import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  GameStartOptionsService,
  RunContextHandler,
  RunCoordinationService,
  RunInitializationService,
  RunService,
  StageInitializationService,
  StageNodeGenerationService,
} from 'src/from-game-core'
/**
 * 遊戲進度功能提供者
 * 負責遊戲進度初始化、階段生成和協調服務
 */
export const runFeatureProviders = [
  {
    provide: RunContextHandler,
    useFactory: (snapshot: any, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new RunContextHandler(snapshot, converter, uow)
    },
    inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
    scope: Scope.REQUEST,
  },
  {
    provide: RunService,
    useFactory: (handler: RunContextHandler) => {
      return new RunService(handler)
    },
    inject: [RunContextHandler],
    scope: Scope.REQUEST,
  },
  {
    provide: GameStartOptionsService,
    useFactory: (configStore: any) => {
      return new GameStartOptionsService(configStore.professionStore, configStore.itemStore)
    },
    inject: ['CONFIG_STORE'],
    scope: Scope.REQUEST,
  },
  {
    provide: StageNodeGenerationService,
    useFactory: () => {
      return new StageNodeGenerationService()
    },
    scope: Scope.REQUEST,
  },
  {
    provide: StageInitializationService,
    useFactory: (contextAccessor: any, unitOfWork: any, enemyRandomGenerateService: any) => {
      return new StageInitializationService(contextAccessor, unitOfWork, enemyRandomGenerateService)
    },
    inject: ['IContextSnapshotAccessor', 'IContextUnitOfWork', 'IEnemyRandomGenerateService'],
    scope: Scope.REQUEST,
  },
  {
    provide: RunCoordinationService,
    useFactory: (runHandler: RunContextHandler, stageInitService: StageInitializationService) => {
      return new RunCoordinationService(runHandler, stageInitService)
    },
    inject: [RunContextHandler, StageInitializationService],
    scope: Scope.REQUEST,
  },
  {
    provide: RunInitializationService,
    useFactory: (configStore: any, stageGenerator: StageNodeGenerationService, unitOfWork: ContextUnitOfWork) => {
      return new RunInitializationService(configStore, unitOfWork, stageGenerator)
    },
    inject: ['CONFIG_STORE', StageNodeGenerationService, ContextUnitOfWork],
    scope: Scope.REQUEST,
  },
]
