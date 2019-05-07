import { Injectable } from '@nestjs/common';
import { DepsService } from 'src/adapter/deps.service';

type LogMethod = (formatter: any, ...args: any[]) => void;

@Injectable()
export class Logger {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;

  constructor(deps: DepsService, namespace: string) {
    this.debug = Logger.createLogMethod(deps, `${namespace}:debug`);
    this.info = Logger.createLogMethod(deps, `${namespace}:info`);
    this.warn = Logger.createLogMethod(deps, `${namespace}:warn`);
    this.error = Logger.createLogMethod(deps, `${namespace}:error`);
  }

  static createLogMethod(deps: DepsService, namespace: string): LogMethod {
    const emojify = (str: any) => typeof str === 'string' ? deps.emoji().emojify(str) : str;
    const log = deps.debug(`${namespace}`);
    return (formatter: any, ...args: any[]) => log(emojify(formatter), ...args.map(emojify));
  }
}
