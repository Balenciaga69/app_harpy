import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunModule } from './run/run.module';

@Module({
  imports: [RunModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
