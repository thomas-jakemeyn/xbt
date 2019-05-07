import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { DepsService } from './deps.service';

@Injectable()
export class GlobService {
  private glob;

  constructor(deps: DepsService) {
    this.glob = deps.glob();
  }

  async find(args: {
    pattern: string,
    rootDir: string,
  }): Promise<string[]> {
    return await promisify(this.glob)(args.pattern, {
      cwd: args.rootDir,
      realpath: true,
    });
  }
}
