import { DynamicModule, Global, Module } from '@nestjs/common';
import { AdapterModule } from './adapter/adapter.module';
import { ConfigModule } from './config/config.module';
import { UtilModule } from './util/util.module';

@Global()
@Module({
  imports: [AdapterModule, UtilModule],
  exports: [AdapterModule, UtilModule],
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
