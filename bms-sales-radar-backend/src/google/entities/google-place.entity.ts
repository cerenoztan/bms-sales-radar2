import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

export enum GooglePlaceComparisonStatus {
  BASELINE = 'BASELINE',
  CANDIDATE = 'CANDIDATE',
  CONFIRMED = 'CONFIRMED',
}

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
  nationalPhoneNumber?: string;

  @Column({ nullable: true })
  googleMapsUri?: string;

  @CreateDateColumn()
  firstSeenAt!: Date;

  @Column({ type: 'datetime' })
  lastSeenAt!: Date;

  @Column({ type: 'integer' })
  firstSeenRunId!: number;

  @Column({ type: 'integer' })
  lastSeenRunId!: number;

  @Column({ type: 'integer', default: 1 })
  seenCount!: number;

  @Column({
    type: 'text',
    default: GooglePlaceComparisonStatus.BASELINE,
  })
  comparisonStatus!: GooglePlaceComparisonStatus;

  @Column({ type: 'datetime', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'integer', nullable: true })
  confirmedRunId?: number;
}
