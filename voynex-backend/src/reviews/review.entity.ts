import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'varchar' })
  bookingId: string | null;

  @Column()
  userId: string;

  @Column()
  tripId: string;

  @Column('int')
  rating: number;

  @Column({ nullable: true, type: 'varchar' })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ default: true })
  verifiedPurchase: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}