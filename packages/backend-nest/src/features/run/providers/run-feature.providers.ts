import { Scope } from '@nestjs/common'
import {
  RunContextHandler,
  RunService,
  RunCoordinationService,
  RunInitializationService,
  StageNodeGenerationService,
  GameStartOptionsService,
  ContextToDomainConverter,
  ContextUnitOfWork,
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
    provide: RunCoordinationService,
    useFactory: (runHandler: RunContextHandler) => {
      return new RunCoordinationService(runHandler, null as any)
    },
    inject: [RunContextHandler],
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
