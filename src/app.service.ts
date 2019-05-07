import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { DagService } from './adapter/dag.service';
import { GitService } from './adapter/git.service';
import { ConfigService } from './config/config.service';
import { ManifestService } from './manifest/manifest.service';
import { PathService } from './util/path.service';

@Injectable()
export class AppService {
  constructor(
    private config: ConfigService,
    private dagService: DagService,
    private gitService: GitService,
    private manifestService: ManifestService,
    private pathService: PathService) {}

  async run() {
    const { ref } = this.config;

    const manifests = await this.manifestService.getManifests();
    console.log('\nMANIFESTS');
    console.log(manifests);

    const gitRoots = await this.gitService.getRoots({
      items: Object.values(manifests),
    });
    console.log('\nGIT ROOTS');
    console.log(gitRoots);

    const changesByGitRoot = await Promise.all(
      gitRoots.map(gitRoot => this.gitService.diff({ dir: gitRoot, ref })),
    );
    const changes = _.flatten(changesByGitRoot);
    console.log('\nCHANGES');
    console.log(changes);

    changes.forEach(change => {
      const manifest = this.pathService.findClosest({ path: change, candidates: manifests });
      manifest.changes.push(change);
    });
    console.log('\nMANIFEST WITH CHANGES');
    console.log(manifests);

    const dag = this.dagService.newDag(manifests);
    Object.values(manifests).forEach(manifest => {
      if (manifest.changes.length > 0) {
        manifest.dirty = true;
        dag.getDependents(manifest).forEach(dependent => dependent.dirty = true);
      }
    });
    console.log('\nDAG');
    console.log(dag.sort());
  }
}
