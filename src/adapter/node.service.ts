import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NodeService {

  fs() {
    return fs;
  }

  path() {
    return path;
  }
}
