import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

export { CreateOrderDto };

@Injectable()
export class ShopService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  normalizeProduct(p: any) {
    if (!p) return null;
    return {
      ...p,
      _id: p.id,
      price: Number(p.price),
    };
  }

  normalizeOrder(o: any) {
    if (!o) return null;
    return {
      ...o,
      _id: o.id,
      totalAmount: Number(o.totalAmount),
    };
  }

  async findAllProducts(query?: { category?: string; search?: string }) {
    const qb = this.productsRepository.createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC');

    if (query?.category) {
      qb.andWhere('LOWER(product.category) = LOWER(:category)', { category: query.category });
    }

    if (query?.search) {
      qb.andWhere('(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }

    const items = await qb.getMany();
    return items.map(p => this.normalizeProduct(p));
  }

  async findOneProduct(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.normalizeProduct(product);
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    const order = this.ordersRepository.create({
      userId,
      items: dto.items,
      totalAmount,
      shippingAddress: dto.shippingAddress || {},
      status: 'pending',
    });

    const savedOrder = await this.ordersRepository.save(order);

    const amountInPaise = Math.round(Number(totalAmount) * 100);
    const rzpOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `ord_${savedOrder.id.slice(0, 32)}`,
    });

    savedOrder.razorpayOrderId = rzpOrder.id;
    await this.ordersRepository.save(savedOrder);

    const norm = this.normalizeOrder(savedOrder);
    return {
      ...norm,
      orderId: savedOrder.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      normalizedOrder: norm,
    };
  }

  async verifyOrderPayment(
    userId: string,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!order) {
      throw new NotFoundException('Shop order not found');
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'paid';

    const saved = await this.ordersRepository.save(order);
    return {
      message: 'Shop order payment verified successfully',
      order: this.normalizeOrder(saved),
    };
  }

  async findUserOrders(userId: string) {
    const orders = await this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orders.map(o => this.normalizeOrder(o));
  }
}
