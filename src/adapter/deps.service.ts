import { Injectable } from '@nestjs/common';
import { DGraph } from '@thi.ng/dgraph';
import chalk from 'chalk';
import * as debug from 'debug';
import * as glob from 'glob';
import * as git from 'isomorphic-git';
import * as lodash from 'lodash';
import * as emoji from 'node-emoji';
import * as yaml from 'yaml';

@Injectable()
export class DepsService {

  chalk() {
    return chalk;
  }

  debug() {
    return debug;
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
