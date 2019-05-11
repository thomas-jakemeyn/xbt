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

const templates = {
  sh: path.resolve(__dirname, 'assets', 'template.sh'),
};

const argv = program
  .version(pkg.version)
  .usage('[options] <command ...>')
  .option('-a, --all', 'Involve all the components, not only the dirty ones')
  .option('-g, --glob <pattern>', 'The glob pattern matching the manifest files', '**/.xbt.yml')
  .option('-p, --path <template>', 'The path to the template file to compile (takes precedence over -t option)')
  .option('-r, --ref <ref>', 'The git reference to compare with', 'develop')
  .option('-t, --template <key>', 'The key of the pre-defined template to compile', /^(sh)$/i, 'sh')
  .option('-v, --verbose', 'A flag to enable debug logs')
  .parse(process.argv);

const params: ConfigParams = {
  cmd: argv.args.length > 0 ? argv.args : ['build'],
  includeAll: !!argv.all,
  manifestGlob: argv.glob,
  ref: argv.ref,
  rootDir: process.cwd(),
  templatePath: path.resolve(process.cwd(), argv.path) || templates[argv.template],
  verbose: !!argv.verbose,
};

bootstrap(params);
