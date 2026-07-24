import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 30, ttl: 60000 } })
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_admin', 'admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('bookings')
  getBookings(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.adminService.getBookings(Number(page), Number(limit));
  }

  @Get('users')
  getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.adminService.getUsers(Number(page), Number(limit));
  }

  @Patch('users/:id/suspend')
  toggleUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto?: { isActive?: boolean },
  ) {
    return this.adminService.toggleUserStatus(id, dto?.isActive);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('organizations')
  getOrganizations() {
    return this.adminService.getOrganizations();
  }

  @Patch('organizations/:id/approve')
  toggleOrganizationApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto?: { isApproved?: boolean },
  ) {
    return this.adminService.toggleOrganizationApproval(id, dto?.isApproved);
  }

  @Get('activity')
  getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}