import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('saved_plans')
export class SavedPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  destination: string;

  @Column({ default: 3 })
  durationDays: number;

  @Column({ nullable: true })
  budget: string;

  @Column({ nullable: true })
  travelers: string;

  @Column('jsonb')
  itinerary: any;

  @CreateDateColumn()
  createdAt: Date;
}
