import { Injectable } from '@nestjs/common';
import { NodeService } from 'src/adapter/node.service';

export interface ConfigParams {
  cmd: string[];
  manifestGlob: string;
  templatePath: string;
  ref: string;
  rootDir: string;
  verbose: boolean;
}

@Injectable()
export class ConfigService {
  private params: ConfigParams;

  constructor(params: ConfigParams) {
      this.params = Object.freeze(params);
    }

  get templatePath(): string {
    return this.params.templatePath;
  }

  get cmd(): string[] {
    return this.params.cmd;
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

  get verbose() {
    return this.params.verbose;
  }

  raw() {
    return this.params;
  }
}
