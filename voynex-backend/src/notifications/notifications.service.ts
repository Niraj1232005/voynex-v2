import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>) {
    const notification = this.notificationsRepository.create(data);
    return this.notificationsRepository.save(notification);
  }

  async findByOrganization(organizationId: string) {
    return this.notificationsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    await this.notificationsRepository.update(id, { isRead: true });
    return { message: 'Notification marked as read' };
  }
}