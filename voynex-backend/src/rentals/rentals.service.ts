import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from './rental.entity';
import { Booking } from '../bookings/booking.entity';

import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  pricePerDay: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsObject()
  specs?: any;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateRentalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  pricePerDay?: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsObject()
  specs?: any;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  location?: string;
}

import { Organization } from '../organizations/organization.entity';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private rentalsRepository: Repository<Rental>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  private async verifyApprovedOrganization(organizationId: string) {
    const org = await this.organizationsRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    if (!org.isApproved || org.status === 'rejected') {
      throw new ForbiddenException('Your agency account is awaiting platform admin approval.');
    }
  }

  normalizeRental(rental: any): any {
    if (!rental) return null;
    return {
      ...rental,
      _id: rental.id,
      organization_id: rental.organizationId,
      price: Number(rental.pricePerDay),
    };
  }

  async create(organizationId: string, userId: string, dto: CreateRentalDto) {
    await this.verifyApprovedOrganization(organizationId);

    const rental = this.rentalsRepository.create({
      ...dto,
      organizationId,
      createdBy: userId,
      pricePerDay: Number(dto.pricePerDay),
      deposit: dto.deposit ? Number(dto.deposit) : 0,
    });
    const saved = await this.rentalsRepository.save(rental);
    return this.normalizeRental(saved);
  }

  async findAll(query?: { category?: string; location?: string; search?: string; organizationId?: string }) {
    const qb = this.rentalsRepository.createQueryBuilder('rental')
      .leftJoinAndSelect('rental.organization', 'organization')
      .orderBy('rental.createdAt', 'DESC');

    if (query?.category) {
      qb.andWhere('LOWER(rental.category) = LOWER(:category)', { category: query.category });
    }

    if (query?.organizationId) {
      qb.andWhere('rental.organizationId = :organizationId', { organizationId: query.organizationId });
    }

    if (query?.location) {
      qb.andWhere('LOWER(rental.location) LIKE LOWER(:location)', { location: `%${query.location}%` });
    }

    if (query?.search) {
      qb.andWhere('(LOWER(rental.title) LIKE LOWER(:search) OR LOWER(rental.description) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }

    const items = await qb.getMany();
    return items.map(i => this.normalizeRental(i));
  }

  async findByOrganization(organizationId: string) {
    const items = await this.rentalsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
    return items.map(i => this.normalizeRental(i));
  }

  async findOne(id: string) {
    const rental = await this.rentalsRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!rental) throw new NotFoundException('Rental item not found');
    return this.normalizeRental(rental);
  }

  async update(id: string, organizationId: string, dto: UpdateRentalDto) {
    await this.verifyApprovedOrganization(organizationId);
    const rental = await this.rentalsRepository.findOne({ where: { id } });
    if (!rental) throw new NotFoundException('Rental item not found');
    if (rental.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to update this rental item');
    }

    Object.assign(rental, dto);
    if (dto.pricePerDay !== undefined) rental.pricePerDay = Number(dto.pricePerDay);
    if (dto.deposit !== undefined) rental.deposit = Number(dto.deposit);

    const saved = await this.rentalsRepository.save(rental);
    return this.normalizeRental(saved);
  }

  async remove(id: string, organizationId: string) {
    await this.verifyApprovedOrganization(organizationId);
    const rental = await this.rentalsRepository.findOne({ where: { id } });
    if (!rental) throw new NotFoundException('Rental item not found');
    if (rental.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to delete this rental item');
    }

    await this.rentalsRepository.remove(rental);
    return { message: 'Rental item deleted successfully' };
  }

  async bookRental(userId: string, userOrgId: string, rentalId: string, dto: { daysCount?: number; travelDate?: string; notes?: string }) {
    const rental = await this.rentalsRepository.findOne({ where: { id: rentalId } });
    if (!rental) throw new NotFoundException('Rental item not found');

    if (userOrgId && rental.organizationId && userOrgId === rental.organizationId) {
      throw new ForbiddenException("You cannot book your own agency's rental item.");
    }

    const days = Math.max(1, Number(dto.daysCount) || 1);
    const pricePerDay = Number(rental.pricePerDay || 0);
    const deposit = Number(rental.deposit || 0);
    const totalAmount = (pricePerDay * days) + deposit;
    const travelDate = dto.travelDate || new Date().toISOString().split('T')[0];

    const booking = this.bookingsRepository.create({
      userId,
      rentalId: rental.id,
      organizationId: rental.organizationId,
      travelersCount: days,
      adultsCount: days,
      childrenCount: 0,
      seniorsCount: 0,
      travelDate,
      notes: dto.notes || `Rental: ${rental.title} for ${days} day(s)`,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    const saved = await this.bookingsRepository.save(booking);
    return {
      ...saved,
      _id: saved.id,
      totalPrice: Number(saved.totalAmount),
    };
  }
}
