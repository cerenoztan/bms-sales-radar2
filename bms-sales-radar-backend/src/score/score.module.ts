import { Module } from '@nestjs/common';
import { ScoreService } from './score.calculator';

@Module({
  providers: [ScoreService], // tells NestJS to create ScoreService object
  exports: [ScoreService],  // for other modules to use ScoreService
})
export class ScoreModule {}