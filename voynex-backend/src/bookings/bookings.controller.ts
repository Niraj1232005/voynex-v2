import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    console.log('booking organizationId:', organizationId);
    console.log('booking userId:', userId);
    return this.bookingsService.create(organizationId, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: any,
  ) {
    if (user.role === 'user') {
      return this.bookingsService.findByUser(user.sub);
    }
    return this.bookingsService.findByOrganization(user.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.findOneById(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.cancel(id, user);
  }
}