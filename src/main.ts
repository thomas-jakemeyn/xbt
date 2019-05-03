import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ConfigParams } from './config/config.service';

async function bootstrap() {
  const params: ConfigParams = {
    manifestGlob: '**/.xbt.yml',
    workDir: '/Projects/monorepo',
  };
  const appModule = AppModule.forRoot(params);
  const appContext = await NestFactory.createApplicationContext(appModule);
  const appService = appContext.get<AppService>(AppService);
  await appService.run();

  git.plugins.set('fs', fs);
  const dir = '.';
  const gitdir = `${dir}/.git`;

  // case 1: compare branch with reference
  const ref = 'master';
  const refCommit = await git.resolveRef({ dir, ref });
  const headCommit = await git.resolveRef({ dir, ref: 'HEAD' });

  let commits = [];
  let currentCommit = headCommit;
  while (currentCommit !== refCommit
    && !(await git.isDescendent({dir, oid: refCommit, ancestor: currentCommit, depth: '-1'}))) {
    commits = await git.log({ dir, depth: 2, ref: currentCommit });
    if (commits.length < 2) {
      console.log(`No common ancestor found for HEAD and ${ref}!`);
      process.exit(1);
    }
    currentCommit = commits[1].oid;
  }
  const firstCommit = currentCommit;

  if (firstCommit === headCommit) {
    console.log('No change detected');
    process.exit(0);
  }
  console.log(`Include changes between commit ${firstCommit} and commit ${headCommit}`);

  const trees = [
    git.TREE({fs, gitdir, ref: firstCommit}),
    git.TREE({fs, gitdir, ref: headCommit}),
  ];
  const filter = async ([first, head]: git.WalkerEntry) => {
    if (first.exists !== head.exists) {
      return true;
    }
    await first.populateHash();
    await head.populateHash();
    return first.oid !== head.oid;
  };
  const changes = await git.walkBeta1({trees, filter});
  console.log(changes);
}
bootstrap();
