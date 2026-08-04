import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/users.entity';
import { Permission } from '../permission/permission-entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @OneToMany(
    () => User,
    (user) => user.role,
  )
  users!: User[];

  @ManyToMany(
    () => Permission,
    (permission) => permission.roles,
  )
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permissionId',
      referencedColumnName: 'id',
    },
  })
  permissions!: Permission[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}