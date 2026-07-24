import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SavedPlan } from './saved-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedPlan])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}