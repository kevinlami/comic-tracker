import { Module } from '@nestjs/common';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingProgressController } from './reading-progress.controller';

@Module({
  providers: [ReadingProgressService],
  controllers: [ReadingProgressController],
})
export class ReadingProgressModule {}
