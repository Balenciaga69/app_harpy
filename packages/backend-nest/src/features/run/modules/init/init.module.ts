import { Module } from '@nestjs/common'
import { RunInitializationService } from 'src/from-game-core'
import { sharedProviders } from '../../providers/common-context-package'
import { runFeatureProviders } from '../../providers/run-feature.providers'
import { InitController } from './init.controller'
import { InitService } from './init.service'
/**
 * 初始化模組
 * 職責：管理遊戲進度初始化相關的功能
 */
@Module({
  controllers: [InitController],
  providers: [RunInitializationService, InitService, ...sharedProviders, ...runFeatureProviders],
  exports: [InitService],
})
export class InitModule {}
