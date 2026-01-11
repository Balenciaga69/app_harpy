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
import { InjectionTokens } from '../../../infra/providers/injection-tokens'
export const runFeatureProviders = [
  {
    provide: RunContextHandler,
    useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new RunContextHandler(snapshot, converter, uow)
    },
    inject: [InjectionTokens.ContextSnapshotAccessor, ContextToDomainConverter, ContextUnitOfWork],
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
    inject: [InjectionTokens.ConfigStore],
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
    inject: [
      AffixEntityService,
      UltimateEntityService,
      InjectionTokens.ConfigStoreAccessor,
      InjectionTokens.ContextSnapshotAccessor,
    ],
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
    inject: [EnemyEntityService, InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
  },
  {
    provide: StageInitializationService,
    useFactory: (
      contextAccessor: IContextSnapshotAccessor,
      unitOfWork: ContextUnitOfWork,
      enemyRandomGenerateService: EnemyRandomGenerateService
    ) => {
      return new StageInitializationService(contextAccessor, unitOfWork, enemyRandomGenerateService)
    },
    inject: [InjectionTokens.ContextSnapshotAccessor, ContextUnitOfWork, EnemyRandomGenerateService],
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
    inject: [InjectionTokens.ConfigStore],
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
