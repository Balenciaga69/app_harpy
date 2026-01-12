import { Module } from '@nestjs/common'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { SharedInfraModule } from 'src/features/shared/shared-infra.module'
import { AuthModule } from '../auth/auth.module'
import { EquipmentModule } from '../equipment/equipment.module'
import { RunModule } from '../run/run.module'
import { ShopModule } from '../shop/shop.module'
import { HealthController } from './app.controller'
@Module({
  imports: [SharedInfraModule, SharedAppModule, AuthModule, RunModule, ShopModule, EquipmentModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
