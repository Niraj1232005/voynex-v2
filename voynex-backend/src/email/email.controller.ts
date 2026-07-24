import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { bookingConfirmationTemplate } from './templates/booking-confirmation.template';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test-booking')
  async sendTestBookingEmail(@Body() body: { to: string }) {
    return this.emailService.sendEmail(
      body.to,
      'Voynex Booking Confirmation',
      bookingConfirmationTemplate({
        userName: 'Test User',
        tripTitle: 'Goa Beach Escape',
        bookingId: 'BOOK-12345',
        travelDate: '2026-08-10',
      }),
    );
  }
}