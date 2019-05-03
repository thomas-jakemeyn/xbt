import { Module } from '@nestjs/common';
import { GlobService } from './glob.service';
import { YamlService } from './yaml.service';
import { DagService } from './dag.service';
import { GitService } from './git.service';

@Module({
  providers: [DagService, GitService, GlobService, YamlService],
  exports: [DagService, GitService, GlobService, YamlService],
})
export class AdapterModule {}
