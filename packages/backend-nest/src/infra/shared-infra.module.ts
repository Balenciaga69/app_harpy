import { Module, Scope } from '@nestjs/common'
import { ContextManager } from './context/ContextManager'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
type ConfigStore = ConstructorParameters<typeof ContextManager>[0]
@Module({
  providers: [
    ...configStoreProviders,
    {
      provide: ContextManager,
      useFactory: (configStore: ConfigStore) => {
        return new ContextManager(configStore)
      },
      inject: ['CONFIG_STORE'],
      scope: Scope.DEFAULT,
    },
    ...fineGrainedInterfaceProviders,
  ],
  exports: [ContextManager, 'IConfigStoreAccessor', 'IContextSnapshotAccessor', 'IContextMutator', 'CONFIG_STORE'],
})
export class SharedInfraModule {}
