import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../organizations/organization.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: true })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'user' })
  role: 'user' | 'staff' | 'admin' | 'platform_admin';

  @Column({ nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, (organization) => organization.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
