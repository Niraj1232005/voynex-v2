import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  destination: string;

  @Column({ type: 'jsonb', nullable: true })
  coordinates?: { lat: number; lng: number };

  @Column({ type: 'jsonb', nullable: true })
  meetingPoint?: { name: string; address?: string; coordinates?: { lat: number; lng: number } };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column()
  durationDays: number;

  @Column({ default: 20 })
  maxTravelers: number;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ type: 'jsonb', nullable: true })
  activityType: string[];

  @Column({ type: 'jsonb', nullable: true })
  highlights: string[];

  @Column({ type: 'jsonb', nullable: true })
  itinerary: any[];

  @Column({ type: 'jsonb', nullable: true })
  included: string[];

  @Column({ type: 'jsonb', nullable: true })
  excluded: string[];

  @Column({ type: 'jsonb', nullable: true })
  startDates: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}