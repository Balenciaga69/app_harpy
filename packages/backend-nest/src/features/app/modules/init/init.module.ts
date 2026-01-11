import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../shared/shared-app.module'
import { runFeatureProviders } from './providers/run.providers'
import { InitController } from './init.controller'
import { InitService } from './init.service'
import { RunModule } from '../../../run/run.module'
import { AuthModule } from '../../../auth/auth.module'
import { RunService } from '../../../run/app/RunService'
import { UserMigrationService } from '../../../run/app/UserMigrationService'
@Module({
  imports: [SharedInfraModule, SharedAppModule, RunModule, AuthModule],
  controllers: [InitController],
  providers: [InitService, RunService, UserMigrationService, ...runFeatureProviders],
  exports: [InitService, RunService, UserMigrationService],
})
export class InitModule {}
