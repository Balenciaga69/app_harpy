import { Module } from '@nestjs/common'
import { SharedFeatureModule } from '../shared/shared.module'
import { HealthController } from './app.controller'
@Module({
  imports: [SharedFeatureModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
