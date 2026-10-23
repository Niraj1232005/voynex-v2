import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItineraryDayDto } from './create-trip.dto';

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
  @IsObject()
  coordinates?: { lat: number; lng: number };

  @IsOptional()
  @IsObject()
  meetingPoint?: { name: string; address?: string; coordinates?: { lat: number; lng: number } };

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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
