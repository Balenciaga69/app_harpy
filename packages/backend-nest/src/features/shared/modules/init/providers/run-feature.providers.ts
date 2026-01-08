import { Scope } from '@nestjs/common'
import {
  AffixEntityService,
  AppContextRunAdapter,
  ContextToDomainConverter,
  ContextUnitOfWork,
  EnemyEntityService,
  EnemyRandomGenerateService,
  GameStartOptionsService,
  IAppContext,
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
  RunContextHandler,
  RunCoordinationService,
  RunInitializationService,
  RunService,
  StageInitializationService,
  StageNodeGenerationService,
  UltimateEntityService,
} from 'src/from-game-core'
/**
 * 遊戲進度功能提供者
 * 職責：遊戲進度初始化、階段生成和協調服務
 *
 * 層級：features/run/init（功能模組特定邏輯）
 * 原因：這些是 Init 模組專有的業務流程
 */
export const runFeatureProviders = [
  {
    provide: RunContextHandler,
    useFactory: (snapshot, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
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
    useFactory: (configStore: IAppContext['configStore']) => {
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
    provide: EnemyEntityService,
    useFactory: (
      affixEntityService: AffixEntityService,
      ultimateEntityService: UltimateEntityService,
      configStoreAccessor: IConfigStoreAccessor,
      contextSnapshot: IContextSnapshotAccessor
    ) => {
      return new EnemyEntityService(affixEntityService, ultimateEntityService, configStoreAccessor, contextSnapshot)
    },
    inject: [AffixEntityService, UltimateEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: EnemyRandomGenerateService,
    useFactory: (
      enemyEntityService: EnemyEntityService,
      configStoreAccessor: IConfigStoreAccessor,
      contextSnapshotAccessor: IContextSnapshotAccessor
    ) => {
      return new EnemyRandomGenerateService(enemyEntityService, configStoreAccessor, contextSnapshotAccessor)
    },
    inject: [EnemyEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: StageInitializationService,
    useFactory: (contextAccessor, unitOfWork, enemyRandomGenerateService) => {
      return new StageInitializationService(contextAccessor, unitOfWork, enemyRandomGenerateService)
    },
    inject: ['IContextSnapshotAccessor', ContextUnitOfWork, EnemyRandomGenerateService],
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
    provide: AppContextRunAdapter,
    useFactory: (configStore: IAppContext['configStore']) => {
      return new AppContextRunAdapter(configStore)
    },
    inject: ['CONFIG_STORE'],
    scope: Scope.REQUEST,
  },
  {
    provide: RunInitializationService,
    useFactory: (
      appContextRunAdapter: AppContextRunAdapter,
      stageGenerator: StageNodeGenerationService,
      unitOfWork: ContextUnitOfWork
    ) => {
      return new RunInitializationService(appContextRunAdapter, unitOfWork, stageGenerator)
    },
    inject: [AppContextRunAdapter, StageNodeGenerationService, ContextUnitOfWork],
    scope: Scope.REQUEST,
  },
]
