import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Trip } from '../trips/trip.entity';
import { Booking } from '../bookings/booking.entity';
import { Payment } from '../payments/payment.entity';
import { Organization } from '../organizations/organization.entity';
import { Review } from '../reviews/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trip, Booking, Payment, Organization, Review])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}