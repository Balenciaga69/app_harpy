import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  ItemEntityService,
  CharacterAggregateService,
} from 'src/from-game-core'
/**
 * 上下文轉換和工作單元提供者
 * 負責上下文與領域模型的轉換以及事務管理
 */
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
