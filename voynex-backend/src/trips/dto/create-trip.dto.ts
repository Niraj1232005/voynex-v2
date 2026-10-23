import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItineraryDayDto {
  @IsNumber()
  day: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  activities?: string[];
}

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

  @IsOptional()
  @IsObject()
  coordinates?: { lat: number; lng: number };

  @IsOptional()
  @IsObject()
  meetingPoint?: { name: string; address?: string; coordinates?: { lat: number; lng: number } };

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
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayDto)
  itinerary?: ItineraryDayDto[];

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
