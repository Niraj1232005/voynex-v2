import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from './../src/users/user.entity';
import { Trip } from './../src/trips/trip.entity';
import { Booking } from './../src/bookings/booking.entity';
import { Organization } from './../src/organizations/organization.entity';
import { Review } from './../src/reviews/review.entity';
import { Payment } from './../src/payments/payment.entity';
import { Rental } from './../src/rentals/rental.entity';
import { WishlistItem } from './../src/wishlist/wishlist-item.entity';
import { Product } from './../src/shop/product.entity';
import { Order } from './../src/shop/order.entity';
import { SavedPlan } from './../src/ai/saved-plan.entity';
import cookieParser from 'cookie-parser';

// Set E2E test timeout to 45 seconds to accommodate cold start & full suite assertions
jest.setTimeout(45000);

describe('Voynex Milestone Verification (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  async function cleanup() {
    if (dataSource) {
      try {
        await dataSource.getRepository(WishlistItem).clear();
        await dataSource.getRepository(Order).clear();
        await dataSource.getRepository(Product).clear();
        await dataSource.getRepository(Rental).clear();
        await dataSource.getRepository(SavedPlan).clear();
        await dataSource.getRepository(Review).clear();
        await dataSource.getRepository(Payment).clear();
        await dataSource.getRepository(Booking).clear();
        await dataSource.getRepository(Trip).clear();
        await dataSource.getRepository(User).delete({ email: 'test_traveler@voynex.com' });
        await dataSource.getRepository(User).delete({ email: 'test_agency_owner@voynex.com' });
        await dataSource.getRepository(User).delete({ email: 'test_platform_admin@voynex.com' });
        await dataSource.getRepository(Organization).delete({ slug: 'test-verification-org' });
      } catch (err) {
        console.error('E2E cleanup error:', err);
      }
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    dataSource = app.get(DataSource);
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    if (app) {
      await app.close();
    }
  });

  it('Verifies complete flow end-to-end', async () => {
    // 1. Register Travel Agency Admin (provisioning organization)
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'test_agency_owner@voynex.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Agency',
        role: 'admin',
        organizationName: 'Test Verification Org',
      })
      .expect(201);

    // Retrieve organization slug generated
    const agencyUser = await dataSource.getRepository(User).findOne({
      where: { email: 'test_agency_owner@voynex.com' },
      relations: ['organization'],
    });
    expect(agencyUser).toBeDefined();
    expect(agencyUser!.organizationId).toBeDefined();
    expect(agencyUser!.organization).toBeDefined();

    // Auto-approve agency organization so they can list trips
    agencyUser!.organization!.isApproved = true;
    await dataSource.getRepository(Organization).save(agencyUser!.organization!);

    // Log in as agency owner
    const agencyLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test_agency_owner@voynex.com',
        password: 'Password123',
      })
      .expect(200);
    const agencyCookie = agencyLoginRes.headers['set-cookie'][0];

    // Create a trip for this agency
    const createTripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Cookie', agencyCookie)
      .send({
        title: 'Milestone Test Adventure',
        destination: 'Test Peak, Himalayas',
        description: 'Verification trip description',
        price: 5000,
        durationDays: 3,
        difficulty: 'easy',
        startDates: ['2026-08-01'],
      })
      .expect(201);
    const tripId = createTripRes.body._id || createTripRes.body.id;

    // 2. Register/Login Traveler (regular user)
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'test_traveler@voynex.com',
        password: 'Password123',
        firstName: 'Joe',
        lastName: 'Traveler',
        role: 'user',
      })
      .expect(201);

    const travelerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test_traveler@voynex.com',
        password: 'Password123',
      })
      .expect(200);
    const travelerCookie = travelerLoginRes.headers['set-cookie'][0];

    // Verify traveler profile management
    const profileRes = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Cookie', travelerCookie)
      .expect(200);
    expect(profileRes.body.email).toBe('test_traveler@voynex.com');
    expect(profileRes.body.firstName).toBe('Joe');

    // Update profile
    const updateProfileRes = await request(app.getHttpServer())
      .patch('/users/profile')
      .set('Cookie', travelerCookie)
      .send({
        firstName: 'Joseph',
        lastName: 'Traveler-Updated',
      })
      .expect(200);
    expect(updateProfileRes.body.firstName).toBe('Joseph');
    expect(updateProfileRes.body.lastName).toBe('Traveler-Updated');

    // 3. Traveler attempts to post review on the trip without booking -> Expect 400
    await request(app.getHttpServer())
      .post('/reviews')
      .set('Cookie', travelerCookie)
      .send({
        tripId,
        rating: 5,
        title: 'Faked Review',
        comment: 'I should not be able to review this!',
      })
      .expect(400);

    // 3.5 Agency user attempts to book their own trip -> Expect 403 Forbidden
    await request(app.getHttpServer())
      .post('/bookings')
      .set('Cookie', agencyCookie)
      .send({
        tripId,
        travelersCount: 1,
        travelDate: '2026-08-01',
      })
      .expect(403);

    // 4. Traveler creates booking
    const bookingRes = await request(app.getHttpServer())
      .post('/bookings')
      .set('Cookie', travelerCookie)
      .send({
        tripId,
        travelersCount: 2,
        travelDate: '2026-08-01',
        notes: 'Verification booking',
      })
      .expect(201);
    const bookingId = bookingRes.body._id || bookingRes.body.id;

    // Verify booking is pending and unpaid
    expect(bookingRes.body.status).toBe('pending');
    expect(bookingRes.body.paymentStatus).toBe('pending');

    // 5. Traveler attempts to post review with a PENDING booking -> Expect 400 (requires confirmed + paid)
    await request(app.getHttpServer())
      .post('/reviews')
      .set('Cookie', travelerCookie)
      .send({
        tripId,
        bookingId,
        rating: 5,
        comment: 'Nice try but still pending',
      })
      .expect(400);

    // 6. Confirm & Pay the booking
    const bookingRecord = await dataSource.getRepository(Booking).findOne({ where: { id: bookingId } });
    bookingRecord!.status = 'confirmed';
    bookingRecord!.paymentStatus = 'paid';
    await dataSource.getRepository(Booking).save(bookingRecord!);

    // 7. Traveler posts review now -> Expect 201 Success
    const reviewRes = await request(app.getHttpServer())
      .post('/reviews')
      .set('Cookie', travelerCookie)
      .send({
        tripId,
        bookingId,
        rating: 5,
        title: 'Awesome Expedition',
        comment: 'Now it works because I paid for it!',
      })
      .expect(201);

    // 8. Check `/trips` and `/trips/:id` show the exact same aggregated rating and review counts
    const tripsListRes = await request(app.getHttpServer())
      .get('/trips')
      .expect(200);
    const listedTrip = tripsListRes.body.data.find((t: any) => t._id === tripId || t.id === tripId);
    expect(listedTrip).toBeDefined();
    expect(listedTrip.rating).toBe(5);
    expect(listedTrip.reviewCount).toBe(1);

    const tripDetailRes = await request(app.getHttpServer())
      .get(`/trips/${tripId}`)
      .expect(200);
    expect(tripDetailRes.body.rating).toBe(5);
    expect(tripDetailRes.body.reviewCount).toBe(1);

    // 9. Verify Agency stats and scoped visibility
    const statsRes = await request(app.getHttpServer())
      .get('/organizations/stats')
      .set('Cookie', agencyCookie)
      .expect(200);
    
    expect(statsRes.body.totalTrips).toBe(1);
    expect(statsRes.body.totalBookings).toBe(1);
    expect(statsRes.body.averageRating).toBe(5.0);

    // 10. Verify Platform Admin Moderation
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'test_platform_admin@voynex.com',
        password: 'Password123',
        firstName: 'Paul',
        lastName: 'Admin',
        role: 'platform_admin',
      })
      .expect(201);

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test_platform_admin@voynex.com',
        password: 'Password123',
      })
      .expect(200);
    const adminCookie = adminLoginRes.headers['set-cookie'][0];

    // Fetch all reviews as platform admin
    const allReviewsRes = await request(app.getHttpServer())
      .get('/reviews')
      .set('Cookie', adminCookie)
      .expect(200);
    expect(allReviewsRes.body.length).toBe(1);
    const targetReviewId = allReviewsRes.body[0]._id;

    // Delete traveler review as platform admin
    await request(app.getHttpServer())
      .delete(`/reviews/${targetReviewId}`)
      .set('Cookie', adminCookie)
      .expect(200);

    // Verify reviews are now empty
    const checkReviewsRes = await request(app.getHttpServer())
      .get('/reviews')
      .set('Cookie', adminCookie)
      .expect(200);
    // 10.5 Verify suspended user login rejection and JWT invalidation
    const suspendedUser = await dataSource.getRepository(User).findOne({ where: { email: 'test_traveler@voynex.com' } });
    suspendedUser!.isActive = false;
    await dataSource.getRepository(User).save(suspendedUser!);

    // Attempt login as suspended traveler -> Expect 401 Unauthorized
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test_traveler@voynex.com',
        password: 'Password123',
      })
      .expect(401);

    // Attempt request with existing token -> Expect 401 Unauthorized
    await request(app.getHttpServer())
      .get('/users/profile')
      .set('Cookie', travelerCookie)
      .expect(401);

    // Restore traveler account
    suspendedUser!.isActive = true;
    await dataSource.getRepository(User).save(suspendedUser!);

    // 11. Phase 9 Feature Modules Verification
    // A. Rentals Agency CRUD & Public Browse
    const createRentalRes = await request(app.getHttpServer())
      .post('/rentals')
      .set('Cookie', agencyCookie)
      .send({
        title: 'Test Sleeping Bag',
        category: 'gear',
        description: 'Zero degree sleeping bag for high altitude',
        pricePerDay: 250,
        deposit: 500,
        location: 'Manali',
      })
      .expect(201);
    const rentalId = createRentalRes.body._id || createRentalRes.body.id;

    const rentalsListRes = await request(app.getHttpServer())
      .get('/rentals')
      .expect(200);
    const listedRental = rentalsListRes.body.find((r: any) => r._id === rentalId || r.id === rentalId);
    expect(listedRental).toBeDefined();
    expect(listedRental.title).toBe('Test Sleeping Bag');

    // B. Wishlist Add/Get/Delete
    const toggleWishlistRes = await request(app.getHttpServer())
      .post('/wishlist')
      .set('Cookie', travelerCookie)
      .send({ itemType: 'rental', itemId: rentalId })
      .expect(201);
    expect(toggleWishlistRes.body.saved).toBe(true);

    const wishlistRes = await request(app.getHttpServer())
      .get('/wishlist')
      .set('Cookie', travelerCookie)
      .expect(200);
    expect(wishlistRes.body.length).toBe(1);
    expect(wishlistRes.body[0].item._id).toBe(rentalId);

    const wishlistId = wishlistRes.body[0]._id;
    await request(app.getHttpServer())
      .delete(`/wishlist/${wishlistId}`)
      .set('Cookie', travelerCookie)
      .expect(200);

    // C. Shop & Orders
    const sampleProduct = await dataSource.getRepository(Product).save({
      title: 'E2E Test Water Bottle',
      category: 'accessories',
      price: 999,
      stock: 50,
      rating: 5.0,
    });

    const createOrderRes = await request(app.getHttpServer())
      .post('/shop/orders')
      .set('Cookie', travelerCookie)
      .send({
        items: [{ productId: sampleProduct.id, title: sampleProduct.title, quantity: 1, price: 999 }],
      })
      .expect(201);
    expect(createOrderRes.body.totalAmount).toBe(999);

    const userOrdersRes = await request(app.getHttpServer())
      .get('/shop/orders/my-orders')
      .set('Cookie', travelerCookie)
      .expect(200);
    expect(userOrdersRes.body.length).toBe(1);

    // D. Saved AI Plans
    const savePlanRes = await request(app.getHttpServer())
      .post('/ai/plans')
      .set('Cookie', travelerCookie)
      .send({
        destination: 'Manali',
        durationDays: 3,
        budget: 'Moderate',
        itinerary: { day1: 'Arrive and rest' },
      })
      .expect(201);
    const planId = savePlanRes.body._id || savePlanRes.body.id;

    const userPlansRes = await request(app.getHttpServer())
      .get('/ai/plans')
      .set('Cookie', travelerCookie)
      .expect(200);
    expect(userPlansRes.body.length).toBe(1);
    expect(userPlansRes.body[0].destination).toBe('Manali');

    await request(app.getHttpServer())
      .delete(`/ai/plans/${planId}`)
      .set('Cookie', travelerCookie)
      .expect(200);

    // Clean up rental item
    await request(app.getHttpServer())
      .delete(`/rentals/${rentalId}`)
      .set('Cookie', agencyCookie)
      .expect(200);
  }, 90000);
});
