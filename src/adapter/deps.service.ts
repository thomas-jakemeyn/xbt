import { Injectable } from '@nestjs/common';
import { DGraph } from '@thi.ng/dgraph';
import * as debug from 'debug';
import * as glob from 'glob';
import * as git from 'isomorphic-git';
import * as lodash from 'lodash';
import * as emoji from 'node-emoji';
import * as yaml from 'yaml';

@Injectable()
export class DepsService {

  debug(namespace: string) {
    return debug(namespace);
  }

  emoji() {
    return emoji;
  }

  git() {
    return git;
  }

  glob() {
    return glob;
  }

  lodash() {
    return lodash;
  }

  newDGraph<T>() {
    return new DGraph<T>();
  }

  yaml() {
    return yaml;
  }
}
