import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  tripId: string;

  @Column({ nullable: true })
  rentalId: string;

  @Column()
  organizationId: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 1 })
  travelersCount: number;

  @Column({ default: 1 })
  adultsCount: number;

  @Column({ default: 0 })
  childrenCount: number;

  @Column({ default: 0 })
  seniorsCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tripAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rentalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  rentals: Array<{
    rentalId: string;
    title: string;
    quantity: number;
    pricePerDay: number;
    deposit: number;
    daysCount: number;
    totalAmount: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  itinerarySnapshot: any[];

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  @Column({ type: 'date', nullable: true })
  travelDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  razorpayPaymentId: string;

  @Column({ nullable: true })
  razorpayOrderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}