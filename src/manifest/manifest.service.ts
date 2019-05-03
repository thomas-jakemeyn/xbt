import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';

export interface Manifest {}

@Injectable()
export class ManifestService {
  constructor(private config: ConfigService) {}

  getManifests(): Manifest[] {
    console.log(`Looking for ${this.config.manifestGlob}...`);
    return [];
  }
}
