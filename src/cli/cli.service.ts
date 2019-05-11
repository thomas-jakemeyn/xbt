import { Injectable } from '@nestjs/common';
import * as program from 'commander';
import { NodeService } from '../adapter/node.service';
import { ConfigParams } from '../config/config.service';
import pkg = require('../../package.json');

@Injectable()
export class CliService {
  constructor(private node: NodeService) {}

  parseParams(argv): ConfigParams {
    const parsed = program
      .version(pkg.version)
      .usage('[options] <command ...>')
      .option('-a, --all', 'Involve all the components, not only the dirty ones')
      .option('-g, --glob <pattern>', 'The glob pattern matching the manifest files', '**/.xbt.yml')
      .option('-o, --output <path>', 'The path to the output file to create (defaults to console log)')
      .option('-p, --path <template>', 'The path to the template file to compile (takes precedence over -t option)')
      .option('-r, --ref <ref>', 'The git reference to compare with', 'develop')
      .option('-t, --template <key>', 'The key of the pre-defined template to compile', /^(sh)$/i, 'sh')
      .option('-v, --verbose', 'A flag to enable debug logs')
      .parse(argv);

    const path = this.node.path();
    const templates = {
      sh: path.resolve(__dirname, '..', 'assets', 'template.sh'),
    };

    const params: ConfigParams = {
      cmd: parsed.args.length > 0 ? parsed.args : ['build'],
      includeAll: !!parsed.all,
      manifestGlob: parsed.glob,
      outputPath: parsed.output ? path.resolve(process.cwd(), parsed.output) : null,
      ref: parsed.ref,
      rootDir: process.cwd(),
      templatePath: parsed.path ? path.resolve(process.cwd(), parsed.path) : templates[parsed.template],
      verbose: !!parsed.verbose,
    };

    return params;
  }
}
