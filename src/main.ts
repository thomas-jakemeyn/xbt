#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { CliModule } from './cli/cli.module';
import { CliService } from './cli/cli.service';

async function bootstrap() {
  const cliContext = await NestFactory.createApplicationContext(CliModule, { logger: false });
  const cliService = cliContext.get<CliService>(CliService);
  const params = cliService.parseParams(process.argv);

  const appModule = AppModule.forRoot(params);
  const appContext = await NestFactory.createApplicationContext(appModule, { logger: params.verbose });
  const appService = appContext.get<AppService>(AppService);
  await appService.run();
}

bootstrap();
