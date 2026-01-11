import { Scope } from '@nestjs/common'
import {
  AffixEntityService,
  UltimateEntityService,
  ItemEntityService,
  ProfessionEntityService,
  CharacterAggregateService,
  IContextSnapshotAccessor,
  IConfigStoreAccessor,
} from 'src/from-game-core'
export const contentGenerationProviders = [
  {
    provide: AffixEntityService,
    useFactory: (configStoreAccessor: IConfigStoreAccessor, contextSnapshot: IContextSnapshotAccessor) => {
      return new AffixEntityService(configStoreAccessor, contextSnapshot)
    },
    inject: ['IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: UltimateEntityService,
    useFactory: (affixSvc: AffixEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new UltimateEntityService(affixSvc, config, snapshot)
    },
    inject: [AffixEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemEntityService,
    useFactory: (affixSvc: AffixEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new ItemEntityService(config, snapshot, affixSvc)
    },
    inject: [AffixEntityService, 'IConfigStoreAccessor', 'IContextSnapshotAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ProfessionEntityService,
    useFactory: (config: IConfigStoreAccessor) => {
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
