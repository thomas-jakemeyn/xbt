import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService, ConfigParams } from './config.service';

@Module({})
export class ConfigModule {

  static forRoot(params: ConfigParams): DynamicModule {
    const providers = ConfigModule.createProviders(params);
    return {
      module: ConfigModule,
      providers,
      exports: providers,
    };
  }

  private static createProviders(params: ConfigParams): Provider[] {
    return [
      ConfigModule.createConfigServiceProvider(params),
    ];
  }

  private static createConfigServiceProvider(params: ConfigParams): Provider<ConfigService> {
    return {
      provide: ConfigService,
      useFactory: () => new ConfigService(params),
    };
  }
}
