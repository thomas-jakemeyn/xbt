import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { DepsService } from '../adapter/deps.service';

type LogMethod = (template: any, ...args: any[]) => void;

enum LogLevel {
  DEBUG = 'xbt:debug',
  INFO = 'xbt',
  WARN = 'xbt:warn',
  ERROR = 'xbt:error',
}

@Injectable()
export class Logger {
  private readonly STYLES = {
    h1: 'yellow.bold.underline',
  };
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;

  constructor(private config: ConfigService, private deps: DepsService, namespace?: string) {
    this.debug = this.createLogMethod(LogLevel.DEBUG, namespace);
    this.info = this.createLogMethod(LogLevel.INFO, namespace);
    this.warn = this.createLogMethod(LogLevel.WARN, namespace);
    this.error = this.createLogMethod(LogLevel.ERROR, namespace);
  }

  h1(title: any) {
    this.info(`{${this.STYLES.h1} ${title}}`);
  }

  private createLogMethod(level: LogLevel, namespace: string): LogMethod {
    const debug = this.deps.debug();
    const fullyQualifiedNamespace = this.createNamespace(level, namespace);
    const log: debug.Debugger = debug(fullyQualifiedNamespace);
    const decorator: LogMethod = (template: any, ...args: any[]) => {
      if (log.enabled) {
        template = this.prettify(template);
        args = args.map(arg => this.prettify(arg));
        log(template, ...args);
      }
    };
    if (!process.env.DEBUG) {
      log.enabled = this.config.verbose || level !== LogLevel.DEBUG;
    }
    return decorator;
  }

  private createNamespace(...args: string[]): string {
    return args
      .filter(arg => !!arg)
      .join(':');
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
