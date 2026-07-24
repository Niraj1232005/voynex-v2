import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { Trip } from '../trips/trip.entity';
import { Rental } from '../rentals/rental.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private wishlistRepository: Repository<WishlistItem>,
    private dataSource: DataSource,
  ) {}

  async toggle(userId: string, itemType: string, itemId: string) {
    const existing = await this.wishlistRepository.findOne({
      where: { userId, itemType, itemId },
    });

    if (existing) {
      await this.wishlistRepository.remove(existing);
      return { saved: false, message: 'Removed from saved items' };
    } else {
      const item = this.wishlistRepository.create({ userId, itemType, itemId });
      await this.wishlistRepository.save(item);
      return { saved: true, message: 'Saved to wishlist' };
    }
  }

  async findByUser(userId: string) {
    const items = await this.wishlistRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const populated = await Promise.all(
      items.map(async (w) => {
        let details: any = null;
        if (w.itemType === 'trip') {
          const trip = await this.dataSource.getRepository(Trip).findOne({ where: { id: w.itemId } });
          if (trip) {
            details = {
              ...trip,
              _id: trip.id,
              duration: trip.durationDays,
              organization_id: trip.organizationId,
            };
          }
        } else if (w.itemType === 'rental') {
          const rental = await this.dataSource.getRepository(Rental).findOne({ where: { id: w.itemId } });
          if (rental) {
            details = {
              ...rental,
              _id: rental.id,
              price: Number(rental.pricePerDay),
            };
          }
        }
        return {
          ...w,
          _id: w.id,
          item: details,
        };
      })
    );

    return populated.filter(p => p.item !== null);
  }

  async remove(userId: string, id: string) {
    const item = await this.wishlistRepository.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Wishlist item not found');
    await this.wishlistRepository.remove(item);
    return { message: 'Item removed successfully' };
  }
}
