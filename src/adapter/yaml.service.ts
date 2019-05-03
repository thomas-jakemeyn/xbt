import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as yaml from 'yaml';

@Injectable()
export class YamlService {

  async parse<T>(paths: string[]): Promise<T[]> {
    const readFile = promisify(fs.readFile);
    const readFilePromises = paths.map(path => readFile(path));
    const documents = (await Promise.all(readFilePromises)).join('\n...\n');
    return yaml
      .parseAllDocuments(documents)
      .map(document => document.toJSON());
  }
}
