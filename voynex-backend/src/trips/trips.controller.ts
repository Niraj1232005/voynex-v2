import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import {
  CreateTripDto,
  UpdateTripDto,
  GetTripsQueryDto,
} from './trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findAll(
    @Query() query: GetTripsQueryDto,
    @CurrentUser('organizationId') organizationId?: string,
  ) {
    return this.tripsService.findByOrganization(organizationId, query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId?: string,
  ) {
    return this.tripsService.findOneByOrganization(id, organizationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agency', 'platform_admin')
  @Post()
  create(
    @Body() createTripDto: CreateTripDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tripsService.create(organizationId, userId, createTripDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agency', 'platform_admin')
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTripDto: UpdateTripDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.tripsService.update(id, organizationId, updateTripDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agency', 'platform_admin')
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.tripsService.remove(id, organizationId);
  }
}