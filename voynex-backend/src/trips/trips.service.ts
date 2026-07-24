import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Trip } from './trip.entity';
import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { Review } from '../reviews/review.entity';

import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

export { CreateTripDto, UpdateTripDto };

import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTripsQueryDto {
  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    private dataSource: DataSource,
  ) {}

  normalizeTrip(trip: any): any {
    if (!trip) return null;
    return {
      ...trip,
      _id: trip.id,
      duration: trip.durationDays,
      organization_id: trip.organizationId,
    };
  }

  async getTripRatingStats(tripId: string) {
    const stats = await this.dataSource.getRepository(Review).createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.tripId = :tripId', { tripId })
      .getRawOne();

    return {
      rating: stats.average ? Number(Number(stats.average).toFixed(1)) : 4.5,
      reviewCount: stats.count ? Number(stats.count) : 0,
    };
  }

  async getBulkTripRatingStats(tripIds: string[]) {
    if (tripIds.length === 0) return new Map<string, { rating: number; reviewCount: number }>();

    const statsList = await this.dataSource.getRepository(Review).createQueryBuilder('review')
      .select('review.tripId', 'tripId')
      .addSelect('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.tripId IN (:...tripIds)', { tripIds })
      .groupBy('review.tripId')
      .getRawMany();

    const statsMap = new Map<string, { rating: number; reviewCount: number }>();
    statsList.forEach(s => {
      statsMap.set(s.tripId, {
        rating: s.average ? Number(Number(s.average).toFixed(1)) : 4.5,
        reviewCount: s.count ? Number(s.count) : 0,
      });
    });

    return statsMap;
  }

  async create(
    organizationId: string,
    userId: string,
    createTripDto: CreateTripDto,
  ): Promise<any> {
    const trip = this.tripsRepository.create({
      ...createTripDto,
      currency: createTripDto.currency || 'INR',
      maxTravelers: createTripDto.maxTravelers || 20,
      organizationId,
      createdBy: userId,
    });

    const saved = await this.tripsRepository.save(trip);
    return this.normalizeTrip(saved);
  }

  async findByOrganization(
    organizationId: string | undefined,
    query: GetTripsQueryDto,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const qb = this.tripsRepository.createQueryBuilder('trip');

    if (organizationId) {
      qb.where('trip.organizationId = :organizationId', { organizationId });
    }

    if (query.destination) {
      qb.andWhere('LOWER(trip.destination) LIKE LOWER(:destination)', {
        destination: `%${query.destination}%`,
      });
    }

    if (query.minPrice) {
      qb.andWhere('trip.price >= :minPrice', {
        minPrice: Number(query.minPrice),
      });
    }

    if (query.maxPrice) {
      qb.andWhere('trip.price <= :maxPrice', {
        maxPrice: Number(query.maxPrice),
      });
    }

    if (query.durationDays) {
      qb.andWhere('trip.durationDays = :durationDays', {
        durationDays: Number(query.durationDays),
      });
    }

    qb.orderBy('trip.createdAt', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    const tripIds = data.map(t => t.id);
    const statsMap = await this.getBulkTripRatingStats(tripIds);

    const enriched = data.map(trip => {
      const stats = statsMap.get(trip.id) || { rating: 4.5, reviewCount: 0 };
      return this.normalizeTrip({
        ...trip,
        ...stats,
      });
    });

    return {
      data: enriched,
      total,
      page,
      limit,
    };
  }

  async findOneByOrganization(
    id: string,
    organizationId?: string,
  ): Promise<any> {
    const whereClause: any = { id };
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }
    const trip = await this.tripsRepository.findOne({
      where: whereClause,
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const stats = await this.getTripRatingStats(trip.id);
    return this.normalizeTrip({
      ...trip,
      ...stats,
    });
  }

  async update(
    id: string,
    organizationId: string,
    updateTripDto: UpdateTripDto,
  ): Promise<any> {
    const trip = await this.findOneByOrganization(id, organizationId);

    Object.assign(trip, updateTripDto);

    const saved = await this.tripsRepository.save(trip);
    return this.normalizeTrip(saved);
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<{ message: string }> {
    const trip = await this.findOneByOrganization(id, organizationId);

    await this.tripsRepository.remove(trip);

    return { message: 'Trip deleted successfully' };
  }
}
