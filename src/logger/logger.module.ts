import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Logger } from './logger.service';
import { DepsService } from 'src/adapter/deps.service';

@Module({})
export class LoggerModule {

  static forFeature(namespace: string): DynamicModule {
    const providers = LoggerModule.createProviders(namespace);
    return {
      module: LoggerModule,
      providers,
      exports: providers,
    };
  }

  private static createProviders(namespace: string): Provider[] {
    return [
      this.createLoggerProvider(namespace),
    ];
  }

  private static createLoggerProvider(namespace: string): Provider {
    return {
      provide: Logger,
      useFactory: (deps: DepsService) => new Logger(deps, namespace),
      inject: [DepsService],
    };
  }
}
