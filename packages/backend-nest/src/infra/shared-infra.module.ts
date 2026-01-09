import { Module, Scope } from '@nestjs/common'
import { AppContextHolder } from '../from-game-core'
import { ContextManager } from './context/ContextManager'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
@Module({
  providers: [
    ...configStoreProviders,
    {
      provide: ContextManager,
      useFactory: (configStore: any) => {
        return new ContextManager(configStore)
      },
      inject: ['CONFIG_STORE'],
      scope: Scope.DEFAULT,
    },
    ...fineGrainedInterfaceProviders,
  ],
  exports: [
    ContextManager,
    AppContextHolder,
    'IConfigStoreAccessor',
    'IContextSnapshotAccessor',
    'IContextMutator',
    'CONFIG_STORE',
  ],
})
export class SharedInfraModule {}
