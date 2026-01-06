import { Scope } from '@nestjs/common'
import {
  PostCombatContextAccessor,
  PostCombatDomainConverter,
  PostCombatValidator,
  PostCombatTransactionManager,
  PostCombatContextHandler,
  PostCombatCoordinationService,
  RewardFactory,
  ItemEntityService,
  CharacterAggregateService,
  ItemGenerationService,
  RunService,
  ContextUnitOfWork,
} from 'src/from-game-core'

/**
 * 戰後獎勵功能提供者
 * 負責戰鬥後的獎勵計算、驗證和上下文管理
 */
export const postCombatFeatureProviders = [
  {
    provide: PostCombatContextAccessor,
    useFactory: (snapshot: any) => {
      return new PostCombatContextAccessor(snapshot)
    },
    inject: ['IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: PostCombatDomainConverter,
    useFactory: (snapshot: any, itemSvc: ItemEntityService, charSvc: CharacterAggregateService) => {
      return new PostCombatDomainConverter(snapshot, itemSvc, charSvc)
    },
    inject: ['IContextSnapshotAccessor', ItemEntityService, CharacterAggregateService],
    scope: Scope.REQUEST,
  },
  {
    provide: PostCombatValidator,
    useFactory: (accessor: PostCombatContextAccessor) => {
      return new PostCombatValidator(accessor)
    },
    inject: [PostCombatContextAccessor],
    scope: Scope.REQUEST,
  },
  {
    provide: PostCombatTransactionManager,
    useFactory: (uow: ContextUnitOfWork, snapshot: any) => {
      return new PostCombatTransactionManager(snapshot, uow)
    },
    inject: [ContextUnitOfWork, 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: RewardFactory,
    useFactory: (itemGenSvc: ItemGenerationService, config: any) => {
      return new RewardFactory(itemGenSvc, config)
    },
    inject: [ItemGenerationService, 'IConfigStoreAccessor'],
    scope: Scope.REQUEST,
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
    scope: Scope.REQUEST,
  },
  {
    provide: PostCombatCoordinationService,
    useFactory: (handler: PostCombatContextHandler, runSvc: RunService) => {
      return new PostCombatCoordinationService(handler, runSvc)
    },
    inject: [PostCombatContextHandler, RunService],
    scope: Scope.REQUEST,
  },
]
