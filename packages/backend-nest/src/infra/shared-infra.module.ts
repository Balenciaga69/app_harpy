import { Module, Scope } from '@nestjs/common'
import { ContextManager } from './context/ContextManager'
import { RequestContextProvider } from './context/RequestContextProvider'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
@Module({
  providers: [
    ...configStoreProviders,
    RequestContextProvider,
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
    RequestContextProvider,
    'IConfigStoreAccessor',
    'IContextSnapshotAccessor',
    'IContextMutator',
    'CONFIG_STORE',
  ],
})
export class SharedInfraModule {}
