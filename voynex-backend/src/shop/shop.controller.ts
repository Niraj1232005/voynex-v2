import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ShopService, CreateOrderDto } from './shop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  findAllProducts(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.shopService.findAllProducts({ category, search });
  }

  @Get('products/:id')
  findOneProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.findOneProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.shopService.createOrder(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/verify')
  verifyOrder(
    @CurrentUser('sub') userId: string,
    @Body() dto: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) {
    return this.shopService.verifyOrderPayment(
      userId,
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/my-orders')
  findUserOrders(@CurrentUser('sub') userId: string) {
    return this.shopService.findUserOrders(userId);
  }
}
