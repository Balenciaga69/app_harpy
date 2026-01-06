import { EnemyEntityService } from '@app-harpy/game-core/dist/application/content-generation/service/enemy/EnemyEntityService'
import { EnemyRandomGenerateService } from '@app-harpy/game-core/dist/application/content-generation/service/enemy/EnemyRandomGenerateService'
import { RewardFactory } from '@app-harpy/game-core/dist/application/features/post-combat/reward/RewardFactory'
import { StageInitializationService } from '@app-harpy/game-core/dist/application/features/run/stage-progression/service/StageInitializationService'
import { Module, Scope } from '@nestjs/common'
import {
  AffixEntityService,
  AppContextService,
  CharacterAggregateService,
  ContextToDomainConverter,
  ContextUnitOfWork,
  EquipmentContextHandler,
  EquipmentService,
  GameStartOptionsService,
  ItemConstraintService,
  ItemEntityService,
  ItemGenerationService,
  ItemModifierAggregationService,
  ItemRollService,
  PostCombatContextAccessor,
  PostCombatContextHandler,
  PostCombatCoordinationService,
  PostCombatDomainConverter,
  PostCombatTransactionManager,
  PostCombatValidator,
  ProfessionEntityService,
  RunContextHandler,
  RunCoordinationService,
  RunInitializationService,
  RunService,
  ShopContextHandler,
  ShopService,
  StageNodeGenerationService,
  UltimateEntityService,
} from 'src/from-game-core'
import { AppContextRepository } from '../../infra/repositories/AppContextRepository'
import { InMemoryContextRepository } from '../../infra/repositories/InMemoryContextRepository'
import { RunController } from './controllers/run.controller'
import { RunNestService } from './services/run.service'

@Module({
  controllers: [RunController],
  providers: [
    // ============================================
    // Backend-Nest Infrastructure
    // ============================================
    AppContextRepository,
    {
      provide: InMemoryContextRepository,
      useClass: InMemoryContextRepository,
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Core Infrastructure
    // ============================================
    {
      provide: AppContextService,
      useFactory: (repo: AppContextRepository) => {
        const appContext = repo.getByRunId('123')
        if (!appContext) {
          throw new Error('AppContext not found in AppContextRepository')
        }
        return new AppContextService(appContext)
      },
      inject: [AppContextRepository],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ContextUnitOfWork,
      useFactory: (svc: AppContextService) => {
        return new ContextUnitOfWork(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Content Generation - Basic
    // ============================================
    {
      provide: AffixEntityService,
      useFactory: (svc: AppContextService) => {
        return new AffixEntityService(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: UltimateEntityService,
      useFactory: (affixSvc: AffixEntityService, svc: AppContextService) => {
        return new UltimateEntityService(affixSvc, svc, svc)
      },
      inject: [AffixEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemEntityService,
      useFactory: (affixSvc: AffixEntityService, svc: AppContextService) => {
        return new ItemEntityService(svc, svc, affixSvc)
      },
      inject: [AffixEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Content Generation - Advanced
    // ============================================
    {
      provide: ProfessionEntityService,
      useFactory: (svc: AppContextService) => {
        return new ProfessionEntityService(svc)
      },
      inject: [UltimateEntityService, ItemEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: CharacterAggregateService,
      useFactory: (
        professionSvc: ProfessionEntityService,
        itemSvc: ItemEntityService,
        ultimateSvc: UltimateEntityService
      ) => {
        return new CharacterAggregateService(professionSvc, itemSvc, ultimateSvc)
      },
      inject: [ProfessionEntityService, ItemEntityService, UltimateEntityService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EnemyEntityService,
      useFactory: (affixSvc: AffixEntityService, ultimateSvc: UltimateEntityService, svc: AppContextService) => {
        return new EnemyEntityService(affixSvc, ultimateSvc, svc, svc)
      },
      inject: [AffixEntityService, UltimateEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EnemyRandomGenerateService,
      useFactory: (enemySvc: EnemyEntityService, svc: AppContextService) => {
        return new EnemyRandomGenerateService(enemySvc, svc)
      },
      inject: [EnemyEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Item Generation Chain
    // ============================================
    {
      provide: ItemConstraintService,
      useFactory: (svc: AppContextService) => {
        return new ItemConstraintService(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemModifierAggregationService,
      useFactory: (svc: AppContextService) => {
        return new ItemModifierAggregationService(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemRollService,
      useFactory: (constraintSvc: ItemConstraintService, svc: AppContextService) => {
        return new ItemRollService(svc, svc, constraintSvc)
      },
      inject: [ItemConstraintService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemGenerationService,
      useFactory: (
        itemSvc: ItemEntityService,
        constraintSvc: ItemConstraintService,
        modifierSvc: ItemModifierAggregationService,
        rollSvc: ItemRollService
      ) => {
        return new ItemGenerationService(itemSvc, constraintSvc, modifierSvc, rollSvc)
      },
      inject: [ItemEntityService, ItemConstraintService, ItemModifierAggregationService, ItemRollService],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Context Converter
    // ============================================
    {
      provide: ContextToDomainConverter,
      useFactory: (itemSvc: ItemEntityService, charSvc: CharacterAggregateService, svc: AppContextService) => {
        return new ContextToDomainConverter(itemSvc, charSvc, svc, svc)
      },
      inject: [ItemEntityService, CharacterAggregateService, AppContextService],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Feature - Shop
    // ============================================
    {
      provide: ShopContextHandler,
      useFactory: (svc: AppContextService, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
        return new ShopContextHandler(svc, converter, uow)
      },
      inject: [AppContextService, ContextToDomainConverter, ContextUnitOfWork],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ShopService,
      useFactory: (itemGenSvc: ItemGenerationService, shopHandler: ShopContextHandler) => {
        return new ShopService(itemGenSvc, shopHandler)
      },
      inject: [ItemGenerationService, ShopContextHandler],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Feature - Equipment
    // ============================================
    {
      provide: EquipmentContextHandler,
      useFactory: (svc: AppContextService, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
        return new EquipmentContextHandler(svc, converter, uow)
      },
      inject: [AppContextService, ContextToDomainConverter, ContextUnitOfWork],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EquipmentService,
      useFactory: (handler: EquipmentContextHandler) => {
        return new EquipmentService(handler)
      },
      inject: [EquipmentContextHandler],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Feature - Run
    // ============================================
    {
      provide: RunContextHandler,
      useFactory: (svc: AppContextService, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
        return new RunContextHandler(svc, converter, uow)
      },
      inject: [AppContextService, ContextToDomainConverter, ContextUnitOfWork],
      scope: Scope.TRANSIENT,
    },
    {
      provide: RunService,
      useFactory: (handler: RunContextHandler) => {
        return new RunService(handler)
      },
      inject: [RunContextHandler],
      scope: Scope.TRANSIENT,
    },
    {
      provide: GameStartOptionsService,
      useFactory: (svc: AppContextService) => {
        const { professionStore, itemStore } = svc.getConfigStore()
        return new GameStartOptionsService(professionStore, itemStore)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: StageNodeGenerationService,
      useFactory: () => {
        return new StageNodeGenerationService()
      },
      scope: Scope.TRANSIENT,
    },
    {
      provide: StageInitializationService,
      useFactory: (enemyGenSvc: EnemyRandomGenerateService, uow: ContextUnitOfWork, appSvc: AppContextService) => {
        return new StageInitializationService(appSvc, uow, enemyGenSvc)
      },
      inject: [EnemyRandomGenerateService, ContextUnitOfWork, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: RunCoordinationService,
      useFactory: (runHandler: RunContextHandler, stageSvc: StageInitializationService) => {
        return new RunCoordinationService(runHandler, stageSvc)
      },
      inject: [RunContextHandler, StageInitializationService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: RunInitializationService,
      useFactory: (
        svc: AppContextService,
        stageGenerator: StageNodeGenerationService,
        unitOfWork: ContextUnitOfWork
      ) => {
        return new RunInitializationService(svc.getConfigStore(), unitOfWork, stageGenerator)
      },
      inject: [AppContextService, StageNodeGenerationService, ContextUnitOfWork],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Game-Core: Feature - PostCombat
    // ============================================
    {
      provide: PostCombatContextAccessor,
      useFactory: (svc: AppContextService) => {
        return new PostCombatContextAccessor(svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatDomainConverter,
      useFactory: (svc: AppContextService, itemSvc: ItemEntityService, charSvc: CharacterAggregateService) => {
        return new PostCombatDomainConverter(svc, itemSvc, charSvc)
      },
      inject: [AppContextService, ItemEntityService, CharacterAggregateService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatValidator,
      useFactory: (accessor: PostCombatContextAccessor) => {
        return new PostCombatValidator(accessor)
      },
      inject: [PostCombatContextAccessor],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatTransactionManager,
      useFactory: (uow: ContextUnitOfWork, svc: AppContextService) => {
        return new PostCombatTransactionManager(svc, uow)
      },
      inject: [ContextUnitOfWork, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: RewardFactory,
      useFactory: (itemGenSvc: ItemGenerationService, svc: AppContextService) => {
        return new RewardFactory(itemGenSvc, svc)
      },
      inject: [ItemGenerationService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatContextHandler,
      useFactory: (
        accessor: PostCombatContextAccessor,
        converter: PostCombatDomainConverter,
        validator: PostCombatValidator,
        txManager: PostCombatTransactionManager,
        itemEntityService: ItemEntityService,
        runSvc: RunService
      ) => {
        return new PostCombatContextHandler(accessor, validator, converter, txManager, itemEntityService, runSvc)
      },
      inject: [
        PostCombatContextAccessor,
        PostCombatDomainConverter,
        PostCombatValidator,
        PostCombatTransactionManager,
        RewardFactory,
        ItemEntityService,
        RunService,
      ],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatCoordinationService,
      useFactory: (postCombatHandler: PostCombatContextHandler, runSvc: RunService) => {
        return new PostCombatCoordinationService(postCombatHandler, runSvc)
      },
      inject: [PostCombatContextHandler, RunService],
      scope: Scope.TRANSIENT,
    },
    RunNestService,
  ],
})
export class RunModule {}
