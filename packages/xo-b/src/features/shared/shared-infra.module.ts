import { Module, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { ContextManager } from './context/context-manager'
import { IContextBatchRepository } from '../../from-xo-c'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
import { InjectionTokens } from './providers/injection-tokens'
import { RedisModule } from './redis/redis.module'
import { InMemoryContextRepository } from './repositories/in-memory-context.repository'
import { RedisContextRepository } from './repositories/redis-context.repository'
type ConfigStore = ConstructorParameters<typeof ContextManager>[0]
@Module({
  imports: [RedisModule],
  providers: [
    ...configStoreProviders,
    {
      provide: InjectionTokens.ContextBatchRepository,
      useFactory: (configService: ConfigService, redis: Redis) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'memory')
        if (storageType === 'memory') {
          return new InMemoryContextRepository()
        }
        return new RedisContextRepository(redis)
      },
      inject: [ConfigService, InjectionTokens.RedisClient],
    },
    {
      provide: ContextManager,
      useFactory: (configStore: ConfigStore, repo: IContextBatchRepository) => {
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
