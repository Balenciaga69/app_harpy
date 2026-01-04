import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 設置
  const config = new DocumentBuilder()
    .setTitle('Game Core API')
    .setDescription('遊戲核心 API 文檔')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`應用已啟動，Swagger 文檔地址: http://localhost:3000/api`);
}

void bootstrap();
