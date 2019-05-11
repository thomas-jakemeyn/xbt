import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { DepsService } from './deps.service';
import { NodeService } from './node.service';

@Injectable()
export class TemplateService {
  constructor(
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
