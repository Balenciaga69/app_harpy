import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../application/shared-app.module'
import { RunInitializationService } from 'src/from-game-core'
import { runFeatureProviders } from './providers/run-feature.providers'
import { InitController } from './init.controller'
import { InitService } from './init.service'
/**
 * 初始化模組
 * 職責：管理遊戲進度初始化相關的功能
 *
 * 依賴層級：
 * InitModule
 *   ├─ imports: SharedInfraModule (infra 層基礎)
 *   ├─ imports: SharedAppModule (app 層服務)
 *   └─ providers: runFeatureProviders (此模組特定邏輯)
 */
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [InitController],
  providers: [RunInitializationService, InitService, ...runFeatureProviders],
  exports: [InitService],
})
export class InitModule {}
