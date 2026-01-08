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
 * 職責：物品生成的完整流程
 * - ItemConstraintService: 物品約束檢查
 * - ItemModifierAggregationService: 物品修飾符聚合
 * - ItemRollService: 物品掉落機制
 * - ItemGenerationService: 物品生成協調
 *
 * 層級：app（應用層）
 * 原因：這些是應用層的複雜業務流程
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
