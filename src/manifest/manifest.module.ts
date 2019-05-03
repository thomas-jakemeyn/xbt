import { Module } from '@nestjs/common';
import { ManifestService } from './manifest.service';

@Module({
  providers: [ManifestService],
  exports: [ManifestService],
})
export class ManifestModule {}
