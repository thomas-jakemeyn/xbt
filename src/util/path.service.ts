import { Injectable } from '@nestjs/common';
import { NodeService } from 'src/adapter/node.service';

@Injectable()
export class PathService {
  constructor(private node: NodeService) {}

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
      descendent = path1;
    }
    if (!ancestor || !descendent) {
      return null;
    }
    const diff = descendent.substr(ancestor.length);
    const parts = diff.split(this.node.path.sep).filter(part => !!part);
    return parts.length;
  }
}
