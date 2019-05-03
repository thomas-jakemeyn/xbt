import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { GlobService } from 'src/adapter/glob.service';
import { YamlService } from 'src/adapter/yaml.service';

@Injectable()
export class ManifestService {
  constructor(
    private config: ConfigService,
    private glob: GlobService,
    private yaml: YamlService,
  ) {}

  async getManifests(): Promise<{[index: string]: Manifest}> {
    const { manifestGlob: pattern, rootDir } = this.config;
    const manifestPaths = await this.glob.find({ pattern, rootDir });
    const manifests = await this.yaml.parse<Manifest>(manifestPaths);
    return manifests.reduce((index, manifest, i) => {
      return { ...index, [manifest.name]: { dir: manifestPaths[i], ...manifest } };
    }, {});
  }
}

export interface Manifest {
  name: string;
  deps?: string[];
  dir: string;
}
