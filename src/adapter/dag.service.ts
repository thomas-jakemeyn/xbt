import { Injectable } from '@nestjs/common';
import { DepsService } from './deps.service';
import { DGraph } from '@thi.ng/dgraph';

@Injectable()
export class DagService {
  constructor(private deps: DepsService) {}

  newDag<T>(nodes?: Array<T & WithDeps<string>> | {[index: string]: T & WithDeps<string>}): Dag<T> {
    const dag = new DagAdapter<T>(this.deps.newDGraph);
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
  getDependents(node: T): T[];
  sort(): T[];
}

class DagAdapter<T> implements Dag<T> {
  private dag: DGraph<T>;

  constructor(newDGraph: <U>() => DGraph<U>) {
    this.dag = newDGraph<T>();
  }

  addNode(node: T, dep?: T) {
    if (dep) {
      this.dag.addDependency(node, dep);
    } else {
      this.dag.addNode(node);
    }
  }

  getDependents(node: T): T[] {
    return [
      ...this.dag.transitiveDependents(node),
    ];
  }

  sort(): T[] {
    return this.dag.sort();
  }
}
