import { Injectable } from '@nestjs/common';

export interface ConfigParams {
  cmd: string[];
  includeAll: boolean;
  manifestGlob: string;
  outputPath: string;
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

  get cmd(): string[] {
    return this.params.cmd;
  }

  get includeAll(): boolean {
    return this.params.includeAll;
  }

  get manifestGlob() {
    return this.params.manifestGlob;
  }

  get outputPath() {
    return this.params.outputPath;
  }

  get ref() {
    return this.params.ref;
  }

  get rootDir() {
    return this.params.rootDir;
  }

  get templatePath(): string {
    return this.params.templatePath;
  }

  get verbose() {
    return this.params.verbose;
  }

  raw() {
    return this.params;
  }
}
