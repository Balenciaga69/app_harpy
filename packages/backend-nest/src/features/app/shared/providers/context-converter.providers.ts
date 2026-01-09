import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  ItemEntityService,
  CharacterAggregateService,
} from 'src/from-game-core'
export const contextConverterProviders = [
  {
    provide: ContextToDomainConverter,
    useFactory: (itemSvc: ItemEntityService, charSvc: CharacterAggregateService, snapshot: any, config: any) => {
      return new ContextToDomainConverter(itemSvc, charSvc, snapshot, config)
    },
    inject: [ItemEntityService, CharacterAggregateService, 'IContextSnapshotAccessor', 'IConfigStoreAccessor'],
    scope: Scope.REQUEST,
  },
  {
    provide: ContextUnitOfWork,
    useFactory: (snapshot: any, mutator: any) => {
      return new ContextUnitOfWork(mutator, snapshot)
    },
    inject: ['IContextSnapshotAccessor', 'IContextMutator'],
    scope: Scope.REQUEST,
  },
]
