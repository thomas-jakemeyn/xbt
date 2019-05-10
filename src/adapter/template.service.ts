import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { NodeService } from './node.service';
import { DepsService } from './deps.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TemplateService {
  constructor(
    private config: ConfigService,
    private deps: DepsService,
    private node: NodeService) {}

  async compilePath(args: { templatePath: string; data: any }): Promise<string> {
    const template = await this.read({ path: args.templatePath });
    return this.compileTemplate({ template, ...args });
  }

  async compileTemplate(args: { template: string; data: any }): Promise<string> {
    const template = this.deps.handlebars().compile(args.template);
    return template(args.data);
  }

  private async read(args: { path: string }) {
    const readFile = promisify(this.node.fs().readFile);
    const template = (await readFile(args.path)).toString();
    return template;
  }
}
