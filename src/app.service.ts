import { Injectable } from '@nestjs/common';
import { DagService } from './adapter/dag.service';
import { GitService } from './adapter/git.service';
import { ConfigService } from './config/config.service';
import { ManifestService, Manifest } from './manifest/manifest.service';
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
    const manifests = await this.getManifests();
    const gitRoots = await this.getGitRoots(manifests);
    const changes = await this.getChanges(ref, gitRoots);
    this.attachChangesToManifests(changes, manifests);
    const topology = this.getTopology(manifests);
    const commands = this.getCommands(topology);
  }

  async getManifests(): Promise<{[index: string]: Manifest}> {
    this.logger.h1('Listing components...');
    const manifests = await this.manifestService.getManifests();
    const manifestNames = Object.keys(manifests);
    const manifestsArray = Object.values(manifests);
    this.logger.info('Found %o component(s): %O', manifestNames.length, manifestsArray.map(manifest => manifest.dir));
    this.logger.debug('Manifests: %O', manifestsArray);
    return manifests;
  }

  async getGitRoots(manifests: {[index: string]: Manifest}): Promise<string[]> {
    this.logger.h1('Searching for git root directories...');
    const gitRoots = await this.gitService.getRoots({
      items: Object.values(manifests),
    });
    this.logger.info('Found %o git root(s): %O', gitRoots.length, gitRoots);
    return gitRoots;
  }

  async getChanges(ref, gitRoots: string[]): Promise<string[]> {
    this.logger.h1(`Analyzing differences with ${ref}...`);
    const changesByGitRoot = await Promise.all(
      gitRoots.map(gitRoot => this.gitService.diff({ dir: gitRoot, ref })),
    );
    const changes = this.lodash.flatten(changesByGitRoot);
    this.logger.info('Found %o file change(s): %O', changes.length, changes);
    return changes;
  }

  async attachChangesToManifests(changes: string[], manifests: {[index: string]: Manifest}) {
    this.logger.h1('Linking differences to components...');
    changes.forEach(change => {
      const manifest = this.pathService.findClosest({ path: change, candidates: manifests });
      manifest.changes.push(change);
    });
    this.logger.info('Done');
    this.logger.debug('Manifests: %O', Object.values(manifests));
  }

  getTopology(manifests: {[index: string]: Manifest}): Manifest[] {
    this.logger.h1('Analyzing topology...');
    const dag = this.dagService.newDag(manifests);
    Object.values(manifests).forEach(manifest => {
      if (manifest.changes.length > 0) {
        manifest.dirty = true;
        dag.getDependents(manifest).forEach(dependent => dependent.dirty = true);
      }
    });
    const sorted = dag.sort();
    const topology = sorted.filter(manifest => manifest.dirty);
    this.logger.info('Identified %o dirty components: %O',
      topology.length, topology.map(manifest => manifest.name));
    this.logger.debug('Topological order: %O', sorted);
    return topology;
  }

  getCommands(topology: Manifest[]): string[] {
    this.logger.h1('Building commands...');
    const cmdPaths = this.config.cmd.map(cmd => `cmd.${cmd}`);
    const script = topology
      .map(manifest => {
        const commands = this.lodash
          .at(manifest, cmdPaths)
          .filter(cmd => !!cmd);
        return commands.length > 0 ? `(cd ${manifest.dir} && ${commands.join(' && ')})` : null;
      })
      .filter(cmd => !!cmd);
    this.logger.info('Commands: %O', script);
    return script;
  }
}
