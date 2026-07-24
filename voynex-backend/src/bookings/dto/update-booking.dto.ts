import { IsOptional, IsString, IsIn, IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  travelersCount?: number;
}