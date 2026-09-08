import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { PlanTripDto, CreateSavedPlanDto } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('plan-trip')
  planTrip(@Body() planTripDto: PlanTripDto) {
    return this.aiService.planTrip(planTripDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('plans')
  savePlan(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSavedPlanDto,
  ) {
    return this.aiService.savePlan(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans')
  findUserPlans(@CurrentUser('sub') userId: string) {
    return this.aiService.findUserPlans(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('plans/:id')
  removePlan(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.aiService.removePlan(userId, id);
  }
}