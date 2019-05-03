import { DynamicModule, Module } from '@nestjs/common';
import { GlobalModule } from './global.module';

@Module({})
export class AppModule {
  static forRoot(params): DynamicModule {
    return {
      module: AppModule,
      imports: [GlobalModule.forRoot(params)],
    };
  }
}
