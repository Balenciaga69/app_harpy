import { Scope } from '@nestjs/common'
import {
  ItemConstraintService,
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
  ItemModifierAggregationService,
  ItemRollService,
  ItemGenerationService,
  ItemEntityService,
} from '../from-game-core'
import { InjectionTokens } from './injection-tokens'
export const itemGenerationProviders = [
  {
    provide: ItemConstraintService,
    useFactory: (config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new ItemConstraintService(config, snapshot)
    },
    inject: [InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemModifierAggregationService,
    useFactory: (config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new ItemModifierAggregationService(config, snapshot)
    },
    inject: [InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
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
    inject: [ItemConstraintService, InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
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
    scope: Scope.REQUEST,
  },
]
