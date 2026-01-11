import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RedisRunRepository } from './infra/RedisRunRepository'
import { IsOwnRunGuard } from './infra/IsOwnRunGuard'
import { AuthModule } from '../auth/auth.module'
@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: 'IRunRepository',
      useFactory: (redis: Redis) => new RedisRunRepository(redis),
      inject: ['REDIS_CLIENT'],
    },
    IsOwnRunGuard,
  ],
  exports: ['IRunRepository', IsOwnRunGuard],
})
export class RunModule {}
