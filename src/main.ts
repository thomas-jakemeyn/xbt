#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { CliModule } from './cli/cli.module';
import { CliService } from './cli/cli.service';

process
  .on('uncaughtException', onUncaughtException)
  .on('unhandledRejection', onUncaughtException)
  .on('SIGTERM', onShutdownSignal)
  .on('SIGINT', onShutdownSignal);

function onUncaughtException(exception) {
  // tslint:disable-next-line: no-console
  console.error(`Uncaught exception, exit(1): ${exception}`);
  process.exit(1);
}
  
function onShutdownSignal() {
  // tslint:disable-next-line: no-console
  console.info('Got shutdown signal, exit(0)');
  process.exit(0);
}

async function bootstrap() {
  const cliContext = await NestFactory.createApplicationContext(CliModule, { logger: false });
  const cliService = cliContext.get<CliService>(CliService);
  const params = cliService.parseParams(process.argv);

  const appModule = AppModule.forRoot(params);
  const appContext = await NestFactory.createApplicationContext(appModule, { logger: false });
  const appService = appContext.get<AppService>(AppService);
  await appService.run();
}

bootstrap();
