import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { NodeService } from './node.service';
import { DepsService } from './deps.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class TemplateService {
  private DEFAULT_TEMPLATE: string;

  constructor(
    private config: ConfigService,
    private deps: DepsService,
    private node: NodeService) {}

  async compilePath(args: { templatePath: string; data: any }): Promise<string> {
    const template = await this.read({ path: args.templatePath });
    return this.compileTemplate({ template, ...args });
  }

  async compileDefault(args: { data: any }): Promise<string> {
    if (!this.DEFAULT_TEMPLATE) {
      this.DEFAULT_TEMPLATE = await this.read({ path: this.config.defaultTemplatePath });
    }
    return this.compileTemplate({ template: this.DEFAULT_TEMPLATE, ...args });
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
