import { Injectable } from '@nestjs/common';

export interface ConfigParams {
  manifestGlob: string;
}

@Injectable()
export class ConfigService {
  constructor(private params: ConfigParams) {}

  get manifestGlob() {
    return this.params.manifestGlob;
  }
}
