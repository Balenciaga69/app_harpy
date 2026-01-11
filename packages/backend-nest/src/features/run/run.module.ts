import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'
import { InjectionTokens } from '../../infra/providers/injection-tokens'
import { AuthModule } from '../auth/auth.module'
import { IsOwnRunGuard } from './infra/is-own-run.guard'
import { RedisRunRepository } from './infra/redis-run-repository'
@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: InjectionTokens.RunRepository,
      useFactory: (redis: Redis) => new RedisRunRepository(redis),
      inject: [InjectionTokens.RedisClient],
    },
    IsOwnRunGuard,
  ],
  exports: [InjectionTokens.RunRepository, IsOwnRunGuard],
})
export class RunModule {}
