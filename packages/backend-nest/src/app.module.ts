import { Module } from '@nestjs/common'
import { HealthController } from './features/app/app.controller'
import { RunModule } from './features/run/run.module'
@Module({
  imports: [RunModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
