import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { equipmentFeatureProviders } from './providers/equipment.providers'
/**
 * 裝備模組
 * 職責：處理裝備相關功能
 */
@Module({
  imports: [SharedInfraModule],
  providers: [...equipmentFeatureProviders],
  exports: [...equipmentFeatureProviders],
})
export class EquipmentModule {}
