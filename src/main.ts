#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import * as program from 'commander';
import * as path from 'path';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ConfigParams } from './config/config.service';
import pkg = require('../package.json');

async function bootstrap(config: ConfigParams) {
  const appModule = AppModule.forRoot(config);
  const appContext = await NestFactory.createApplicationContext(appModule, { logger: false });
  const appService = appContext.get<AppService>(AppService);
  await appService.run();
}

const argv = program
  .version(pkg.version)
  .usage('[options] <command ...>')
  .option('-g, --glob <pattern>', 'The glob pattern matching the manifest files', '**/.xbt.yml')
  .option('-r, --ref <ref>', 'The git reference to compare with', 'develop')
  .option('-t, --template <path>', 'The path to the template file to compile')
  .option('-v, --verbose', 'A flag to enable debug logs')
  .parse(process.argv);

const params: ConfigParams = {
  cmd: argv.args.length > 0 ? argv.args : ['build'],
  manifestGlob: argv.glob,
  ref: argv.ref,
  rootDir: process.cwd(),
  templatePath: path.normalize(argv.template || path.join(__dirname, 'assets', 'template.sh')),
  verbose: !!argv.verbose,
};

bootstrap(params);
