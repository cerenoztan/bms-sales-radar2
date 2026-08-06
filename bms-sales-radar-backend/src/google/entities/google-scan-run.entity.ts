import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum GoogleScanStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('google_scan_runs')
export class GoogleScanRunEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', default: GoogleScanStatus.RUNNING })
  status!: GoogleScanStatus;

  @Column({ type: 'integer', default: 0 })
  totalFound!: number;

  @Column({ type: 'integer', default: 0 })
  firstObservedCount!: number;

  @Column({ type: 'integer', default: 0 })
  confirmedCount!: number;

  @Column({ type: 'integer', default: 0 })
  successfulDistrictCount!: number;

  @Column({ type: 'integer', default: 0 })
  failedDistrictCount!: number;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
