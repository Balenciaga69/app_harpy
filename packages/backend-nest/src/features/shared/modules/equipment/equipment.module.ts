import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../application/shared-app.module'
import { EquipmentService } from 'src/from-game-core'
import { equipmentFeatureProviders } from './providers/equipment-feature.providers'
import { EquipmentController } from './equipment.controller'
import { EquipmentNestService } from './equipment.service'
/**
 * 裝備模組
 * 職責：管理裝備相關功能
 *
 * 依賴層級：
 * EquipmentModule
 *   ├─ imports: SharedInfraModule (infra 層基礎)
 *   ├─ imports: SharedAppModule (app 層服務)
 *   └─ providers: equipmentFeatureProviders (此模組特定邏輯)
 */
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [EquipmentController],
  providers: [...equipmentFeatureProviders, EquipmentNestService],
  exports: [EquipmentNestService, EquipmentService],
})
export class EquipmentModule {}
