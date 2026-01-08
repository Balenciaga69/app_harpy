import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  ItemEntityService,
  CharacterAggregateService,
} from 'src/from-game-core'
/**
 * 上下文轉換和工作單元提供者
 * 職責：上下文與領域模型的轉換以及事務管理
 * - ContextToDomainConverter: 將上下文轉換為領域模型
 * - ContextUnitOfWork: 管理應用事務
 *
 * 層級：app（應用層）
 * 原因：這些是應用服務層的協調工具
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
