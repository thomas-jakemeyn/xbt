import { Module } from '@nestjs/common';
import { GlobService } from './glob.service';
import { YamlService } from './yaml.service';

@Module({
  providers: [GlobService, YamlService],
  exports: [GlobService, YamlService],
})
export class AdapterModule {}
