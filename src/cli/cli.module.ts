import { Module } from '@nestjs/common';
import { CliService } from './cli.service';
import { AdapterModule } from '../adapter/adapter.module';

@Module({
  imports: [AdapterModule],
  providers: [CliService],
  exports: [CliService],
})
export class CliModule {}
