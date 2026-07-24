import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class WishlistToggleDto {
  @IsString()
  @IsNotEmpty()
  itemType: string;

  @IsString()
  @IsNotEmpty()
  itemId: string;
}

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findByUser(@CurrentUser('sub') userId: string) {
    return this.wishlistService.findByUser(userId);
  }

  @Post()
  toggle(
    @CurrentUser('sub') userId: string,
    @Body() dto: WishlistToggleDto,
  ) {
    return this.wishlistService.toggle(userId, dto.itemType, dto.itemId);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.wishlistService.remove(userId, id);
  }
}
