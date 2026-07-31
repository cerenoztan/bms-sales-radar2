import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('google_places')
export class GooglePlaceEntity {
  @PrimaryColumn()
  placeId!: string;

  @Column()
  district!: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  formattedAddress?: string;

  @Column({ nullable: true })
  googleMapsUri?: string;

  @CreateDateColumn()
  firstSeenAt!: Date;

  @UpdateDateColumn()
  lastSeenAt!: Date;
}