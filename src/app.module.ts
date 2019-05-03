import { DynamicModule, Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { AppService } from './app.service';

@Module({
  providers: [AppService],
})
export class AppModule {
  static forRoot(params): DynamicModule {
    return {
      module: AppModule,
      imports: [GlobalModule.forRoot(params)],
    };
  }
}
