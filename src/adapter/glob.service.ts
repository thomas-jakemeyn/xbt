import * as glob from 'glob';
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';

@Injectable()
export class GlobService {

  async find(args: {
    pattern: string,
    rootDir: string,
  }): Promise<string[]> {
    return await promisify(glob)(args.pattern, {
      cwd: args.rootDir,
      realpath: true,
    });
  }
}
