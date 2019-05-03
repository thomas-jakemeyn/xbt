import { Injectable } from '@nestjs/common';
import { DagService } from './adapter/dag.service';
import { GitService } from './adapter/git.service';
import { ConfigService } from './config/config.service';
import { ManifestService } from './manifest/manifest.service';

@Injectable()
export class AppService {
  constructor(
    private config: ConfigService,
    private dagService: DagService,
    private gitService: GitService,
    private manifestService: ManifestService) {}

  async run() {
    const { rootDir: dir, ref } = this.config;
    const manifests = await this.manifestService.getManifests();
    const dag = this.dagService.newDag(manifests);
    const changes = await this.gitService.diff({ dir, ref });
    
    console.log(dag.sort());
    console.log(changes);
  }
}
