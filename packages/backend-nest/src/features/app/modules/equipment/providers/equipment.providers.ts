import { Scope } from '@nestjs/common'
import {
  AppContextHolder,
  EquipmentContextHandler,
  EquipmentService,
  ContextToDomainConverter,
  ContextUnitOfWork,
  IContextSnapshotAccessor,
} from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'

export const equipmentFeatureProviders = [
  {
    provide: EquipmentContextHandler,
    useFactory: (
      snapshot: IContextSnapshotAccessor,
      converter: ContextToDomainConverter,
      uow: ContextUnitOfWork,
      holder: AppContextHolder,
      ctxManager: ContextManager
    ) => {
      return new EquipmentContextHandler(snapshot, converter, uow, holder, ctxManager)
    },
    inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork, AppContextHolder, ContextManager],
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
