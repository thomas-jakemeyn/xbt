import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as glob from 'glob';
import { promisify } from 'util';
import * as yaml from 'yaml';
import { AppModule } from './app.module';
import { AppService } from './app.service';

import { DGraph } from '@thi.ng/dgraph';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(AppModule);
  const appService = context.get<AppService>(AppService);
  console.log(appService.getHello());

  // discover XBT files
  const workDir = '/Projects/monorepo';
  const xbtFiles = await promisify(glob)('**/.xbt.yml', {
    cwd: workDir,
    realpath: true,
  });

  // read XBT files
  const xbtFilesContent = (await Promise.all(
    xbtFiles.map(xbtFile => promisify(fs.readFile)(xbtFile)),
  )).join('\n...\n');

  // parse XBT files
  const xbts: [{ name: string; deps: string[] }] = yaml
    .parseAllDocuments(xbtFilesContent)
    .map(doc => doc.toJSON())
    .reduce((acc, xbt) => {
      return { ...acc, [xbt.name]: xbt };
    }, {});

  // create DAG
  const graph = new DGraph();
  Object.values(xbts).forEach(xbt => {
    if (xbt.deps && xbt.deps.length > 0) {
      xbt.deps.forEach(dep => graph.addDependency(xbt, xbts[dep]));
    } else {
      graph.addNode(xbt);
    }
  });

  console.log(graph.sort());
}
bootstrap();
