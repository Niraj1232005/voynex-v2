import { IsArray, IsOptional, IsNotEmpty, IsObject, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsObject()
  shippingAddress?: any;
}
