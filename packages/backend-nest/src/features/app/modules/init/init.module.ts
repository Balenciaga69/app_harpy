import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { runFeatureProviders } from './providers/run.providers'
import { InitController } from './init.controller'
import { InitService } from './init.service'
/**
 * 初始化模組
 * 職責：處理遊戲進度初始化
 */
@Module({
  imports: [SharedInfraModule],
  controllers: [InitController],
  providers: [InitService, ...runFeatureProviders],
  exports: [InitService],
})
export class InitModule {}
