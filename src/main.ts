import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(AppModule);
  const appService = context.get<AppService>(AppService);
  console.log(appService.getHello());
}
bootstrap();
