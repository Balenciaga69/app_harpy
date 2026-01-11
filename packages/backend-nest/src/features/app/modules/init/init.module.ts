import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../shared/shared-app.module'
import { runFeatureProviders } from './providers/run.providers'
import { InitController } from './init.controller'
import { InitService } from './init.service'
import { RunModule } from '../../../run/run.module'
@Module({
  imports: [SharedInfraModule, SharedAppModule, RunModule],
  controllers: [InitController],
  providers: [InitService, ...runFeatureProviders],
  exports: [InitService],
})
export class InitModule {}
