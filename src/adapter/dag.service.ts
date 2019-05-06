import { Injectable } from '@nestjs/common';
import { DGraph } from '@thi.ng/dgraph';

@Injectable()
export class DagService {

  newDag<T>(nodes?: Array<T & WithDeps<string>> | {[index: string]: T & WithDeps<string>}): Dag<T> {
    const dag = new DagAdapter<T>();
    if (nodes) {
      const nodesArray = Array.isArray(nodes) ? nodes : Object.values(nodes);
      nodesArray.forEach(node => {
        if (node.deps && node.deps.length > 0) {
          node.deps.forEach(dep => dag.addNode(node, nodes[dep]));
        } else {
          dag.addNode(node);
        }
      });
    }
    return dag;
  }
}

export interface WithDeps<T> {
  deps?: T[];
}

export interface Dag<T> {
  addNode(node: T, dep?: T);
  sort(): T[];
}

class DagAdapter<T> implements Dag<T> {
  private dag = new DGraph<T>();

  addNode(node: T, dep?: T) {
    if (dep) {
      this.dag.addDependency(node, dep);
    } else {
      this.dag.addNode(node);
    }
  }

  sort(): T[] {
    return this.dag.sort();
  }
}
