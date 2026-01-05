import { Module } from '@nestjs/common'
import { RunController } from './controllers/run.controller'
import { RunService } from './services/run.service'
import { ConfigService } from './services/config.service'
import { InMemoryContextRepository } from '../../infra/repositories/InMemoryContextRepository'
import { ItemGenerationService } from '../../infra/services/ItemGenerationService'
import { ShopContextHandler } from '../../infra/services/ShopContextHandler'
/**
 * Run 模組：整合 Run 相關的 Controller、Service、Repository
 */
@Module({
  controllers: [RunController],
  providers: [RunService, ConfigService, InMemoryContextRepository, ItemGenerationService, ShopContextHandler],
  exports: [InMemoryContextRepository],
})
export class RunModule {}
