import { Module } from '@nestjs/common';
import { DagService } from './dag.service';
import { GitService } from './git.service';
import { GlobService } from './glob.service';
import { NodeService } from './node.service';
import { YamlService } from './yaml.service';
import { DepsService } from './deps.service';

const providers = [
  DagService,
  DepsService,
  GitService,
  GlobService,
  NodeService,
  YamlService,
];

@Module({
  providers,
  exports: providers,
})
export class AdapterModule {}
