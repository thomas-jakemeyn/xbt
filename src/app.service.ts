import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
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
    const { ref } = this.config;

    const manifests = await this.manifestService.getManifests();
    console.log('\nMANIFESTS');
    console.log(manifests);

    const dag = this.dagService.newDag(manifests);
    console.log('\nDAG');
    console.log(dag.sort());

    const gitRoots = await this.gitService.getRoots({ items: Object.values(manifests) });
    console.log('\nGIT ROOTS');
    console.log(gitRoots);

    const changesByGitRoot = await Promise.all(gitRoots.map(gitRoot => this.gitService.diff({ dir: gitRoot, ref })));
    const changes = _.flatten(changesByGitRoot);
    console.log('\nCHANGES');
    console.log(changes);
  }
}
