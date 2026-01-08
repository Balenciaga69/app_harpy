import { Module } from '@nestjs/common'
import { RunModule } from '../run/run.module'
import { HealthController } from './app.controller'
@Module({
  imports: [RunModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
