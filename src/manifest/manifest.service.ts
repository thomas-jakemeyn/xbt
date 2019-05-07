import { Injectable } from '@nestjs/common';
import { GlobService } from 'src/adapter/glob.service';
import { NodeService } from 'src/adapter/node.service';
import { YamlService } from 'src/adapter/yaml.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ManifestService {
  constructor(
    private config: ConfigService,
    private glob: GlobService,
    private node: NodeService,
    private yaml: YamlService,
  ) {}

  async getManifests(): Promise<{[index: string]: Manifest}> {
    const { manifestGlob: pattern, rootDir } = this.config;
    const manifestPaths = await this.glob.find({ pattern, rootDir });
    const manifestsByPath = await this.yaml.parse<RawManifest>(manifestPaths);
    return Object.keys(manifestsByPath).reduce((output, path) => {
      manifestsByPath[path]
        .map(manifest => this.initManifest({ manifest, path }))
        .forEach(manifest => {
          output[manifest.name] = manifest;
        });
      return output;
    }, {});
  }

  private initManifest(args: { manifest: RawManifest; path: string; }): Manifest {
    return {
      ...args.manifest,
      dir: this.getManifestDir(args),
      changes: [],
      dirty: false,
    };
  }

  private getManifestDir(args: { manifest: RawManifest, path: string }): string {
    const dir = this.node.path().dirname(args.path);
    if (!args.manifest.dir) {
      return dir;
    }
    if (this.node.path().isAbsolute(args.manifest.dir)) {
      return args.manifest.dir;
    }
    const join = this.node.path().join(dir, args.manifest.dir);
    return this.node.path().resolve(join);
  }
}

interface RawManifest {
  name: string;
  deps?: string[];
  dir: string;
  cmd: { [index: string]: string };
}
export interface Manifest extends RawManifest {
  changes: string[];
  dirty: boolean;
}
