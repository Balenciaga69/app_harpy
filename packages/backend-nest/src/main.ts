import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './features/app/app.module'
import { AllExceptionsFilter } from './infra/filters/all-exceptions.filter'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')
  // 設定全域異常過濾器
  app.useGlobalFilters(new AllExceptionsFilter())
  // 設定 Swagger
  const config = new DocumentBuilder()
    .setTitle('Game Core API')
    .setDescription('遊戲核心 API 文檔')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  // 啟動應用
  const port = process.env.PORT ?? 3000
  await app.listen(port)
  logger.log(`應用已啟動, Swagger 文檔地址: http://localhost:${port}/api`)
}
void bootstrap()
