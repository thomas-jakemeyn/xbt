import { Injectable } from '@nestjs/common';
import { ManifestService } from './manifest/manifest.service';

@Injectable()
export class AppService {
  constructor(private manifestService: ManifestService) {}

  run() {
    this.manifestService.getManifests();
  }
}
