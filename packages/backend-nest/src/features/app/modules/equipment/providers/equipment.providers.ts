import { Scope } from '@nestjs/common'
import {
  EquipmentContextHandler,
  EquipmentService,
  ContextToDomainConverter,
  ContextUnitOfWork,
  IContextSnapshotAccessor,
} from 'src/from-game-core'

export const equipmentFeatureProviders = [
  {
    provide: EquipmentContextHandler,
    useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
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
