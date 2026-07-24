import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationProfileDto,
  UpdateOrganizationSettingsDto,
} from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser('organizationId') organizationId: string) {
    return this.organizationsService.findOne(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser('organizationId') organizationId: string,
    @Body() updateOrganizationProfileDto: UpdateOrganizationProfileDto,
  ) {
    return this.organizationsService.updateProfile(
      organizationId,
      updateOrganizationProfileDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  getSettings(@CurrentUser('organizationId') organizationId: string) {
    return this.organizationsService.findOne(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  updateSettings(
    @CurrentUser('organizationId') organizationId: string,
    @Body() updateOrganizationSettingsDto: UpdateOrganizationSettingsDto,
  ) {
    return this.organizationsService.updateSettings(
      organizationId,
      updateOrganizationSettingsDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@CurrentUser('organizationId') organizationId: string) {
    return this.organizationsService.getStats(organizationId);
  }

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.findOne(id);
  }
}