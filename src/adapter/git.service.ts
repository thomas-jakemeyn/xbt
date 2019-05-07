import { Injectable } from '@nestjs/common';
import { NodeService } from './node.service';
import { DepsService } from './deps.service';

@Injectable()
export class GitService {
  private git;

  constructor(
    deps: DepsService,
    private node: NodeService) {
    this.git = deps.git();
    this.git.plugins.set('fs', node.fs());
  }

  async getRoots(args: { items: InDir[] }) {
    const promises = Promise.all(args.items.map(item => this.git.findRoot({ filepath: item.dir })));
    return [...new Set(await promises)];
  }

  async diff(args: { dir: string; ref: string }): Promise<string[]> {
    const { dir, ref } = args;
    const refCommit = await this.git.resolveRef({ dir, ref });
    const headCommit = await this.git.resolveRef({ dir, ref: 'HEAD' });
    let currentCommit = headCommit;
    while (currentCommit
      && !(await this.isPath({ dir, ancestor: currentCommit, descendent: refCommit}))) {
      currentCommit = await this.getPreviousCommit({ dir, commit: currentCommit });
    }
    const startCommit = currentCommit;

    if (!startCommit) {
      throw new Error(`HEAD and ${ref} have no common ancestor!`);
    }

    const files = await this.git.statusMatrix({ dir, ref: currentCommit });
    const [PATH, ORIGINAL_STATUS, CURRENT_STATUS] = [0, 1, 2];
    return files
      .filter(file => file[ORIGINAL_STATUS] !== file[CURRENT_STATUS])
      .map(file => this.node.path().join(dir, file[PATH] as string));
  }

  private async isPath(args: {
    dir: string;
    ancestor: string;
    descendent: string;
  }): Promise<boolean> {
    return args.ancestor === args.descendent || this.git.isDescendent({
      dir: args.dir,
      ancestor: args.ancestor,
      oid: args.descendent,
      depth: '-1',
    });
  }

  private async getPreviousCommit(args: {
    dir: string;
    commit: string;
  }): Promise<string> {
    const commits = await this.git.log({ dir: args.dir, depth: 2, ref: args.commit });
    return commits.length < 2 ? null : commits[1].oid;
  }
}

export interface InDir {
  dir: string;
}
