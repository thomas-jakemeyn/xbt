import * as _ from 'lodash';
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
    const gitRoots = await this.gitService.getRoots({ items: Object.values(manifests) });
    const changesByGitRoot = await Promise.all(gitRoots.map(gitRoot => this.gitService.diff({ dir: gitRoot, ref })));
    const changes = _.flatten(changesByGitRoot);

    console.log(gitRoots);
    console.log(dag.sort());
    console.log(changes);
  }
}
