import { Module, Scope } from '@nestjs/common'
import { ContextManager } from './context/context-manager'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
import { InjectionTokens } from './providers/injection-tokens'
import { RedisModule } from './redis/redis.module'
import { RedisContextRepository } from './repositories/redis-context.repository'
type ConfigStore = ConstructorParameters<typeof ContextManager>[0]
@Module({
  imports: [RedisModule],
  providers: [
    ...configStoreProviders,
    {
      provide: InjectionTokens.ContextBatchRepository,
      useClass: RedisContextRepository,
    },
    {
      provide: ContextManager,
      useFactory: (configStore: ConfigStore, repo: RedisContextRepository) => {
        return new ContextManager(configStore, repo)
      },
      inject: [InjectionTokens.ConfigStore, InjectionTokens.ContextBatchRepository],
      scope: Scope.DEFAULT,
    },
    ...fineGrainedInterfaceProviders,
  ],
  exports: [
    ContextManager,
    InjectionTokens.ContextBatchRepository,
    InjectionTokens.ConfigStoreAccessor,
    InjectionTokens.ContextSnapshotAccessor,
    InjectionTokens.ContextMutator,
    InjectionTokens.ConfigStore,
  ],
})
export class SharedInfraModule {}
