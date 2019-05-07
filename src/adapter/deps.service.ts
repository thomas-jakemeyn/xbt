import { Injectable } from '@nestjs/common';
import { DGraph } from '@thi.ng/dgraph';
import * as glob from 'glob';
import * as git from 'isomorphic-git';
import * as yaml from 'yaml';

@Injectable()
export class DepsService {

  git() {
    return git;
  }

  glob() {
    return glob;
  }

  newDGraph<T>() {
    return new DGraph<T>();
  }

  yaml() {
    return yaml;
  }
}
