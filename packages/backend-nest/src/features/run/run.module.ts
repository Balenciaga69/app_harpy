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
  GameConfigAssembler,
  GameStartOptionsService,
  InternalAffixConfigLoader,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalShopConfigLoader,
  InternalUltimateConfigLoader,
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
import { RunNestService } from './services/run-nest.service'
import { ContextStorage } from '../../infra/context/ContextStorage'
import { APP_INTERCEPTOR } from '@nestjs/core/constants'
import { ContextInitializationInterceptor } from 'src/infra/interceptors/ContextInitializationInterceptor'

@Module({
  controllers: [RunController],
  providers: [
    // ============================================
    // Backend-Nest Infrastructure
    // ============================================
    AppContextRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInitializationInterceptor,
    },
    {
      provide: InMemoryContextRepository,
      useClass: InMemoryContextRepository,
      scope: Scope.TRANSIENT,
    },
    {
      provide: 'CONFIG_STORE',
      useFactory: async () => {
        const assembler = new GameConfigAssembler(
          new InternalEnemyConfigLoader(),
          new InternalItemConfigLoader(),
          new InternalProfessionConfigLoader(),
          new InternalUltimateConfigLoader(),
          new InternalAffixConfigLoader(),
          new InternalShopConfigLoader()
        )
        await assembler.assembleAllConfigs()
        return {
          enemyStore: assembler.getEnemyStore(),
          itemStore: assembler.getItemStore(),
          professionStore: assembler.getProfessionStore(),
          ultimateStore: assembler.getUltimateStore(),
          affixStore: assembler.getAffixStore(),
          shopStore: assembler.getShopStore(),
        }
      },
    },

    // ============================================
    // Game-Core: Core Infrastructure
    // ============================================
    {
      provide: AppContextService,
      useFactory: () => {
        if (!ContextStorage.hasContext()) return null
        const appContext = ContextStorage.getContext()
        return new AppContextService(appContext)
      },
      scope: Scope.TRANSIENT,
    },
    {
      provide: ContextUnitOfWork,
      useFactory: (svc: AppContextService) => {
        if (!svc) return null
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
        if (!svc) return null
        return new AffixEntityService(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: UltimateEntityService,
      useFactory: (affixSvc: AffixEntityService, svc: AppContextService) => {
        if (!svc || !affixSvc) return null
        return new UltimateEntityService(affixSvc, svc, svc)
      },
      inject: [AffixEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemEntityService,
      useFactory: (affixSvc: AffixEntityService, svc: AppContextService) => {
        if (!svc || !affixSvc) return null
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
        if (!svc) return null
        return new ProfessionEntityService(svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: CharacterAggregateService,
      useFactory: (
        professionSvc: ProfessionEntityService,
        itemSvc: ItemEntityService,
        ultimateSvc: UltimateEntityService
      ) => {
        if (!professionSvc || !itemSvc || !ultimateSvc) return null
        return new CharacterAggregateService(professionSvc, itemSvc, ultimateSvc)
      },
      inject: [ProfessionEntityService, ItemEntityService, UltimateEntityService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EnemyEntityService,
      useFactory: (affixSvc: AffixEntityService, ultimateSvc: UltimateEntityService, svc: AppContextService) => {
        if (!affixSvc || !ultimateSvc || !svc) return null
        return new EnemyEntityService(affixSvc, ultimateSvc, svc, svc)
      },
      inject: [AffixEntityService, UltimateEntityService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EnemyRandomGenerateService,
      useFactory: (enemySvc: EnemyEntityService, svc: AppContextService) => {
        if (!enemySvc || !svc) return null
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
        if (!svc) return null
        return new ItemConstraintService(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemModifierAggregationService,
      useFactory: (svc: AppContextService) => {
        if (!svc) return null
        return new ItemModifierAggregationService(svc, svc)
      },
      inject: [AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemRollService,
      useFactory: (constraintSvc: ItemConstraintService, svc: AppContextService) => {
        if (!constraintSvc || !svc) return null
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
        if (!itemSvc || !constraintSvc || !modifierSvc || !rollSvc) return null
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
        if (!itemSvc || !charSvc || !svc) return null
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
        if (!svc || !converter || !uow) return null
        return new ShopContextHandler(svc, converter, uow)
      },
      inject: [AppContextService, ContextToDomainConverter, ContextUnitOfWork],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ShopService,
      useFactory: (itemGenSvc: ItemGenerationService, shopHandler: ShopContextHandler) => {
        if (!itemGenSvc || !shopHandler) return null
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
      useFactory: (configStore: any) => {
        return new GameStartOptionsService(configStore.professionStore, configStore.itemStore)
      },
      inject: ['CONFIG_STORE'],
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
      useFactory: (configStore: any, stageGenerator: StageNodeGenerationService, unitOfWork: ContextUnitOfWork) => {
        return new RunInitializationService(configStore, unitOfWork, stageGenerator)
      },
      inject: ['CONFIG_STORE', StageNodeGenerationService, ContextUnitOfWork],
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
      inject: [ItemGenerationService, AppContextService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatContextHandler,
      useFactory: (
        accessor: PostCombatContextAccessor,
        validator: PostCombatValidator,
        converter: PostCombatDomainConverter,
        txManager: PostCombatTransactionManager,
        itemEntityService: ItemEntityService,
        runSvc: RunService
      ) => {
        return new PostCombatContextHandler(accessor, validator, converter, txManager, itemEntityService, runSvc)
      },
      inject: [
        PostCombatContextAccessor,
        PostCombatValidator,
        PostCombatDomainConverter,
        PostCombatTransactionManager,
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
