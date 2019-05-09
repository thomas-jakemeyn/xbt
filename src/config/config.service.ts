import { Injectable } from '@nestjs/common';
import { NodeService } from 'src/adapter/node.service';

export interface ConfigParams {
  cmd: string;
  manifestGlob: string;
  ref: string;
  rootDir: string;
}

@Injectable()
export class ConfigService {
  constructor(
    private node: NodeService,
    private params: ConfigParams) {}

  get defaultTemplatePath(): string {
    const path = this.node.path();
    return path.normalize(path.join(__dirname, '..', 'assets', 'template.sh'));
  }

  get cmd(): string[] {
    return this.params.cmd
      .split('&&')
      .filter(cmd => !!cmd)
      .map(cmd => cmd.trim());
  }

  get manifestGlob() {
    return this.params.manifestGlob;
  }

  get ref() {
    return this.params.ref;
  }

  get rootDir() {
    return this.params.rootDir;
  }
}
