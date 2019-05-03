import * as glob from 'glob';
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';

@Injectable()
export class GlobService {

  async find(params: FindParams): Promise<string[]> {
    return await promisify(glob)(params.pattern, {
      cwd: params.workDir,
      realpath: true,
    });
  }
}

export interface FindParams {
  pattern: string;
  workDir: string;
}
