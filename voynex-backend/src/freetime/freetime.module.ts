import { Module } from '@nestjs/common';
import { FreetimeController } from './freetime.controller';
import { FreetimeService } from './freetime.service';

@Module({
  controllers: [FreetimeController],
  providers: [FreetimeService],
  exports: [FreetimeService],
})
export class FreetimeModule {}
