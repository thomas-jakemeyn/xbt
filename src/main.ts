import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ConfigParams } from './config/config.service';

async function bootstrap() {
  const params: ConfigParams = {
    manifestGlob: '**/.xbt.yml',
    ref: 'master',
    rootDir: '/Projects/monorepo',
  };
  const appModule = AppModule.forRoot(params);
  const appContext = await NestFactory.createApplicationContext(appModule);
  const appService = appContext.get<AppService>(AppService);
  await appService.run();
}
bootstrap();
