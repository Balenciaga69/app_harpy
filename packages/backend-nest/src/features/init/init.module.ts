import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { runFeatureProviders } from './providers/run.providers'
import { InitController } from './init.controller'
import { RunModule } from 'src/features/run/run.module'
import { AuthModule } from 'src/features/auth/auth.module'
import { RunService } from 'src/features/run/app/RunService'
import { UserMigrationService } from 'src/features/run/app/UserMigrationService'
import { InitService } from './init.service'
@Module({
  imports: [SharedInfraModule, SharedAppModule, RunModule, AuthModule],
  controllers: [InitController],
  providers: [InitService, RunService, UserMigrationService, ...runFeatureProviders],
  exports: [InitService, RunService, UserMigrationService],
})
export class InitModule {}
