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

export interface Command {
  key: string;
  args: string[];
}

@Injectable()
export class ConfigService {
  private params: ConfigParams;

  constructor(params: ConfigParams) {
      this.params = Object.freeze(params);
    }

  get cmd(): Command[] {
    return this.params.cmd
      .join(' ')
      .split('&&')
      .map(cmd => cmd.trim())
      .filter(cmd => !!cmd)
      .map(cmd => {
        const parts = cmd
          .split(' ')
          .map(part => part.trim())
          .filter(part => !!part);
        return {
          key: parts[0],
          args: parts.slice(1),
        } as Command;
      });
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
