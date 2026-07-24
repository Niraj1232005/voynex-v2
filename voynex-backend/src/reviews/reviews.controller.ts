import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    console.log('current userId in controller:', userId);
    return this.reviewsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Get('agency')
  findByAgency(@CurrentUser('organizationId') organizationId: string) {
    return this.reviewsService.findByAgency(organizationId);
  }

  @Get('trip/:tripId')
  findByTrip(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.reviewsService.findByTrip(tripId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'admin')
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.reviewsService.remove(id, userId, userRole);
  }
}