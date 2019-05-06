import { Injectable } from '@nestjs/common';
import { GlobService } from 'src/adapter/glob.service';
import { YamlService } from 'src/adapter/yaml.service';
import { ConfigService } from 'src/config/config.service';
import { NodeService } from 'src/adapter/node.service';
import { PathService } from 'src/util/path.service';

@Injectable()
export class ManifestService {
  constructor(
    private config: ConfigService,
    private glob: GlobService,
    private node: NodeService,
    private path: PathService,
    private yaml: YamlService,
  ) {}

  async getManifests(): Promise<{[index: string]: Manifest}> {
    const { manifestGlob: pattern, rootDir } = this.config;
    const manifestPaths = await this.glob.find({ pattern, rootDir });
    const manifestsByPath = await this.yaml.parse<Manifest>(manifestPaths);
    return Object.keys(manifestsByPath).reduce((output, path) => {
      manifestsByPath[path]
        .map(manifest => {
          return {
            ...manifest,
            dir: this.getManifestDir({ manifest, path }),
            changes: [],
          };
        })
        .forEach(manifest => {
          output[manifest.name] = manifest;
        });
      return output;
    }, {});
  }

  findManifest(args: { path: string; manifests: Manifest[]; }): Manifest {
    if (args.manifests.length <= 0) {
      return null;
    }
    return args.manifests.sort((a, b) => {
      const distanceA = this.path.distance({
        path1: args.path,
        path2: a.dir,
      });
      const distanceB = this.path.distance({
        path1: args.path,
        path2: b.dir,
      });
      return distanceA - distanceB;
    })[0];
  }

  private getManifestDir(args: { manifest: Manifest, path: string }): string {
    const dir = this.node.path.dirname(args.path);
    if (!args.manifest.dir) {
      return dir;
    }
    if (this.node.path.isAbsolute(args.manifest.dir)) {
      return args.manifest.dir;
    }
    const join = this.node.path.join(dir, args.manifest.dir);
    return this.node.path.resolve(join);
  }
}

export interface Manifest {
  name: string;
  deps?: string[];
  dir: string;
  changes: string[];
}
