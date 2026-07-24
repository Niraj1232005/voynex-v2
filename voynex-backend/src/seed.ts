import { AppDataSource } from './data-source';
import { Organization } from './organizations/organization.entity';
import { User } from './users/user.entity';
import { Trip } from './trips/trip.entity';
import { Booking } from './bookings/booking.entity';
import { Payment } from './payments/payment.entity';
import { Review } from './reviews/review.entity';
import { Rental } from './rentals/rental.entity';
import { Product } from './shop/product.entity';
import * as bcrypt from 'bcryptjs';

async function run() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();

  console.log('Clearing old test and seeded data...');
  await AppDataSource.getRepository(Review).clear();
  await AppDataSource.getRepository(Payment).clear();
  await AppDataSource.getRepository(Booking).clear();
  await AppDataSource.getRepository(Trip).clear();
  await AppDataSource.getRepository(Rental).clear();
  await AppDataSource.getRepository(Product).clear();
  
  await AppDataSource.getRepository(User).delete({ email: 'agency@himalayan.com' });
  await AppDataSource.getRepository(User).delete({ email: 'traveler@voynex.com' });
  await AppDataSource.getRepository(User).delete({ email: 'admin@voynex.com' });
  await AppDataSource.getRepository(Organization).delete({ slug: 'himalayan-trails' });

  const hashedPassword = await bcrypt.hash('Password123', 10);

  console.log('Seeding Himalayan Trails travel agency organization...');
  const org = await AppDataSource.getRepository(Organization).save({
    name: 'Himalayan Trails',
    slug: 'himalayan-trails',
    email: 'agency@himalayan.com',
    subscriptionPlan: 'pro',
    isApproved: true,
  });

  console.log('Seeding travel agency admin user...');
  const agencyUser = await AppDataSource.getRepository(User).save({
    email: 'agency@himalayan.com',
    password: hashedPassword,
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'admin',
    organizationId: org.id,
  });

  console.log('Seeding default traveler user...');
  const traveler = await AppDataSource.getRepository(User).save({
    email: 'traveler@voynex.com',
    password: hashedPassword,
    firstName: 'Amit',
    lastName: 'Sharma',
    role: 'user',
  });

  console.log('Seeding platform admin user...');
  const platformAdmin = await AppDataSource.getRepository(User).save({
    email: 'admin@voynex.com',
    password: hashedPassword,
    firstName: 'Platform',
    lastName: 'Admin',
    role: 'platform_admin',
  });

  console.log('Seeding 6 realistic trips...');
  const tripsData = [
    {
      title: 'Mystical Manali & Solang Valley',
      destination: 'Manali, Himachal Pradesh',
      description: 'Experience the magic of Manali with snow-capped peaks, adventure sports at Solang Valley, and the serene beauty of Old Manali.',
      price: 15999,
      durationDays: 5,
      maxTravelers: 20,
      difficulty: 'moderate',
      images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'],
      activityType: ['adventure', 'nature', 'photography'],
      highlights: ['Solang Valley Snow Sports', 'Old Manali Exploration', 'Hadimba Temple Visit', 'Jogini Waterfall Trek'],
      itinerary: [
        { day: 1, title: 'Arrival & Mall Road', description: 'Arrive in Manali, explore Mall Road', activities: ['Check-in', 'Mall Road walk', 'Local cuisine'] },
        { day: 2, title: 'Solang Valley Adventure', description: 'Full day at Solang Valley', activities: ['Paragliding', 'Zorbing', 'Snow activities'] },
        { day: 3, title: 'Old Manali & Temples', description: 'Cultural exploration', activities: ['Hadimba Temple', 'Manu Temple', 'Old Manali cafes'] },
        { day: 4, title: 'Jogini Waterfall Trek', description: 'Nature trek day', activities: ['Trek to Jogini Falls', 'Picnic lunch', 'Photography'] },
        { day: 5, title: 'Departure', description: 'Morning at leisure, departure', activities: ['Shopping', 'Departure'] }
      ],
      included: ['Hotel stay', 'Breakfast & Dinner', 'Transport', 'Activity charges'],
      excluded: ['Flights', 'Lunch', 'Personal expenses'],
      startDates: ['2026-05-15', '2026-06-01', '2026-06-15'],
    },
    {
      title: 'Goa Beach Paradise',
      destination: 'Goa',
      description: 'Sun, sand, and sea — discover the vibrant beach culture of Goa with water sports, nightlife, and Portuguese heritage.',
      price: 12499,
      durationDays: 4,
      maxTravelers: 25,
      difficulty: 'easy',
      images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80'],
      activityType: ['beach', 'nightlife', 'water-sports'],
      highlights: ['Baga Beach', 'Dudhsagar Falls', 'Old Goa Churches', 'Water Sports'],
      itinerary: [
        { day: 1, title: 'Arrival & North Goa', description: 'Beach day', activities: ['Baga Beach', 'Calangute', 'Sunset cruise'] },
        { day: 2, title: 'Water Sports & Nightlife', description: 'Adventure day', activities: ['Jet skiing', 'Parasailing', 'Club night'] },
        { day: 3, title: 'South Goa & Heritage', description: 'Culture day', activities: ['Basilica of Bom Jesus', 'Palolem Beach', 'Spice plantation'] },
        { day: 4, title: 'Departure', description: 'Leisure morning', activities: ['Flea market', 'Departure'] }
      ],
      included: ['Resort stay', 'Breakfast', 'Water sports', 'Sightseeing'],
      excluded: ['Flights', 'Lunch & Dinner', 'Nightlife expenses'],
      startDates: ['2026-05-01', '2026-05-20'],
    },
    {
      title: 'Royal Rajasthan Circuit',
      destination: 'Rajasthan',
      description: 'Journey through the land of kings — explore majestic forts, vibrant bazaars, and golden deserts across Jaipur, Udaipur, and Jaisalmer.',
      price: 24999,
      durationDays: 7,
      maxTravelers: 15,
      difficulty: 'easy',
      images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80'],
      activityType: ['culture', 'heritage', 'photography'],
      highlights: ['Amber Fort', 'Lake Palace', 'Desert Safari', 'City Palace'],
      itinerary: [
        { day: 1, title: 'Jaipur Arrival', description: 'Pink City exploration', activities: ['Hawa Mahal', 'City Palace', 'Jantar Mantar'] },
        { day: 2, title: 'Amber Fort & Markets', description: 'Fort visit', activities: ['Amber Fort', 'Johari Bazaar', 'Elephant ride'] },
        { day: 3, title: 'Travel to Udaipur', description: 'Lake City', activities: ['Travel', 'Lake Pichola sunset'] },
        { day: 4, title: 'Udaipur Exploration', description: 'Palace day', activities: ['City Palace', 'Saheliyon ki Bari', 'Boat ride'] },
        { day: 5, title: 'Travel to Jaisalmer', description: 'Golden City', activities: ['Travel', 'Jaisalmer Fort'] },
        { day: 6, title: 'Desert Safari', description: 'Sand dunes', activities: ['Camel safari', 'Desert camping', 'Folk dance'] },
        { day: 7, title: 'Departure', description: 'Morning at leisure', activities: ['Shopping', 'Departure'] }
      ],
      included: ['Heritage hotels', 'All meals', 'AC transport', 'Guide', 'Desert camping'],
      excluded: ['Flights', 'Tips', 'Camera charges'],
      startDates: ['2026-10-01', '2026-11-15', '2026-12-01'],
    },
    {
      title: 'Kerala Backwaters Bliss',
      destination: 'Kerala',
      description: 'Float through the tranquil backwaters of Kerala, experience Ayurvedic spa treatments, and explore lush tea plantations in Munnar.',
      price: 18999,
      durationDays: 6,
      maxTravelers: 12,
      difficulty: 'easy',
      images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80'],
      activityType: ['nature', 'wellness', 'culture'],
      highlights: ['Houseboat Stay', 'Munnar Tea Gardens', 'Kathakali Show', 'Ayurvedic Spa'],
      itinerary: [
        { day: 1, title: 'Kochi Arrival', description: 'Heritage walk', activities: ['Fort Kochi', 'Chinese fishing nets', 'Jewish Synagogue'] },
        { day: 2, title: 'Munnar', description: 'Hill station', activities: ['Tea gardens', 'Eravikulam Park', 'Mattupetty Dam'] },
        { day: 3, title: 'Munnar to Thekkady', description: 'Wildlife', activities: ['Spice plantation', 'Periyar boat ride'] },
        { day: 4, title: 'Alleppey Backwaters', description: 'Houseboat', activities: ['Houseboat cruise', 'Village walk', 'Sunset'] },
        { day: 5, title: 'Kovalam Beach', description: 'Relax', activities: ['Beach', 'Ayurvedic massage', 'Lighthouse'] },
        { day: 6, title: 'Departure', description: 'Departure from Trivandrum', activities: ['Shopping', 'Departure'] }
      ],
      included: ['All stays', 'Houseboat', 'Meals', 'Transport', 'Spa session'],
      excluded: ['Flights', 'Tips', 'Personal shopping'],
      startDates: ['2026-08-01', '2026-09-15'],
    },
    {
      title: 'Ladakh Adventure Expedition',
      destination: 'Ladakh',
      description: 'Conquer the highest motorable passes, camp by pristine lakes, and experience the raw beauty of Ladakh.',
      price: 29999,
      durationDays: 8,
      maxTravelers: 10,
      difficulty: 'challenging',
      images: ['https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&q=80'],
      activityType: ['adventure', 'nature', 'photography'],
      highlights: ['Pangong Lake', 'Khardung La', 'Nubra Valley', 'Magnetic Hill'],
      itinerary: [
        { day: 1, title: 'Leh Arrival', description: 'Acclimatization', activities: ['Rest', 'Leh Palace', 'Shanti Stupa'] },
        { day: 2, title: 'Leh Sightseeing', description: 'Local exploration', activities: ['Magnetic Hill', 'Gurudwara Pathar Sahib', 'Hall of Fame'] },
        { day: 3, title: 'Nubra Valley', description: 'Desert in mountains', activities: ['Khardung La', 'Diskit Monastery', 'Sand dunes'] },
        { day: 4, title: 'Nubra Valley', description: 'Exploration', activities: ['Turtuk village', 'Double-humped camels'] },
        { day: 5, title: 'Pangong Lake', description: 'Iconic lake', activities: ['Drive to Pangong', 'Lakeside camping', 'Stargazing'] },
        { day: 6, title: 'Pangong to Leh', description: 'Return journey', activities: ['Chang La', 'Hemis Monastery'] },
        { day: 7, title: 'Rafting & Markets', description: 'Adventure', activities: ['Zanskar River rafting', 'Leh market'] },
        { day: 8, title: 'Departure', description: 'Farewell', activities: ['Departure'] }
      ],
      included: ['Camps & Hotels', 'All meals', 'Permits', 'Oxygen cylinder', 'Transport'],
      excluded: ['Flights', 'Insurance', 'Rafting (optional)'],
      startDates: ['2026-06-15', '2026-07-01', '2026-07-15'],
    },
    {
      title: 'Andaman Tropical Escape',
      destination: 'Andaman Islands',
      description: 'Dive into crystal-clear waters, explore coral reefs, and relax on pristine white-sand beaches of the Andaman Islands.',
      price: 22499,
      durationDays: 5,
      maxTravelers: 18,
      difficulty: 'easy',
      images: ['https://images.unsplash.com/photo-1589136777351-fdc9c606132e?w=800&q=80'],
      activityType: ['beach', 'water-sports', 'nature'],
      highlights: ['Radhanagar Beach', 'Scuba Diving', 'Cellular Jail', 'Ross Island'],
      itinerary: [
        { day: 1, title: 'Port Blair', description: 'Arrival', activities: ['Cellular Jail', 'Light & Sound Show'] },
        { day: 2, title: 'Havelock Island', description: 'Beach paradise', activities: ['Radhanagar Beach', 'Snorkeling'] },
        { day: 3, title: 'Scuba Diving', description: 'Underwater world', activities: ['Scuba diving', 'Elephant Beach'] },
        { day: 4, title: 'Neil Island', description: 'Coral reefs', activities: ['Natural bridge', 'Glass-bottom boat'] },
        { day: 5, title: 'Departure', description: 'Return to Port Blair', activities: ['Shopping', 'Departure'] }
      ],
      included: ['Ferry tickets', 'Hotels', 'Breakfast & Dinner', 'Water sports'],
      excluded: ['Flights', 'Lunch', 'Scuba gear rental'],
      startDates: ['2026-10-01', '2026-11-01', '2026-12-15'],
    }
  ];

  for (const t of tripsData) {
    await AppDataSource.getRepository(Trip).save({
      ...t,
      organizationId: org.id,
      createdBy: agencyUser.id,
      currency: 'INR',
      isActive: true,
    });
  }

  console.log('Seeding sample rentals...');
  const rentalsData = [
    {
      title: 'Trekking Backpack (65L)',
      category: 'gear',
      description: 'Heavy-duty 65L waterproof trekking backpack with rain cover and ergonomic hip harness.',
      pricePerDay: 350,
      deposit: 1000,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
      location: 'Manali, Himachal Pradesh',
      isAvailable: true,
    },
    {
      title: 'All-Terrain Mountain Bike',
      category: 'vehicle',
      description: '21-speed disc brake mountain bike suitable for high-altitude terrain in Ladakh and Himachal.',
      pricePerDay: 850,
      deposit: 3000,
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
      location: 'Leh, Ladakh',
      isAvailable: true,
    },
    {
      title: 'Action Camera 4K',
      category: 'electronics',
      description: 'Waterproof 4K action camera with helmet mount, extra batteries, and 128GB memory card.',
      pricePerDay: 500,
      deposit: 2000,
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'],
      location: 'Goa',
      isAvailable: true,
    }
  ];

  for (const r of rentalsData) {
    await AppDataSource.getRepository(Rental).save({
      ...r,
      organizationId: org.id,
      createdBy: agencyUser.id,
    });
  }

  console.log('Seeding sample shop products...');
  const productsData = [
    {
      title: 'Ultralight Camping Stove',
      category: 'gear',
      description: 'Compact piezoceramic ignition camping stove, ideal for high-altitude cooking.',
      price: 1899,
      stock: 50,
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'],
    },
    {
      title: 'Insulated Thermal Flask (1L)',
      category: 'accessories',
      description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks hot/cold for 24 hours.',
      price: 1299,
      stock: 100,
      rating: 4.9,
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
    },
    {
      title: 'Waterproof Trail Running Shoes',
      category: 'clothing',
      description: 'Gore-Tex trail shoes with aggressive lug soles for mud and rocky mountain trails.',
      price: 5499,
      stock: 30,
      rating: 4.7,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    }
  ];

  for (const p of productsData) {
    await AppDataSource.getRepository(Product).save(p);
  }

  console.log('Database seeded successfully with hashed credentials for agency@himalayan.com, traveler@voynex.com, and admin@voynex.com!');
  await AppDataSource.destroy();
}

run().catch(err => {
  console.error('Error during database seed:', err);
  process.exit(1);
});
