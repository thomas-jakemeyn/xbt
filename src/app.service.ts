import { Injectable } from '@nestjs/common';
import { ManifestService } from './manifest/manifest.service';

@Injectable()
export class AppService {
  constructor(private manifestService: ManifestService) {}

  async run() {
    const manifests = await this.manifestService.getManifests();
    console.log(manifests);
  }
}
