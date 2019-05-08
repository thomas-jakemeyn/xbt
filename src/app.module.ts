import { DynamicModule, Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { AppService } from './app.service';
import { ManifestModule } from './manifest/manifest.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    LoggerModule.forFeature(),
    ManifestModule,
  ],
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
