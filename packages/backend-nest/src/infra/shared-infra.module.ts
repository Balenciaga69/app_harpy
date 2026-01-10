import { Module, Scope } from '@nestjs/common'
import { ContextManager } from './context/ContextManager'
import { RedisContextRepository } from './repositories/RedisContextRepository'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
import { RedisModule } from './redis/redis.module'
type ConfigStore = ConstructorParameters<typeof ContextManager>[0]
@Module({
  imports: [RedisModule],
  providers: [
    ...configStoreProviders,
    {
      provide: 'IContextBatchRepository',
      useClass: RedisContextRepository,
    },
    {
      provide: ContextManager,
      useFactory: (configStore: ConfigStore, repo: RedisContextRepository) => {
        return new ContextManager(configStore, repo)
      },
      inject: ['CONFIG_STORE', 'IContextBatchRepository'],
      scope: Scope.DEFAULT,
    },
    ...fineGrainedInterfaceProviders,
  ],
  exports: [
    ContextManager,
    'IContextBatchRepository',
    'IConfigStoreAccessor',
    'IContextSnapshotAccessor',
    'IContextMutator',
    'CONFIG_STORE',
  ],
})
export class SharedInfraModule {}
