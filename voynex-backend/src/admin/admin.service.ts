import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Trip } from '../trips/trip.entity';
import { Booking } from '../bookings/booking.entity';
import { Payment } from '../payments/payment.entity';
import { Organization } from '../organizations/organization.entity';
import { Review } from '../reviews/review.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,

    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,

    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,

    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,

    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async getDashboard() {
    const totalUsers = await this.usersRepository.count();
    const totalTrips = await this.tripsRepository.count();
    const totalBookings = await this.bookingsRepository.count();
    const totalPayments = await this.paymentsRepository.count();

    const revenueResult = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
      .where('payment.status = :status', { status: 'paid' })
      .getRawOne();

    return {
      totalUsers,
      totalTrips,
      totalBookings,
      totalPayments,
      totalRevenue: Number(revenueResult.totalRevenue),
    };
  }

  async getBookings(page = 1, limit = 10) {
    const [data, total] = await this.bookingsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsers(page = 1, limit = 10) {
    const [data, total] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      relations: ['organization'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleUserStatus(id: string, isActive?: boolean) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async getOrganizations() {
    const orgs = await this.organizationsRepository.find({
      order: { createdAt: 'DESC' },
    });

    const enriched = await Promise.all(
      orgs.map(async (org) => {
        const tripsCount = await this.tripsRepository.count({
          where: { organizationId: org.id },
        });

        const revResult = await this.paymentsRepository
          .createQueryBuilder('payment')
          .select('COALESCE(SUM(payment.amount), 0)', 'revenue')
          .where('payment.organizationId = :orgId AND payment.status = :status', {
            orgId: org.id,
            status: 'paid',
          })
          .getRawOne();

        return {
          ...org,
          _id: org.id,
          tripsCount,
          revenue: Number(revResult?.revenue || 0),
        };
      }),
    );

    return enriched;
  }

  async toggleOrganizationApproval(id: string, isApproved?: boolean) {
    const org = await this.organizationsRepository.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    org.isApproved = isApproved !== undefined ? isApproved : !org.isApproved;
    return this.organizationsRepository.save(org);
  }

  async getRecentActivity() {
    const recentBookings = await this.bookingsRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentReviews = await this.reviewsRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentUsers = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const activities: any[] = [];

    recentBookings.forEach((b) => {
      activities.push({
        type: 'booking',
        text: `New booking (${b.id.slice(0, 8)}) placed for ₹${Number(b.totalAmount).toLocaleString()}`,
        createdAt: b.createdAt,
        color: 'bg-blue-500',
      });
    });

    recentReviews.forEach((r) => {
      activities.push({
        type: 'review',
        text: `New ${r.rating}★ review: "${r.comment?.slice(0, 40) || 'Feedback'}"`,
        createdAt: r.createdAt,
        color: 'bg-yellow-500',
      });
    });

    recentUsers.forEach((u) => {
      activities.push({
        type: u.role === 'admin' || u.role === 'staff' ? 'agency' : 'user',
        text: `${u.firstName || u.email.split('@')[0]} registered as ${u.role}`,
        createdAt: u.createdAt,
        color: u.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500',
      });
    });

    activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return activities.slice(0, 10).map((a) => ({
      ...a,
      time: new Date(a.createdAt).toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
    }));
  }

  async getAnalytics() {
    const totalBookings = await this.bookingsRepository.count();
    const pendingBookings = await this.bookingsRepository.count({
      where: { status: 'pending' },
    });
    const confirmedBookings = await this.bookingsRepository.count({
      where: { status: 'confirmed' },
    });
    const cancelledBookings = await this.bookingsRepository.count({
      where: { status: 'cancelled' },
    });

    const revenueResult = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
      .where('payment.status = :status', { status: 'paid' })
      .getRawOne();

    const paidPayments = await this.paymentsRepository.count({
      where: { status: 'paid' },
    });

    const pendingPayments = await this.paymentsRepository.count({
      where: { status: 'pending' },
    });

    const revenueByDate = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select(`DATE(payment.createdAt)`, 'date')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'revenue')
      .where('payment.status = :status', { status: 'paid' })
      .groupBy(`DATE(payment.createdAt)`)
      .orderBy(`DATE(payment.createdAt)`, 'ASC')
      .getRawMany();

    const topDestinations = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoin('trips', 'trip', 'trip.id = CAST(booking.tripId AS uuid)')
      .select('trip.destination', 'destination')
      .addSelect('COUNT(booking.id)', 'bookingsCount')
      .groupBy('trip.destination')
      .orderBy('"bookingsCount"', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
      payments: {
        paid: paidPayments,
        pending: pendingPayments,
      },
      totalRevenue: Number(revenueResult.totalRevenue),
      revenueByDate: revenueByDate.map((item) => ({
        date: item.date,
        revenue: Number(item.revenue),
      })),
      topDestinations: topDestinations.map((item) => ({
        destination: item.destination,
        bookingsCount: Number(item.bookingsCount),
      })),
    };
  }
}