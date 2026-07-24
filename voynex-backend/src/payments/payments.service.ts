import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Payment } from './payment.entity';
import { BookingsService } from '../bookings/bookings.service';
import { EmailService } from '../email/email.service';
import { paymentReceiptTemplate } from '../email/templates/payment-receipt.template';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private bookingsService: BookingsService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(user: any, bookingId: string) {
    const booking = await this.bookingsService.findOneById(bookingId, user);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const amountInPaise = Math.round(Number(booking.totalPrice) * 100);

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bk_${booking.id.slice(0, 32)}`,
    });

    const payment = this.paymentsRepository.create({
      bookingId: booking.id,
      organizationId: booking.organizationId,
      razorpayOrderId: order.id,
      amount: booking.totalPrice,
      currency: 'INR',
      status: 'pending',
    });

    await this.paymentsRepository.save(payment);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking.id,
    };
  }

  async verifyPayment(
    user: any,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    const payment = await this.paymentsRepository.findOne({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found');
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'paid';

    await this.paymentsRepository.save(payment);

    const booking = await this.bookingsService.findOneById(payment.bookingId, user);

    await this.bookingsService.updateStatus(booking.id, 'confirmed', 'paid');

    try {
      await this.emailService.sendEmail(
        'rathodniraj.com@gmail.com',
        'Voynex Payment Receipt',
        paymentReceiptTemplate({
          userName: 'Niraj',
          tripTitle: booking.trip?.title || 'Your Trip Booking',
          amount: Number(payment.amount),
          paymentId: razorpay_payment_id,
        }),
      );
    } catch (e) {
      console.error('Receipt email send failed:', e);
    }

    try {
      await this.notificationsService.create({
        userId: booking.user,
        organizationId: booking.organizationId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment received successfully for booking ${booking.id}.`,
      });
    } catch (e) {
      console.error('Payment notification creation failed:', e);
    }

    return {
      message: 'Payment verified successfully',
      payment,
    };
  }

  async handleWebhook(signature: string, rawBody: string) {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    return { message: 'Webhook verified' };
  }

  async history(user: any) {
    if (user.role === 'platform_admin') {
      return this.paymentsRepository.find({
        order: { createdAt: 'DESC' },
      });
    } else if (user.role === 'user') {
      // Normal traveler: query payments linked to their bookings
      const bookings = await this.bookingsService.findByUser(user.sub);
      const bookingIds = bookings.map(b => b.id);
      if (bookingIds.length === 0) return [];
      
      return this.paymentsRepository.createQueryBuilder('payment')
        .where('payment.bookingId IN (:...bookingIds)', { bookingIds })
        .orderBy('payment.createdAt', 'DESC')
        .getMany();
    } else {
      // Travel Agency admin or staff: query payments for their organization
      return this.paymentsRepository.find({
        where: { organizationId: user.organizationId },
        order: { createdAt: 'DESC' },
      });
    }
  }
}