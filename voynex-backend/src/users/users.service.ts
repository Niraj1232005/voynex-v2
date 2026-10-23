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
    if (createUserDto.role === 'platform_admin') {
      throw new BadRequestException('Platform admin accounts cannot be created via public registration.');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
      relations: ['organization'],
    });

    if (existingUser) {
      if (existingUser.organization) {
        if (!existingUser.organization.isApproved || existingUser.organization.status === 'pending') {
          throw new BadRequestException('An agency application with this email has already been submitted and is awaiting admin approval. Please log in to check your application status.');
        } else if (existingUser.organization.status === 'rejected') {
          throw new BadRequestException('An agency application with this email exists and was rejected. Please log in to check your application status.');
        } else {
          throw new BadRequestException('An account with this email already exists. Please log in to your agency portal.');
        }
      }
      throw new BadRequestException('An account with this email already exists. Existing travelers must log in before submitting an agency application.');
    }

    return this.dataSource.transaction(async (entityManager) => {
      let organizationId = createUserDto.organizationId || null;
      const isAgencyIntent = createUserDto.role === 'admin' || Boolean(createUserDto.organizationName);

      if (isAgencyIntent) {
        if (!createUserDto.organizationName || !createUserDto.organizationName.trim()) {
          throw new BadRequestException('Agency organization name is required for agency registration.');
        }
        const slug = createUserDto.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
        let org = entityManager.create(Organization, {
          name: createUserDto.organizationName.trim(),
          slug,
          email: createUserDto.email,
          subscriptionPlan: 'free',
          isApproved: false, // Pending admin approval
          status: 'pending',
        });
        org = await entityManager.save(org);
        organizationId = org.id;
      }

      const assignedRole = isAgencyIntent ? 'admin' : (createUserDto.role || 'user');

      const user = entityManager.create(User, {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: assignedRole,
        organizationId: organizationId || undefined,
      });

      return entityManager.save(user);
    });
  }

  async applyAgency(userId: string, organizationName: string): Promise<User> {
    const user = await this.findById(userId);
    if (!organizationName || !organizationName.trim()) {
      throw new BadRequestException('Agency organization name is required.');
    }

    if (user.organizationId) {
      const existingOrg = await this.dataSource.getRepository(Organization).findOne({ where: { id: user.organizationId } });
      if (existingOrg) {
        if (existingOrg.isApproved && existingOrg.status === 'approved') {
          throw new BadRequestException('Your account is already an approved agency.');
        }
        throw new BadRequestException(`Your agency application for "${existingOrg.name}" is already on file (status: ${existingOrg.status}).`);
      }
    }

    return this.dataSource.transaction(async (entityManager) => {
      const slug = organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
      let org = entityManager.create(Organization, {
        name: organizationName.trim(),
        slug,
        email: user.email,
        subscriptionPlan: 'free',
        isApproved: false,
        status: 'pending',
      });
      org = await entityManager.save(org);

      user.organizationId = org.id;
      user.role = 'admin';
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