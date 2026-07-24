import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

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
}