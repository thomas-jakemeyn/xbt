import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as git from 'isomorphic-git';

@Injectable()
export class GitService {
  constructor() {
    git.plugins.set('fs', fs);
  }

  async diff(args: { dir: string; ref: string }): Promise<string[]> {
    const dir = '.';  // FIXME: get `dir` from `args`
    const { ref } = args;
    const refCommit = await git.resolveRef({ dir, ref });
    const headCommit = await git.resolveRef({ dir, ref: 'HEAD' });
    let currentCommit = headCommit;
    while (currentCommit
      && !(await this.isPath({ dir, ancestor: currentCommit, descendent: refCommit}))) {
      currentCommit = await this.getPreviousCommit({ dir, commit: currentCommit });
    }
    const startCommit = currentCommit;

    if (!startCommit) {
      throw new Error(`HEAD and ${ref} have no ancestor in common!`);
    }
    if (startCommit === headCommit) {
      // No change detected
      return [];
    }

    // Include all changes starting from startCommit
    const gitdir = `${dir}/.git`;
    const trees = [
      git.TREE({ fs, gitdir, ref: startCommit }),
      git.TREE({ fs, gitdir, ref: headCommit }),
    ];
    const map = async ([start, head]: git.WalkerEntry): Promise<string> => {
      if (start.exists !== head.exists) {
        return head.fullpath;
      }
      await start.populateHash();
      await head.populateHash();
      if (start.oid !== head.oid) {
        return head.fullpath;
      }
    };
    return git.walkBeta1<string, string[]>({ trees, map });
  }

  private async isPath(args: {
    dir: string;
    ancestor: string;
    descendent: string;
  }): Promise<boolean> {
    return args.ancestor === args.descendent || git.isDescendent({
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
    const commits = await git.log({ dir: args.dir, depth: 2, ref: args.commit });
    return commits.length < 2 ? null : commits[1].oid;
  }
}
