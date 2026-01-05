import { Module } from '@nestjs/common'
import { HealthController } from './app.controller'
import { RunModule } from '../run/run.module'
@Module({
  imports: [RunModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
