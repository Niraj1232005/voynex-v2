import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AutocompleteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Search query must be at least 3 characters long' })
  @MaxLength(100, { message: 'Search query must not exceed 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  text: string;
}
