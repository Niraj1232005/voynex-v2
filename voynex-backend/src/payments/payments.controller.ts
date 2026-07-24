import { Body, Controller, Get, Headers, Post, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  createOrder(
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(user, dto.bookingId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(
    @CurrentUser() user: any,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(
      user,
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
  }

  @Post('webhook')
  webhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
  ) {
    return this.paymentsService.handleWebhook(signature, JSON.stringify(req.body));
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@CurrentUser() user: any) {
    return this.paymentsService.history(user);
  }
}