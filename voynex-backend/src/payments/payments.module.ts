import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './payment.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), BookingsModule, EmailModule, NotificationsModule,],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}