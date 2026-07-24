import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Booking } from '../bookings/booking.entity';
import { Trip } from '../trips/trip.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    // 1. Enforce that the user has a confirmed & paid booking for this trip
    const hasBooking = await this.bookingsRepository.findOne({
      where: {
        userId,
        tripId: dto.tripId,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    });

    if (!hasBooking) {
      throw new BadRequestException(
        'You must have a confirmed and paid booking for this trip before reviewing it',
      );
    }

    // 2. Check if already reviewed
    const existing = await this.reviewsRepository.findOne({
      where: {
        userId,
        tripId: dto.tripId,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this trip');
    }

    const review = new Review();
    review.bookingId = hasBooking.id;
    review.userId = userId;
    review.tripId = dto.tripId;
    review.rating = dto.rating;
    review.title = dto.title || null;
    review.comment = dto.comment || null;
    review.verifiedPurchase = true;
    
    const saved = await this.reviewsRepository.save(review);

    return {
      ...saved,
      _id: saved.id,
      trip: saved.tripId,
      user: {
        _id: saved.userId,
        name: 'You',
      },
    };
  }

  async findByTrip(tripId: string) {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndMapOne('review.user', User, 'user', 'user.id = review.userId')
      .where('review.tripId = :tripId', { tripId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / totalReviews
        : 0;

    const normalized = reviews.map(r => ({
      ...r,
      _id: r.id,
      trip: r.tripId,
      user: {
        _id: (r as any).user?.id || r.userId,
        name: (r as any).user ? `${(r as any).user.firstName || ''} ${(r as any).user.lastName || ''}`.trim() : 'Verified Traveler',
        avatar: (r as any).user?.avatar || undefined,
      }
    }));

    return {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      reviews: normalized,
    };
  }

  async findByAgency(organizationId: string) {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .innerJoin(Trip, 'trip', 'trip.id = review."tripId"::uuid')
      .leftJoinAndMapOne('review.user', User, 'user', 'user.id = review."userId"::uuid')
      .where('trip.organizationId = :organizationId', { organizationId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    return reviews.map(r => ({
      ...r,
      _id: r.id,
      trip: r.tripId,
      user: {
        _id: (r as any).user?.id || r.userId,
        name: (r as any).user ? `${(r as any).user.firstName || ''} ${(r as any).user.lastName || ''}`.trim() : 'Verified Traveler',
        avatar: (r as any).user?.avatar || undefined,
      }
    }));
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can update only your own review');
    }

    Object.assign(review, dto);

    const saved = await this.reviewsRepository.save(review);
    return {
      ...saved,
      _id: saved.id,
      trip: saved.tripId,
      user: {
        _id: saved.userId,
        name: 'You',
      },
    };
  }

  async findAll() {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .innerJoinAndMapOne('review.trip', Trip, 'trip', 'trip.id = review."tripId"::uuid')
      .leftJoinAndMapOne('review.user', User, 'user', 'user.id = review."userId"::uuid')
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    return reviews.map(r => ({
      ...r,
      _id: r.id,
      trip: {
        id: (r as any).trip?.id || r.tripId,
        title: (r as any).trip?.title || 'Trip Package',
      },
      user: {
        _id: (r as any).user?.id || r.userId,
        name: (r as any).user ? `${(r as any).user.firstName || ''} ${(r as any).user.lastName || ''}`.trim() : 'Traveler',
        email: (r as any).user?.email || 'traveler@voynex.com',
      }
    }));
  }

  async remove(reviewId: string, userId: string, userRole?: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && userRole !== 'platform_admin') {
      throw new ForbiddenException('You can delete only your own review');
    }

    await this.reviewsRepository.remove(review);

    return { message: 'Review deleted successfully' };
  }
}