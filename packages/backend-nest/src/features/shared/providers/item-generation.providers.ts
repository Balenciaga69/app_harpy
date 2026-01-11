import { Scope } from '@nestjs/common'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
  ItemConstraintService,
  ItemEntityService,
  ItemGenerationService,
  ItemModifierAggregationService,
  ItemRollService,
} from 'src/from-game-core'
export const itemGenerationProviders = [
  {
    provide: ItemConstraintService,
    useFactory: (config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new ItemConstraintService(config, snapshot)
    },
    inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemModifierAggregationService,
    useFactory: (config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new ItemModifierAggregationService(config, snapshot)
    },
    inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
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
    inject: [ItemConstraintService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
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
