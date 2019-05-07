import { Injectable } from '@nestjs/common';
import { DagService } from './adapter/dag.service';
import { GitService } from './adapter/git.service';
import { ConfigService } from './config/config.service';
import { ManifestService } from './manifest/manifest.service';
import { PathService } from './util/path.service';
import { DepsService } from './adapter/deps.service';

@Injectable()
export class AppService {
  private lodash;

  constructor(
    private config: ConfigService,
    private dagService: DagService,
    depsService: DepsService,
    private gitService: GitService,
    private manifestService: ManifestService,
    private pathService: PathService) {
      this.lodash = depsService.lodash();
    }

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
    const changes = this.lodash.flatten(changesByGitRoot);
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
    const topology = dag.sort();
    console.log('\nTOPOLOGY');
    console.log(topology);

    const cmdPaths = this.config.cmd.map(cmd => `cmd.${cmd}`);
    const script = topology
      .filter(manifest => manifest.dirty)
      .map(manifest => {
        const commands = this.lodash
          .at(manifest, cmdPaths)
          .filter(cmd => !!cmd);
        return `(cd ${manifest.dir} && ${commands.join(' && ')})`;
      })
      .join(' \\\n&& ');
    console.log('\nSCRIPT');
    console.log(script);
  }
}
