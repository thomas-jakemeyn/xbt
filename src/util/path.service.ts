import { Injectable } from '@nestjs/common';
import { NodeService } from '../adapter/node.service';

@Injectable()
export class PathService {
  constructor(private node: NodeService) {}

  findClosest<T>(args: {
    path: string;
    candidates: Array<T & InDir> | {[index: string]: T & InDir};
  }): T {
    const candidates = Array.isArray(args.candidates) ? args.candidates : Object.values(args.candidates);
    const sorted = candidates.reduce((output: Array<T & InDir>, candidate: T & InDir) => {
      const distance = this.distance({ path1: args.path, path2: candidate.dir });
      if (distance) {
        output[distance] = candidate;
      }
      return output;
    }, []);
    return sorted.length <= 0 ? null : sorted.find(candidate => !!candidate);
  }

  distance(args: { path1: string; path2: string; }) {
    const { path1, path2 } = args;
    let ancestor: string = null;
    let descendent: string = null;
    if (path1 === path2) {
      return 0;
    }
    if (path1.startsWith(path2)) {
      ancestor = path2;
      descendent = path1;
    } else if (path2.startsWith(path1)) {
      ancestor = path1;
      descendent = path2;
    }
    if (!ancestor || !descendent) {
      return null;
    }
    const diff = descendent.substr(ancestor.length);
    const parts = diff.split(this.node.path().sep).filter(part => !!part);
    return parts.length;
  }
}

export interface InDir {
  dir: string;
}
