import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AdapterModule } from './adapter/adapter.module';

@Global()
@Module({
  imports: [AdapterModule],
  exports: [AdapterModule],
})
export class GlobalModule {
  static forRoot(params): DynamicModule {
    const dynamicGlobals = [ConfigModule.forRoot(params)];
    return {
      module: GlobalModule,
      imports: dynamicGlobals,
      exports: dynamicGlobals,
    };
  }
}
