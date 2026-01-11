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
import { InjectionTokens } from '../../../infra/providers/injection-tokens'
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
    inject: [
      ItemEntityService,
      CharacterAggregateService,
      InjectionTokens.ContextSnapshotAccessor,
      InjectionTokens.ConfigStoreAccessor,
    ],
    scope: Scope.REQUEST,
  },
  {
    provide: ContextUnitOfWork,
    useFactory: (snapshot: IContextSnapshotAccessor, mutator: IContextMutator) => {
      return new ContextUnitOfWork(mutator, snapshot)
    },
    inject: [InjectionTokens.ContextSnapshotAccessor, InjectionTokens.ContextMutator],
    scope: Scope.REQUEST,
  },
]
