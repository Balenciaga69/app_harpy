import { Scope } from '@nestjs/common'
import {
  CharacterAggregateService,
  ContextToDomainConverter,
  ContextUnitOfWork,
  IConfigStoreAccessor,
  IContextMutator,
  IContextSnapshotAccessor,
  ItemEntityService,
} from 'src/from-game-core'
export const contextConverterProviders = [
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
    scope: Scope.REQUEST,
  },
  {
    provide: ContextUnitOfWork,
    useFactory: (snapshot: IContextSnapshotAccessor, mutator: IContextMutator) => {
      return new ContextUnitOfWork(mutator, snapshot)
    },
    inject: ['IContextSnapshotAccessor', 'IContextMutator'],
    scope: Scope.REQUEST,
  },
]
