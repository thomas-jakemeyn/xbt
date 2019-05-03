import { Module } from '@nestjs/common';
import { GlobService } from './glob.service';
import { YamlService } from './yaml.service';
import { DagService } from './dag.service';

@Module({
  providers: [DagService, GlobService, YamlService],
  exports: [DagService, GlobService, YamlService],
})
export class AdapterModule {}
