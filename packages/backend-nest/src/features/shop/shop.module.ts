import { Module } from '@nestjs/common'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { SharedInfraModule } from 'src/features/shared/shared-infra.module'
import { ShopController } from './shop.controller'
import { shopFeatureProviders } from './shop.providers'
import { ShopNestService } from './shop.service'
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [ShopController],
  providers: [ShopNestService, ...shopFeatureProviders],
  exports: [ShopNestService],
})
export class ShopModule {}
