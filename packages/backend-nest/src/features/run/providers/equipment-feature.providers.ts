import { Scope } from '@nestjs/common'
import {
  EquipmentContextHandler,
  EquipmentService,
  ContextToDomainConverter,
  ContextUnitOfWork,
} from 'src/from-game-core'

/**
 * 裝備功能提供者
 * 負責裝備相關的上下文處理和業務邏輯
 */
export const equipmentFeatureProviders = [
  {
    provide: EquipmentContextHandler,
    useFactory: (snapshot: any, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new EquipmentContextHandler(snapshot, converter, uow)
    },
    inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
    scope: Scope.REQUEST,
  },
  {
    provide: EquipmentService,
    useFactory: (handler: EquipmentContextHandler) => {
      return new EquipmentService(handler)
    },
    inject: [EquipmentContextHandler],
    scope: Scope.REQUEST,
  },
]
