import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './features/app/app.module'
import { AllExceptionsFilter } from './features/shared/filters/all-exceptions.filter'
import { ResultExceptionFilter } from './features/shared/filters/result-exception.filter'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')
  const configService = app.get(ConfigService)
  app.use(cookieParser())
  app.useGlobalFilters(new ResultExceptionFilter(), new AllExceptionsFilter())
  // 設定 Swagger
  const config = new DocumentBuilder()
    .setTitle('Game Core API')
    .setDescription('遊戲核心 API 文檔')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: '請輸入 JWT Token',
        in: 'header',
      },
      'access-token'
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  // 啟動應用
  const port = configService.get<number>('PORT', 3000)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  await app.listen(port)
  logger.log(`應用已啟動, Swagger 文檔地址: http://localhost:${port}/api`)
}
void bootstrap()
