import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order])],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
