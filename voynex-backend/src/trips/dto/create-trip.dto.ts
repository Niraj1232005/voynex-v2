import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  durationDays: number;

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
}
