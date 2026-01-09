import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../shared/shared-app.module'
import { equipmentFeatureProviders } from './providers/equipment.providers'
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  providers: [...equipmentFeatureProviders],
  exports: [...equipmentFeatureProviders],
})
export class EquipmentModule {}
