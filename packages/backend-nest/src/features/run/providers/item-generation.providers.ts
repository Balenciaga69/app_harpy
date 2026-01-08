import { Scope } from '@nestjs/common'
import {
  ItemConstraintService,
  ItemModifierAggregationService,
  ItemRollService,
  ItemGenerationService,
  ItemEntityService,
} from 'src/from-game-core'
/**
 * 物品生成鏈提供者
 * 負責物品生成的完整流程（約束、修飾符、掉落、生成）
 */
export const itemGenerationProviders = [
  {
    provide: ItemConstraintService,
    useFactory: (config: any, snapshot: any) => {
      return new ItemConstraintService(config, snapshot)
    },
    inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemModifierAggregationService,
    useFactory: (config: any, snapshot: any) => {
      return new ItemModifierAggregationService(config, snapshot)
    },
    inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemRollService,
    useFactory: (constraintSvc: ItemConstraintService, config: any, snapshot: any) => {
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
