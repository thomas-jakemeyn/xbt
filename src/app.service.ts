import { Injectable } from '@nestjs/common';
import { ManifestService } from './manifest/manifest.service';
import { DagService } from './adapter/dag.service';

@Injectable()
export class AppService {
  constructor(
    private dagService: DagService,
    private manifestService: ManifestService) {}

  async run() {
    const manifests = await this.manifestService.getManifests();
    const dag = this.dagService.newDag(manifests);
    console.log(dag.sort());
  }
}
