import { EnemyEntityService } from '@app-harpy/game-core/dist/application/content-generation/service/enemy/EnemyEntityService'
import { EnemyRandomGenerateService } from '@app-harpy/game-core/dist/application/content-generation/service/enemy/EnemyRandomGenerateService'
import { RewardFactory } from '@app-harpy/game-core/dist/application/features/post-combat/reward/RewardFactory'
import { StageInitializationService } from '@app-harpy/game-core/dist/application/features/run/stage-progression/service/StageInitializationService'
import { Module, Scope } from '@nestjs/common'
import {
  AffixEntityService,
  CharacterAggregateService,
  ContextToDomainConverter,
  ContextUnitOfWork,
  EquipmentContextHandler,
  EquipmentService,
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
  IContextMutator,
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

/**
 * RunModule
 * 管理遊戲流程、商店、裝備、戰後獎勵等相關服務
 *
 * 注意：
 * - 許多服務仍依賴細粒度介面（IConfigStoreAccessor, IContextSnapshotAccessor, IContextMutator）
 * - ContextStorage 提供運行時上下文的非同步本地存儲，用於按需建立服務實例
 * - Token bindings ('IConfigStoreAccessor' 等) 允許服務透過字串 token 注入細粒度介面
 */
@Module({
  controllers: [RunController],
  providers: [
    // ============================================
    // Infrastructure
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

    // ============================================
    // Configuration & Stores
    // ============================================
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
    // Fine-grained Interface Tokens
    // (由 ContextStorage 建立的實例提供)
    // ============================================
    {
      provide: 'IConfigStoreAccessor',
      useFactory: () => {
        if (!ContextStorage.hasContext()) return null
        const ctx = ContextStorage.getContext()
        return {
          getConfigStore: () => ctx.configStore,
        }
      },
      scope: Scope.TRANSIENT,
    },
    {
      provide: 'IContextSnapshotAccessor',
      useFactory: () => {
        if (!ContextStorage.hasContext()) return null
        const ctx = ContextStorage.getContext()
        return {
          getRunContext: () => ctx.contexts.runContext,
          getCharacterContext: () => ctx.contexts.characterContext,
          getStashContext: () => ctx.contexts.stashContext,
          getShopContext: () => ctx.contexts.shopContext,
          getAllContexts: () => ctx.contexts,
          getCurrentAtCreatedInfo: () => ({
            chapter: ctx.contexts.runContext.currentChapter,
            stage: ctx.contexts.runContext.currentStage,
            difficulty: 1, // TODO: calculate from chapter/stage
          }),
          getCurrentInfoForCreateRecord: () => ({
            difficulty: 1,
            sourceUnitId: ctx.contexts.characterContext.id,
            atCreated: {
              chapter: ctx.contexts.runContext.currentChapter,
              stage: ctx.contexts.runContext.currentStage,
              difficulty: 1,
            },
          }),
          getRunStatus: () => ctx.contexts.runContext.status,
        }
      },
      scope: Scope.TRANSIENT,
    },
    {
      provide: 'IContextMutator',
      useFactory: () => {
        if (!ContextStorage.hasContext()) return null
        const ctxRef = { current: ContextStorage.getContext() }
        return {
          setRunContext: (ctx) => {
            ctxRef.current = {
              ...ctxRef.current,
              contexts: { ...ctxRef.current.contexts, runContext: ctx },
            }
            ContextStorage.setContext(ctxRef.current)
          },
          setCharacterContext: (ctx) => {
            ctxRef.current = {
              ...ctxRef.current,
              contexts: { ...ctxRef.current.contexts, characterContext: ctx },
            }
            ContextStorage.setContext(ctxRef.current)
          },
          setStashContext: (ctx) => {
            ctxRef.current = {
              ...ctxRef.current,
              contexts: { ...ctxRef.current.contexts, stashContext: ctx },
            }
            ContextStorage.setContext(ctxRef.current)
          },
          setShopContext: (ctx) => {
            ctxRef.current = {
              ...ctxRef.current,
              contexts: { ...ctxRef.current.contexts, shopContext: ctx },
            }
            ContextStorage.setContext(ctxRef.current)
          },
        }
      },
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Content Generation Services
    // ============================================
    AffixEntityService,
    {
      provide: UltimateEntityService,
      useFactory: (affixSvc: AffixEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
        return new UltimateEntityService(affixSvc, config, snapshot)
      },
      inject: [AffixEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemEntityService,
      useFactory: (affixSvc: AffixEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
        return new ItemEntityService(config, snapshot, affixSvc)
      },
      inject: [AffixEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ProfessionEntityService,
      useFactory: (config: IConfigStoreAccessor) => {
        return new ProfessionEntityService(config)
      },
      inject: ['IConfigStoreAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: CharacterAggregateService,
      useFactory: (
        profSvc: ProfessionEntityService,
        itemSvc: ItemEntityService,
        ultimateSvc: UltimateEntityService
      ) => {
        return new CharacterAggregateService(profSvc, itemSvc, ultimateSvc)
      },
      inject: [ProfessionEntityService, ItemEntityService, UltimateEntityService],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EnemyEntityService,
      useFactory: (
        affixSvc: AffixEntityService,
        ultimateSvc: UltimateEntityService,
        config: IConfigStoreAccessor,
        snapshot: IContextSnapshotAccessor
      ) => {
        return new EnemyEntityService(affixSvc, ultimateSvc, config, snapshot)
      },
      inject: [AffixEntityService, UltimateEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: EnemyRandomGenerateService,
      useFactory: (enemySvc: EnemyEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
        return new EnemyRandomGenerateService(enemySvc, config, snapshot)
      },
      inject: [EnemyEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Item Generation Chain
    // ============================================
    {
      provide: ItemConstraintService,
      useFactory: (config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
        return new ItemConstraintService(config, snapshot)
      },
      inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemModifierAggregationService,
      useFactory: (config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
        return new ItemModifierAggregationService(config, snapshot)
      },
      inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ItemRollService,
      useFactory: (
        constraintSvc: ItemConstraintService,
        config: IConfigStoreAccessor,
        snapshot: IContextSnapshotAccessor
      ) => {
        return new ItemRollService(config, snapshot, constraintSvc)
      },
      inject: [ItemConstraintService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
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
    // Context Converter & Unit of Work
    // ============================================
    {
      provide: ContextToDomainConverter,
      useFactory: (
        itemSvc: ItemEntityService,
        charSvc: CharacterAggregateService,
        snapshot: IContextSnapshotAccessor,
        config: IConfigStoreAccessor
      ) => {
        return new ContextToDomainConverter(itemSvc, charSvc, snapshot, config)
      },
      inject: [ItemEntityService, CharacterAggregateService, 'IContextSnapshotAccessor', 'IConfigStoreAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ContextUnitOfWork,
      useFactory: (snapshot: IContextSnapshotAccessor, mutator: IContextMutator) => {
        console.info('xZx snapshot', snapshot)
        console.info('xZx mutator', mutator)
        return new ContextUnitOfWork(mutator, snapshot)
      },
      inject: ['IContextSnapshotAccessor', 'IContextMutator'],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Feature: Shop
    // ============================================
    {
      provide: ShopContextHandler,
      useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
        return new ShopContextHandler(snapshot, converter, uow)
      },
      inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
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
    // Feature: Equipment
    // ============================================
    {
      provide: EquipmentContextHandler,
      useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
        return new EquipmentContextHandler(snapshot, converter, uow)
      },
      inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
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
    // Feature: Run
    // ============================================
    {
      provide: RunContextHandler,
      useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
        return new RunContextHandler(snapshot, converter, uow)
      },
      inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
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
      useFactory: (
        enemyGenSvc: EnemyRandomGenerateService,
        uow: ContextUnitOfWork,
        snapshot: IContextSnapshotAccessor
      ) => {
        return new StageInitializationService(snapshot, uow, enemyGenSvc)
      },
      inject: [EnemyRandomGenerateService, ContextUnitOfWork, 'IContextSnapshotAccessor'],
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
    // Feature: PostCombat
    // ============================================
    {
      provide: PostCombatContextAccessor,
      useFactory: (snapshot: IContextSnapshotAccessor) => {
        return new PostCombatContextAccessor(snapshot)
      },
      inject: ['IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: PostCombatDomainConverter,
      useFactory: (
        snapshot: IContextSnapshotAccessor,
        itemSvc: ItemEntityService,
        charSvc: CharacterAggregateService
      ) => {
        return new PostCombatDomainConverter(snapshot, itemSvc, charSvc)
      },
      inject: ['IContextSnapshotAccessor', ItemEntityService, CharacterAggregateService],
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
      useFactory: (uow: ContextUnitOfWork, snapshot: IContextSnapshotAccessor) => {
        return new PostCombatTransactionManager(snapshot, uow)
      },
      inject: [ContextUnitOfWork, 'IContextSnapshotAccessor'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: RewardFactory,
      useFactory: (itemGenSvc: ItemGenerationService, config: IConfigStoreAccessor) => {
        return new RewardFactory(itemGenSvc, config)
      },
      inject: [ItemGenerationService, 'IConfigStoreAccessor'],
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
      useFactory: (handler: PostCombatContextHandler, runSvc: RunService) => {
        return new PostCombatCoordinationService(handler, runSvc)
      },
      inject: [PostCombatContextHandler, RunService],
      scope: Scope.TRANSIENT,
    },

    // ============================================
    // Backend-Nest Services
    // ============================================
    RunNestService,
  ],
})
export class RunModule {}
