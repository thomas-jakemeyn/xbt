import { Injectable } from '@nestjs/common';

export interface ConfigParams {
  cmd: string;
  manifestGlob: string;
  ref: string;
  rootDir: string;
}

@Injectable()
export class ConfigService {
  constructor(private params: ConfigParams) {}

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
