import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from './config.service';
import { NodeService } from 'src/adapter/node.service';

@Module({})
export class ConfigModule {

  static forRoot(params): DynamicModule {
    const providers = ConfigModule.createProviders(params);
    return {
      module: ConfigModule,
      providers,
      exports: providers,
    };
  }

  private static createProviders(params): Provider[] {
    return [
      ConfigModule.createConfigServiceProvider(params),
    ];
  }

  private static createConfigServiceProvider(params): Provider<ConfigService> {
    return {
      provide: ConfigService,
      useFactory: (node: NodeService) => new ConfigService(node, params),
      inject: [NodeService],
    };
  }
}
