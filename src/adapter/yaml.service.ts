import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { DepsService } from './deps.service';
import { NodeService } from './node.service';

@Injectable()
export class YamlService {
  private yaml;

  constructor(
    deps: DepsService,
    private node: NodeService) {
      this.yaml = deps.yaml();
    }

  async parse<T>(paths: string[]): Promise<{ [index: string]: T[] }> {
    const readFile = promisify(this.node.fs().readFile);
    const readFilePromises = paths.map(path => readFile(path));
    const contents = await Promise.all(readFilePromises);
    const parsed = contents.map(content => this.yaml.parseAllDocuments(content.toString()));
    return parsed.reduce((acc, docs, i) => {
      return { ...acc, [paths[i]]: docs.map(doc => doc.toJSON()) };
    }, {});
  }
}
