import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { Organization } from '../organizations/organization.entity';

import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['user', 'staff', 'admin', 'platform_admin'])
  role?: 'user' | 'staff' | 'admin' | 'platform_admin';

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    return this.dataSource.transaction(async (entityManager) => {
      let organizationId = createUserDto.organizationId || null;

      if (createUserDto.organizationName) {
        const slug = createUserDto.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        let org = entityManager.create(Organization, {
          name: createUserDto.organizationName,
          slug,
          email: createUserDto.email,
          subscriptionPlan: 'free',
          isApproved: false, // Pending admin approval
        });
        org = await entityManager.save(org);
        organizationId = org.id;
      }

      const user = entityManager.create(User, {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || 'user',
        organizationId: organizationId || undefined,
      });

      return entityManager.save(user);
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.firstName = updateProfileDto.firstName ?? user.firstName;
    user.lastName = updateProfileDto.lastName ?? user.lastName;

    return this.usersRepository.save(user);
  }

  async findTeamMembers(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { organizationId },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }
}