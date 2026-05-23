import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  findAll(storeId: number, userId?: number): Promise<Notification[]> {
    const where: Record<string, unknown> = { storeId, isRead: false };
    if (userId) where['userId'] = userId;
    return this.notificationRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(storeId: number, id: number): Promise<Notification> {
    const n = await this.notificationRepo.findOne({ where: { id, storeId } });
    if (!n) throw new NotFoundException('Notification not found');
    n.isRead = true;
    return this.notificationRepo.save(n);
  }

  async markAllRead(storeId: number, userId: number): Promise<void> {
    await this.notificationRepo.update(
      { storeId, userId, isRead: false },
      { isRead: true },
    );
  }
}
