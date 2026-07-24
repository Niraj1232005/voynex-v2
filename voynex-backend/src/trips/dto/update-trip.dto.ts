import { IsOptional, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsNumber()
  maxTravelers?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  activityType?: string[];

  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsArray()
  itinerary?: any[];

  @IsOptional()
  @IsArray()
  included?: string[];

  @IsOptional()
  @IsArray()
  excluded?: string[];

  @IsOptional()
  @IsArray()
  startDates?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
