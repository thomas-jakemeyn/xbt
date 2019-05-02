import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as glob from 'glob';
import * as git from 'isomorphic-git';
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
  //console.log(graph.sort());

  git.plugins.set('fs', fs);
  const dir = '.';
  const gitdir = dir;

  // case 1: compare branch with reference
  const ref = 'master';
  const refCommit = await git.resolveRef({ dir, ref });
  const headCommit = await git.resolveRef({ dir, ref: 'HEAD' });

  // Include changes since the first commit after the common ancestor of both the reference commit and the HEAD
  let commits = [];
  let currentCommit = headCommit;
  while(currentCommit !== refCommit
    && !(await git.isDescendent({dir, oid: refCommit, ancestor: currentCommit, depth: '-1'}))) {
    commits = await git.log({ dir, depth: 2, ref: currentCommit });
    if (commits.length < 2) {
      console.log(`No common ancestor found for HEAD and ${ref}!`);
      process.exit(1);
    }
    currentCommit = commits[1].oid;
  }
  const firstCommit = commits.length > 0 ? commits[0] : null;

  if (!firstCommit) {
    console.log('No change detected');
    process.exit(0);
  }
  console.log(`Include changes starting from commit ${firstCommit}`);

  const trees = [
    git.TREE({fs, gitdir, ref: firstCommit}),
    git.TREE({fs, gitdir, ref: headCommit}),
  ];
  const filter = async ([first, last]: git.WalkerEntry) => {
    await first.populateHash();
    await last.populateHash();
    return first.oid === last.oid;
  };
  const changes = await git.walkBeta1({trees, filter});
  console.log(changes);
}
bootstrap();
