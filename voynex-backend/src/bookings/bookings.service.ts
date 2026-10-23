import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Rental } from '../rentals/rental.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { TripsService } from '../trips/trips.service';
import { EmailService } from '../email/email.service';
import { bookingConfirmationTemplate } from '../email/templates/booking-confirmation.template';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private tripsService: TripsService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  normalizeBooking(booking: any): any {
    if (!booking) return null;
    return {
      ...booking,
      _id: booking.id,
      user: booking.userId,
      startDate: booking.travelDate,
      guests: booking.travelersCount,
      totalPrice: Number(booking.totalAmount),
      tripAmount: Number(booking.tripAmount || (booking.tripId ? booking.totalAmount : 0)),
      rentalAmount: Number(booking.rentalAmount || 0),
      depositAmount: Number(booking.depositAmount || 0),
      rentals: booking.rentals || [],
      itinerary: booking.itinerarySnapshot || booking.trip?.itinerary || [],
      groupComposition: {
        adults: booking.adultsCount || booking.travelersCount || 1,
        children: booking.childrenCount || 0,
        seniors: booking.seniorsCount || 0,
      },
      trip: booking.trip ? {
        ...booking.trip,
        _id: booking.trip.id,
        duration: booking.trip.durationDays,
        organization_id: booking.trip.organizationId,
      } : null,
      rental: booking.rental ? {
        ...booking.rental,
        _id: booking.rental.id,
        organization_id: booking.rental.organizationId,
      } : null,
    };
  }

  async create(
    organizationId: string,
    userId: string,
    dto: CreateBookingDto,
  ): Promise<any> {
    if (!dto.tripId) {
      throw new BadRequestException('tripId is required for trip bookings');
    }

    const trip = await this.tripsService.findOneByOrganization(dto.tripId, undefined);

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (!trip.isActive) {
      throw new BadRequestException('Trip is not active');
    }

    if (organizationId && trip.organizationId && organizationId === trip.organizationId) {
      throw new ForbiddenException("You cannot book your own agency's trip.");
    }

    if (trip.startDates && trip.startDates.length > 0) {
      const isDateAvailable = trip.startDates.includes(dto.travelDate);
      if (!isDateAvailable) {
        throw new BadRequestException('Selected departure date is not available for this trip');
      }
    }

    const adults = dto.adultsCount !== undefined ? dto.adultsCount : dto.travelersCount;
    const children = dto.childrenCount || 0;
    const seniors = dto.seniorsCount || 0;
    const travelersCount = adults + children + seniors;

    const tripAmount = Number(trip.price) * travelersCount;
    const durationDays = trip.durationDays || trip.duration || 1;

    // Process and validate rental selections
    const processedRentals: any[] = [];
    let rentalAmount = 0;
    let depositAmount = 0;

    if (dto.rentals && dto.rentals.length > 0) {
      for (const item of dto.rentals) {
        if (!item.rentalId) {
          throw new BadRequestException('rentalId is required for each selected rental item');
        }
        const rental = await this.bookingsRepository.manager.findOne(Rental, {
          where: { id: item.rentalId },
        });

        if (!rental) {
          throw new NotFoundException(`Rental equipment with ID ${item.rentalId} not found`);
        }

        if (rental.organizationId !== trip.organizationId) {
          throw new BadRequestException(
            `Rental item "${rental.title}" belongs to a different agency. Rentals must belong to the trip agency.`,
          );
        }

        if (rental.isAvailable === false) {
          throw new BadRequestException(`Rental item "${rental.title}" is currently unavailable.`);
        }

        const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));
        const pricePerDay = Number(rental.pricePerDay || 0);
        const itemDeposit = Number(rental.deposit || 0);

        const itemRentalTotal = pricePerDay * durationDays * quantity;
        const itemDepositTotal = itemDeposit * quantity;

        rentalAmount += itemRentalTotal;
        depositAmount += itemDepositTotal;

        processedRentals.push({
          rentalId: rental.id,
          title: rental.title,
          category: rental.category,
          quantity,
          pricePerDay,
          deposit: itemDeposit,
          daysCount: durationDays,
          totalAmount: itemRentalTotal + itemDepositTotal,
        });
      }
    }

    const totalAmount = tripAmount + rentalAmount + depositAmount;

    const booking = this.bookingsRepository.create({
      userId,
      tripId: dto.tripId,
      organizationId: trip.organizationId,
      travelersCount,
      adultsCount: adults,
      childrenCount: children,
      seniorsCount: seniors,
      travelDate: dto.travelDate,
      notes: dto.notes,
      tripAmount,
      rentalAmount,
      depositAmount,
      totalAmount,
      rentals: processedRentals.length > 0 ? processedRentals : undefined,
      itinerarySnapshot: trip.itinerary || [],
      status: 'pending',
      paymentStatus: 'pending',
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    try {
      await this.emailService.sendEmail(
        'rathodniraj.com@gmail.com',
        'Voynex Booking Confirmation',
        bookingConfirmationTemplate({
          userName: 'Niraj',
          tripTitle: trip.title,
          bookingId: savedBooking.id,
          travelDate: savedBooking.travelDate?.toString(),
        }),
      );
    } catch (e) {
      console.error('Email send failed:', e);
    }

    try {
      await this.notificationsService.create({
        userId,
        organizationId: trip.organizationId,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your booking for ${trip.title} was created successfully.`,
      });
    } catch (e) {
      console.error('Notification creation failed:', e);
    }

    const fullBooking = await this.findOneById(savedBooking.id, { sub: userId, role: 'user' });
    return fullBooking;
  }

  async findByUser(userId: string): Promise<any[]> {
    const bookings = await this.bookingsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let trip: any = null;
        let rental: any = null;
        if (b.tripId) {
          trip = await this.tripsService.findOneByOrganization(b.tripId, undefined).catch(() => null);
        }
        if (b.rentalId) {
          rental = await this.bookingsRepository.manager.findOne(Rental, { where: { id: b.rentalId } }).catch(() => null);
        }
        return this.normalizeBooking({ ...b, trip, rental });
      })
    );

    return enriched;
  }

  async findByOrganization(organizationId: string): Promise<any[]> {
    const bookings = await this.bookingsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let trip: any = null;
        let rental: any = null;
        if (b.tripId) {
          trip = await this.tripsService.findOneByOrganization(b.tripId, undefined).catch(() => null);
        }
        if (b.rentalId) {
          rental = await this.bookingsRepository.manager.findOne(Rental, { where: { id: b.rentalId } }).catch(() => null);
        }
        return this.normalizeBooking({ ...b, trip, rental });
      })
    );

    return enriched;
  }

  async findOneById(id: string, user: any): Promise<any> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role === 'user' && booking.userId !== user.sub) {
      throw new BadRequestException('You do not have permission to access this booking');
    }

    if (user.role !== 'user' && user.role !== 'platform_admin' && booking.organizationId !== user.organizationId) {
      throw new BadRequestException('You do not have permission to access this booking');
    }

    let trip: any = null;
    let rental: any = null;
    if (booking.tripId) {
      trip = await this.tripsService.findOneByOrganization(booking.tripId, undefined).catch(() => null);
    }
    if (booking.rentalId) {
      rental = await this.bookingsRepository.manager.findOne(Rental, { where: { id: booking.rentalId } }).catch(() => null);
    }

    return this.normalizeBooking({
      ...booking,
      trip,
      rental,
    });
  }

  async update(
    id: string,
    user: any,
    dto: UpdateBookingDto,
  ): Promise<any> {
    const bookingObj = await this.bookingsRepository.findOne({ where: { id } });
    if (!bookingObj) {
      throw new NotFoundException('Booking not found');
    }
    Object.assign(bookingObj, dto);
    const saved = await this.bookingsRepository.save(bookingObj);
    const full = await this.findOneById(saved.id, user);
    return full;
  }

  async cancel(id: string, user: any): Promise<{ message: string }> {
    const bookingObj = await this.bookingsRepository.findOne({ where: { id } });
    if (!bookingObj) {
      throw new NotFoundException('Booking not found');
    }
    bookingObj.status = 'cancelled';
    await this.bookingsRepository.save(bookingObj);
    return { message: 'Booking cancelled successfully' };
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (user.role === 'user' && booking.userId !== user.sub) {
      throw new ForbiddenException('You do not have permission to delete this booking');
    }
    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('Paid bookings cannot be deleted directly.');
    }
    await this.bookingsRepository.remove(booking);
    return { message: 'Booking deleted successfully' };
  }

  async updateStatus(
    id: string,
    status: string,
    paymentStatus: string,
  ): Promise<any> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    booking.status = status;
    booking.paymentStatus = paymentStatus;
    const saved = await this.bookingsRepository.save(booking);
    return saved;
  }
}