import { Injectable } from '@nestjs/common';

export interface ConfigParams {
  manifestGlob: string;
  ref: string;
  rootDir: string;
}

@Injectable()
export class ConfigService {
  constructor(private params: ConfigParams) {}

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
