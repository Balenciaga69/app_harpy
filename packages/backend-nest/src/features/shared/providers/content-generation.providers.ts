import { Scope } from '@nestjs/common'
import {
  AffixEntityService,
  CharacterAggregateService,
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
  ItemEntityService,
  ProfessionEntityService,
  UltimateEntityService,
} from 'src/from-game-core'
import { InjectionTokens } from '../../../infra/providers/injection-tokens'
export const contentGenerationProviders = [
  {
    provide: AffixEntityService,
    useFactory: (configStoreAccessor: IConfigStoreAccessor, contextSnapshot: IContextSnapshotAccessor) => {
      return new AffixEntityService(configStoreAccessor, contextSnapshot)
    },
    inject: [InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
  },
  {
    provide: UltimateEntityService,
    useFactory: (affixSvc: AffixEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new UltimateEntityService(affixSvc, config, snapshot)
    },
    inject: [AffixEntityService, InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
  },
  {
    provide: ItemEntityService,
    useFactory: (affixSvc: AffixEntityService, config: IConfigStoreAccessor, snapshot: IContextSnapshotAccessor) => {
      return new ItemEntityService(config, snapshot, affixSvc)
    },
    inject: [AffixEntityService, InjectionTokens.ConfigStoreAccessor, InjectionTokens.ContextSnapshotAccessor],
    scope: Scope.REQUEST,
  },
  {
    provide: ProfessionEntityService,
    useFactory: (config: IConfigStoreAccessor) => {
      return new ProfessionEntityService(config)
    },
    inject: [InjectionTokens.ConfigStoreAccessor],
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
