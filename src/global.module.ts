import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';

@Global()
@Module({})
export class GlobalModule {
  static forRoot(params): DynamicModule {
    const globals = [ConfigModule.forRoot(params)];
    return {
      module: GlobalModule,
      imports: globals,
      exports: globals,
    };
  }
}
