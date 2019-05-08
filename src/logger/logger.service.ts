import { Injectable } from '@nestjs/common';
import { DepsService } from 'src/adapter/deps.service';

type LogMethod = (formatter: any, ...args: any[]) => void;

@Injectable()
export class Logger {
  private readonly PREFIX = 'xbt';
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;

  constructor(private deps: DepsService, namespace?: string) {
    this.debug = this.createLogMethod(this.createNamespace(namespace, 'debug'));
    this.info = this.createLogMethod(this.createNamespace(namespace));
    this.warn = this.createLogMethod(this.createNamespace(namespace, 'warn'));
    this.error = this.createLogMethod(this.createNamespace(namespace, 'error'));
  }

  private createNamespace(...args: string[]): string {
    return [this.PREFIX, ...args]
      .filter(arg => !!arg)
      .join(':');
  }

  private createLogMethod(namespace: string): LogMethod {
    const debug = this.deps.debug();
    const log: LogMethod = debug(`${namespace}`);
    const decorator: LogMethod = (template: any, ...args: any[]) => {
      template = this.prettify(template);
      args = args.map(arg => this.prettify(arg));
      return log(template, ...args);
    };
    return decorator;
  }

  private prettify(arg: any) {
    if (typeof arg !== 'string') {
      return arg;
    }
    return this.chalk `${this.deps.emoji().emojify(arg)}`;
  }

  // See https://www.bennadel.com/blog/3295-using-chalk-2-0-s-tagged-template-literals-for-nested-and-complex-styling.htm
  private chalk(text: TemplateStringsArray, ...placeholders: string[]): string {
    const rawResults = [];
    const cookedResults = [];
    for (let i = 0 ; i < text.length ; i++) {
      rawResults.push(text.raw[i]);
      cookedResults.push(text[i] );
      if (i < placeholders.length) {
        rawResults.push(placeholders[i]);
        cookedResults.push(placeholders[i]);
      }
    }
    const chalkParts: any = [cookedResults.join('')];
    chalkParts.raw = [rawResults.join('')];
    return this.deps.chalk()(chalkParts);
  }
}
