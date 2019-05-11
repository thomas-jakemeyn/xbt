import { DynamicModule, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigParams } from './config/config.service';
import { GlobalModule } from './global.module';
import { LoggerModule } from './logger/logger.module';
import { ManifestModule } from './manifest/manifest.module';

@Module({
  imports: [
    LoggerModule.forFeature(),
    ManifestModule,
  ],
  providers: [AppService],
})
export class AppModule {
  static forRoot(params: ConfigParams): DynamicModule {
    return {
      module: AppModule,
      imports: [GlobalModule.forRoot(params)],
    };
  }
}
