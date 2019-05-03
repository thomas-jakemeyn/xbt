import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NodeService {

  get fs() {
    return fs;
  }

  get path() {
    return path;
  }
}
