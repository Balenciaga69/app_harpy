import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../shared/shared-app.module'
import { equipmentFeatureProviders } from './providers/equipment.providers'
/**
 * 裝備模組
 * 職責：處理裝備相關功能
 */
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  providers: [...equipmentFeatureProviders],
  exports: [...equipmentFeatureProviders],
})
export class EquipmentModule {}
