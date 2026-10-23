import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BookingRentalItemDto {
  @IsString()
  @IsNotEmpty()
  rentalId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  rentalId?: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  travelersCount: number;

  @IsDateString()
  travelDate: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  adultsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  childrenCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seniorsCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingRentalItemDto)
  rentals?: BookingRentalItemDto[];
}