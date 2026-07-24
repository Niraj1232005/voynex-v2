import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from './rental.entity';
import { Booking } from '../bookings/booking.entity';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rental, Booking])],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
