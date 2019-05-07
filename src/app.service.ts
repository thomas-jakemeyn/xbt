import { Injectable } from '@nestjs/common';
import { DagService } from './adapter/dag.service';
import { GitService } from './adapter/git.service';
import { ConfigService } from './config/config.service';
import { ManifestService } from './manifest/manifest.service';
import { PathService } from './util/path.service';
import { DepsService } from './adapter/deps.service';
import { Logger } from './logger/logger.service';

@Injectable()
export class AppService {
  private lodash;

  constructor(
    private config: ConfigService,
    private dagService: DagService,
    depsService: DepsService,
    private gitService: GitService,
    private logger: Logger,
    private manifestService: ManifestService,
    private pathService: PathService) {
      this.lodash = depsService.lodash();
    }

  async run() {
    const { ref } = this.config;

    const manifests = await this.manifestService.getManifests();
    this.logger.info(':books: MANIFESTS');
    this.logger.info('%O', manifests);

    const gitRoots = await this.gitService.getRoots({
      items: Object.values(manifests),
    });
    this.logger.info('========== %o', 'GIT ROOTS');
    this.logger.info('%O', gitRoots);

    const changesByGitRoot = await Promise.all(
      gitRoots.map(gitRoot => this.gitService.diff({ dir: gitRoot, ref })),
    );
    const changes = this.lodash.flatten(changesByGitRoot);
    this.logger.info('========== %o', 'CHANGES');
    this.logger.info('%O', changes);

    changes.forEach(change => {
      const manifest = this.pathService.findClosest({ path: change, candidates: manifests });
      manifest.changes.push(change);
    });
    this.logger.info('========== %o', 'MANIFEST WITH CHANGES');
    this.logger.info('%O', manifests);

    const dag = this.dagService.newDag(manifests);
    Object.values(manifests).forEach(manifest => {
      if (manifest.changes.length > 0) {
        manifest.dirty = true;
        dag.getDependents(manifest).forEach(dependent => dependent.dirty = true);
      }
    });
    const topology = dag.sort();
    this.logger.info('========== %o', 'TOPOLOGY');
    this.logger.info('%O', topology);

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
    this.logger.info('========== %o', 'SCRIPT');
    this.logger.info('%O', script);
  }
}
