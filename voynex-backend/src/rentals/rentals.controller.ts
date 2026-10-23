import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { RentalsService, CreateRentalDto, UpdateRentalDto } from './rentals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.rentalsService.findAll({ category, location, search, organizationId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Get('agency')
  findByAgency(@CurrentUser('organizationId') organizationId: string) {
    if (!organizationId) {
      throw new ForbiddenException('User does not belong to an organization');
    }
    return this.rentalsService.findByOrganization(organizationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rentalsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  bookRental(
    @CurrentUser('sub') userId: string,
    @CurrentUser('organizationId') userOrgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { daysCount?: number; travelDate?: string; notes?: string },
  ) {
    return this.rentalsService.bookRental(userId, userOrgId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Post()
  create(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateRentalDto,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('User does not belong to an organization');
    }
    return this.rentalsService.create(organizationId, userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: UpdateRentalDto,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('User does not belong to an organization');
    }
    return this.rentalsService.update(id, organizationId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('User does not belong to an organization');
    }
    return this.rentalsService.remove(id, organizationId);
  }
}
