import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('wishlist_items')
@Unique(['userId', 'itemType', 'itemId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  itemType: string;

  @Column()
  itemId: string;

  @CreateDateColumn()
  createdAt: Date;
}
