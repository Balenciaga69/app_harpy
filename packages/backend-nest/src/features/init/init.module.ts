import { Module } from '@nestjs/common'
import { AuthModule } from 'src/features/auth/auth.module'
import { RunService } from 'src/features/run/app/run.service'
import { UserMigrationService } from 'src/features/run/app/user-migration.service'
import { RunModule } from 'src/features/run/run.module'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { SharedInfraModule } from 'src/infra/shared-infra.module'

import { InitController } from './init.controller'
import { InitService } from './init.service'
import { runFeatureProviders } from './providers/run.providers'
@Module({
  imports: [SharedInfraModule, SharedAppModule, RunModule, AuthModule],
  controllers: [InitController],
  providers: [InitService, RunService, UserMigrationService, ...runFeatureProviders],
  exports: [InitService, RunService, UserMigrationService],
})
export class InitModule {}
