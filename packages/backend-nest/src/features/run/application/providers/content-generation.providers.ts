import { Scope } from '@nestjs/common'
import {
  AffixEntityService,
  UltimateEntityService,
  ItemEntityService,
  ProfessionEntityService,
  CharacterAggregateService,
} from 'src/from-game-core'
/**
 * 內容生成服務提供者
 * 職責：實體和聚合體的生成邏輯
 * - Affix 實體服務
 * - Ultimate 實體服務
 * - Item 實體服務
 * - Profession 實體服務
 * - Character 聚合根服務
 *
 * 層級：app（應用層）
 * 原因：這些是業務邏輯層的服務，由應用服務協調使用
 */
export const contentGenerationProviders = [
  AffixEntityService,
  {
    provide: UltimateEntityService,
    useFactory: (affixSvc: AffixEntityService, config: any, snapshot: any) => {
      return new UltimateEntityService(affixSvc, config, snapshot)
    },
    inject: [AffixEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemEntityService,
    useFactory: (affixSvc: AffixEntityService, config: any, snapshot: any) => {
      return new ItemEntityService(config, snapshot, affixSvc)
    },
    inject: [AffixEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ProfessionEntityService,
    useFactory: (config: any) => {
      return new ProfessionEntityService(config)
    },
    inject: ['IConfigStoreAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: CharacterAggregateService,
    useFactory: (profSvc: ProfessionEntityService, itemSvc: ItemEntityService, ultimateSvc: UltimateEntityService) => {
      return new CharacterAggregateService(profSvc, itemSvc, ultimateSvc)
    },
    inject: [ProfessionEntityService, ItemEntityService, UltimateEntityService],
    scope: Scope.REQUEST,
  },
]
