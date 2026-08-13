import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../roles/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  passwordResetTokenHash!: string | null;

  @Column({ type: 'datetime', nullable: true })
  passwordResetExpiresAt!: Date | null;

  @ManyToOne(
    () => Role,
    (role) => role.users,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  role?: Role;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  jobTitle?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
