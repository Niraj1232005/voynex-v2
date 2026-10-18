import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export type FreeTimeCategory = 'food' | 'rest' | 'shopping' | 'sightseeing';

export class SearchFreetimeDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @Min(-90, { message: 'Latitude must be >= -90' })
  @Max(90, { message: 'Latitude must be <= 90' })
  lat: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @Min(-180, { message: 'Longitude must be >= -180' })
  @Max(180, { message: 'Longitude must be <= 180' })
  lon: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Hub name must be at least 2 characters' })
  @MaxLength(200, { message: 'Hub name must not exceed 200 characters' })
  hubName: string;

  @Type(() => Number)
  @IsInt({ message: 'Free time must be an integer number of minutes' })
  @Min(30, { message: 'Free time must be at least 30 minutes' })
  @Max(480, { message: 'Free time must not exceed 480 minutes (8 hours)' })
  freeTimeMinutes: number;

  @IsString()
  @IsIn(['food', 'rest', 'shopping', 'sightseeing'], {
    message: 'Category must be one of: food, rest, shopping, sightseeing',
  })
  category: FreeTimeCategory;

  @Type(() => Number)
  @IsInt()
  @IsIn([15, 20, 30, 45], {
    message: 'Dwell time must be one of: 15, 20, 30, 45 minutes',
  })
  dwellMinutes: number;

  @Type(() => Number)
  @IsInt()
  @IsIn([15, 20, 30, 45, 60], {
    message: 'Buffer time must be one of: 15, 20, 30, 45, 60 minutes',
  })
  bufferMinutes: number;
}
