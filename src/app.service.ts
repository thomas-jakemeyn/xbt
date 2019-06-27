import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { DagService } from './adapter/dag.service';
import { DepsService } from './adapter/deps.service';
import { GitService } from './adapter/git.service';
import { NodeService } from './adapter/node.service';
import { TemplateService } from './adapter/template.service';
import { ConfigService } from './config/config.service';
import { Logger } from './logger/logger.service';
import { Manifest, ManifestService } from './manifest/manifest.service';
import { PathService } from './util/path.service';

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
    private node: NodeService,
    private pathService: PathService,
    private templateService: TemplateService) {
      this.lodash = depsService.lodash();
    }

  async run(): Promise<string> {
    this.logger.h1('Initializing tool...');
    this.logger.info('Got the following configuration parameters: %O', this.config.raw());

    const { ref } = this.config;
    const manifests = await this.getManifests();
    const gitRoots = await this.getGitRoots(manifests);
    const changes = await this.getChanges(ref, gitRoots);
    this.attachChangesToManifests(changes, manifests);
    const topology = this.getTopology(manifests);
    const commands = this.getCommands(topology);
    const output = await this.getOutput({
      commands,
      config: this.config.raw(),
      gitRoots,
      manifests,
      topology,
    });
    await this.writeOutput(output);
    return output;
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
    const topology = sorted.filter(manifest => this.config.includeAll || manifest.dirty);
    this.logger.info('Included %o components: %O',
      topology.length, topology.map(manifest => manifest.name));
    this.logger.debug('Topological order: %O', sorted);
    return topology;
  }

  getCommands(topology: Manifest[]): CommandLine[] {
    this.logger.h1('Building commands...');
    const cmdPaths = this.config.cmd.map(cmd => `cmd.${cmd.key}`);
    const commands = this.lodash.flatten(topology.map(manifest => this.lodash
        .at(manifest, cmdPaths)
        .map((cmd, i) => cmd ? {
          dir: manifest.dir,
          cmd: [cmd, ...this.config.cmd[i].args].join(' '),
        } as CommandLine : null)
        .filter(cmd => !!cmd)));
    this.logger.info('Done');
    this.logger.debug('Commands: %O', commands);
    return commands;
  }

  async getOutput(data: TemplateData): Promise<string> {
    this.logger.h1('Compiling output...');
    const output = await this.templateService.compilePath({ templatePath: this.config.templatePath, data });
    this.logger.info('Done');
    return output;
  }

  async writeOutput(output: string): Promise<void> {
    this.logger.h1('Writing output...');
    const outputPath = this.config.outputPath;
    if (!outputPath || this.config.verbose) {
      this.logger.info('{yellow.italic %s}', `\n\n${output}\n\n`);
    }
    if (outputPath) {
      const writeFile = promisify(this.node.fs().writeFile);
      await writeFile(outputPath, output);
      this.logger.info('Done');
    }
  }
}

export interface CommandLine {
  // TODO: cmd: string[]
  cmd: string;
  dir: string;
}

export interface TemplateData {
  commands: CommandLine[];
  config: any;
  gitRoots: string[];
  manifests: {[index: string]: Manifest};
  topology: Manifest[];
}
